from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app.models.domain import TestSession, SessionStatus, Instrument, Manufacturer, User, UserRole
from backend.app.core.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Metrics"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_sessions = db.query(TestSession).count()
    approved_sessions = db.query(TestSession).filter(TestSession.status == SessionStatus.APPROVED).count()
    rejected_sessions = db.query(TestSession).filter(TestSession.status == SessionStatus.REJECTED).count()
    under_review = db.query(TestSession).filter(TestSession.status == SessionStatus.UNDER_REVIEW).count()
    in_progress = db.query(TestSession).filter(TestSession.status == SessionStatus.IN_PROGRESS).count()

    total_instruments = db.query(Instrument).count()
    total_manufacturers = db.query(Manufacturer).count()

    # Accuracy Class breakdown
    class_counts = db.query(Instrument.accuracy_class, func.count(Instrument.id))\
        .group_by(Instrument.accuracy_class).all()
    
    class_breakdown = [{"accuracy_class": c[0].value, "count": c[1]} for c in class_counts]

    # Recent sessions
    recent_sessions = db.query(TestSession).order_by(TestSession.created_at.desc()).limit(5).all()
    recent_data = [
        {
            "id": s.id,
            "session_code": s.session_code,
            "model_name": s.instrument.model_name if s.instrument else "N/A",
            "status": s.status.value,
            "test_date": s.test_date.strftime("%Y-%m-%d"),
            "overall_pass": s.overall_pass
        }
        for s in recent_sessions
    ]

    return {
        "metrics": {
            "total_sessions": total_sessions,
            "approved_sessions": approved_sessions,
            "rejected_sessions": rejected_sessions,
            "under_review": under_review,
            "in_progress": in_progress,
            "total_instruments": total_instruments,
            "total_manufacturers": total_manufacturers,
            "approval_rate": round((approved_sessions / total_sessions * 100), 1) if total_sessions > 0 else 0
        },
        "class_breakdown": class_breakdown,
        "recent_sessions": recent_data
    }
