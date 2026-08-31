import os
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.domain import (
    TestSession, SessionStatus, Instrument, Manufacturer, TestObservation, User, UserRole, AuditLog
)
from backend.app.schemas.domain_schemas import (
    TestSessionOut, TestSessionCreate, TestSessionUpdate, TestObservationCreate, TestObservationOut
)
from backend.app.services.oiml_engine import evaluate_full_session
from backend.app.services.report_pdf import generate_nawi_pdf_report
from backend.app.services.report_docx import generate_nawi_docx_report
from backend.app.core.deps import get_current_user

router = APIRouter(prefix="/sessions", tags=["Test Sessions & OIML Reports"])


@router.get("", response_model=List[TestSessionOut])
def list_sessions(
    status_filter: Optional[SessionStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TestSession)
    if status_filter:
        query = query.filter(TestSession.status == status_filter)
    return query.order_by(TestSession.created_at.desc()).all()


@router.post("", response_model=TestSessionOut)
def create_session(
    sess_in: TestSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.LAB_TECHNICIAN]:
        raise HTTPException(status_code=403, detail="Only Lab Technicians or Admins can create test sessions")

    inst = db.query(Instrument).filter(Instrument.id == sess_in.instrument_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")

    session_code = f"NAWI-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    session = TestSession(
        session_code=session_code,
        instrument_id=sess_in.instrument_id,
        technician_id=current_user.id,
        status=SessionStatus.DRAFT,
        test_date=sess_in.test_date or datetime.utcnow(),
        temperature_c=sess_in.temperature_c,
        humidity_percent=sess_in.humidity_percent,
        pressure_hpa=sess_in.pressure_hpa,
        remarks=sess_in.remarks
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    audit = AuditLog(user_id=current_user.id, action="CREATE_SESSION", resource="SESSIONS", details_json={"session_id": session.id, "code": session.session_code})
    db.add(audit)
    db.commit()

    return session


@router.get("/{session_id}", response_model=TestSessionOut)
def get_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")
    return session


@router.patch("/{session_id}", response_model=TestSessionOut)
def update_session(
    session_id: int,
    sess_in: TestSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")

    if sess_in.status:
        if sess_in.status in [SessionStatus.APPROVED, SessionStatus.REJECTED]:
            if current_user.role not in [UserRole.ADMIN, UserRole.REVIEWER]:
                raise HTTPException(status_code=403, detail="Only Reviewers or Admins can approve/reject reports")
            session.reviewer_id = current_user.id

        session.status = sess_in.status

    if sess_in.temperature_c is not None:
        session.temperature_c = sess_in.temperature_c
    if sess_in.humidity_percent is not None:
        session.humidity_percent = sess_in.humidity_percent
    if sess_in.pressure_hpa is not None:
        session.pressure_hpa = sess_in.pressure_hpa
    if sess_in.remarks is not None:
        session.remarks = sess_in.remarks

    db.commit()
    db.refresh(session)
    return session


@router.post("/{session_id}/observations", response_model=TestObservationOut)
def record_observation(
    session_id: int,
    obs_in: TestObservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")

    inst = db.query(Instrument).filter(Instrument.id == session.instrument_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument details missing")

    # Perform evaluation on this test type
    raw_data = obs_in.raw_data_json
    test_type = obs_in.test_type.upper()

    eval_result = {}
    is_passed = True

    # Pack into session payload for OIML engine evaluation
    session_data = {test_type.lower() + "_test": raw_data}
    inst_specs = {
        "accuracy_class": inst.accuracy_class.value,
        "verification_scale_interval": inst.verification_scale_interval,
        "max_capacity": inst.max_capacity
    }

    full_eval = evaluate_full_session(session_data, inst_specs)
    test_res = full_eval.get("test_results", {}).get(test_type.lower() + "_test", {})
    is_passed = test_res.get("status") == "PASS"

    # Save observation
    obs = TestObservation(
        session_id=session_id,
        test_type=test_type,
        raw_data_json=raw_data,
        evaluated_data_json=test_res,
        is_passed=is_passed
    )
    db.add(obs)

    # Update session status to IN_PROGRESS if DRAFT
    if session.status == SessionStatus.DRAFT:
        session.status = SessionStatus.IN_PROGRESS

    db.commit()
    db.refresh(obs)
    return obs


@router.post("/{session_id}/evaluate", response_model=TestSessionOut)
def evaluate_and_finalize_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")

    inst = db.query(Instrument).filter(Instrument.id == session.instrument_id).first()
    
    # Collect all observations
    session_obs = {}
    for obs in session.observations:
        key = obs.test_type.lower() + "_test"
        session_obs[key] = obs.raw_data_json

    inst_specs = {
        "accuracy_class": inst.accuracy_class.value,
        "verification_scale_interval": inst.verification_scale_interval,
        "max_capacity": inst.max_capacity
    }

    full_eval = evaluate_full_session(session_obs, inst_specs)
    overall_status = full_eval.get("overall_status") # APPROVED or REJECTED

    session.overall_pass = (overall_status == "APPROVED")
    session.status = SessionStatus.UNDER_REVIEW

    db.commit()
    db.refresh(session)
    return session


@router.get("/{session_id}/pdf")
def download_pdf_report(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")

    inst = db.query(Instrument).filter(Instrument.id == session.instrument_id).first()
    mfg = db.query(Manufacturer).filter(Manufacturer.id == inst.manufacturer_id).first()

    # Re-evaluate for accurate report rendering
    session_obs = {}
    for obs in session.observations:
        key = obs.test_type.lower() + "_test"
        session_obs[key] = obs.raw_data_json

    inst_specs = {
        "accuracy_class": inst.accuracy_class.value,
        "verification_scale_interval": inst.verification_scale_interval,
        "max_capacity": inst.max_capacity
    }

    full_eval = evaluate_full_session(session_obs, inst_specs)

    session_dict = {
        "session_code": session.session_code,
        "test_date": session.test_date.strftime("%Y-%m-%d"),
        "status": session.status.value if hasattr(session.status, 'value') else str(session.status),
        "temperature_c": session.temperature_c,
        "humidity_percent": session.humidity_percent,
        "pressure_hpa": session.pressure_hpa,
        "testing_officer": session.technician.full_name if session.technician else "Official Technician",
        "reviewer_name": session.reviewer.full_name if session.reviewer else "Legal Metrology Reviewer"
    }

    inst_dict = {
        "model_name": inst.model_name,
        "serial_number": inst.serial_number,
        "accuracy_class": inst.accuracy_class.value if hasattr(inst.accuracy_class, 'value') else str(inst.accuracy_class),
        "max_capacity": inst.max_capacity,
        "verification_scale_interval": inst.verification_scale_interval,
        "actual_scale_interval": inst.actual_scale_interval,
        "unit": inst.unit
    }

    mfg_dict = {
        "name": mfg.name if mfg else "N/A",
        "country": mfg.country if mfg else "India"
    }

    pdf_bytes = generate_nawi_pdf_report(session_dict, inst_dict, mfg_dict, full_eval)
    
    filename = f"OIML_R76_Report_{session.session_code}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{session_id}/docx")
def download_docx_report(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(TestSession).filter(TestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")

    inst = db.query(Instrument).filter(Instrument.id == session.instrument_id).first()
    mfg = db.query(Manufacturer).filter(Manufacturer.id == inst.manufacturer_id).first()

    session_obs = {}
    for obs in session.observations:
        key = obs.test_type.lower() + "_test"
        session_obs[key] = obs.raw_data_json

    inst_specs = {
        "accuracy_class": inst.accuracy_class.value if hasattr(inst.accuracy_class, 'value') else str(inst.accuracy_class),
        "verification_scale_interval": inst.verification_scale_interval,
        "max_capacity": inst.max_capacity
    }

    full_eval = evaluate_full_session(session_obs, inst_specs)

    session_dict = {
        "session_code": session.session_code,
        "test_date": session.test_date.strftime("%Y-%m-%d"),
        "status": session.status.value if hasattr(session.status, 'value') else str(session.status),
        "temperature_c": session.temperature_c,
        "humidity_percent": session.humidity_percent,
        "pressure_hpa": session.pressure_hpa,
        "testing_officer": session.technician.full_name if session.technician else "Official Technician",
        "reviewer_name": session.reviewer.full_name if session.reviewer else "Legal Metrology Reviewer"
    }

    inst_dict = {
        "model_name": inst.model_name,
        "serial_number": inst.serial_number,
        "accuracy_class": inst.accuracy_class.value,
        "max_capacity": inst.max_capacity,
        "verification_scale_interval": inst.verification_scale_interval,
        "unit": inst.unit
    }

    mfg_dict = {
        "name": mfg.name if mfg else "N/A",
        "country": mfg.country if mfg else "India"
    }

    docx_bytes = generate_nawi_docx_report(session_dict, inst_dict, mfg_dict, full_eval)
    
    filename = f"OIML_R76_Report_{session.session_code}.docx"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
