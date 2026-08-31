import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.domain import Instrument, Manufacturer, User, UserRole, AuditLog
from backend.app.schemas.domain_schemas import InstrumentOut, InstrumentCreate
from backend.app.core.deps import get_current_user

router = APIRouter(prefix="/instruments", tags=["Instrument Registry"])


@router.get("", response_model=List[InstrumentOut])
def list_instruments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Instrument).all()


@router.get("/{inst_id}", response_model=InstrumentOut)
def get_instrument(inst_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inst = db.query(Instrument).filter(Instrument.id == inst_id).first()
    if not inst:
        raise HTTPException(status_code=44, detail="Instrument not found")
    return inst


@router.post("", response_model=InstrumentOut)
def create_instrument(inst_in: InstrumentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.VIEWER:
        raise HTTPException(status_code=403, detail="Viewers cannot create instruments")

    mfg = db.query(Manufacturer).filter(Manufacturer.id == inst_in.manufacturer_id).first()
    if not mfg:
        raise HTTPException(status_code=404, detail="Manufacturer not found")

    inst = Instrument(**inst_in.model_dump())
    db.add(inst)
    db.commit()
    db.refresh(inst)

    audit = AuditLog(user_id=current_user.id, action="CREATE_INSTRUMENT", resource="INSTRUMENTS", details_json={"inst_id": inst.id, "model": inst.model_name})
    db.add(audit)
    db.commit()

    return inst


@router.post("/{inst_id}/upload-photo")
async def upload_instrument_photo(inst_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inst = db.query(Instrument).filter(Instrument.id == inst_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Instrument not found")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    filename = f"photo_{inst_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    photos = list(inst.photos_json or [])
    photos.append(filepath)
    inst.photos_json = photos
    db.commit()

    return {"message": "Photo uploaded successfully", "filepath": filepath}
