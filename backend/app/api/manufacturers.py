from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.domain import Manufacturer, User, UserRole, AuditLog
from backend.app.schemas.domain_schemas import ManufacturerOut, ManufacturerCreate
from backend.app.core.deps import get_current_user, RoleChecker

router = APIRouter(prefix="/manufacturers", tags=["Manufacturer Registry"])


@router.get("", response_model=List[ManufacturerOut])
def list_manufacturers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Manufacturer).all()


@router.post("", response_model=ManufacturerOut)
def create_manufacturer(mfg_in: ManufacturerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.VIEWER:
        raise HTTPException(status_code=403, detail="Viewers cannot create manufacturers")

    existing = db.query(Manufacturer).filter(Manufacturer.code == mfg_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Manufacturer code already exists")

    mfg = Manufacturer(**mfg_in.model_dump())
    db.add(mfg)
    db.commit()
    db.refresh(mfg)

    audit = AuditLog(user_id=current_user.id, action="CREATE_MANUFACTURER", resource="MANUFACTURERS", details_json={"mfg_id": mfg.id, "name": mfg.name})
    db.add(audit)
    db.commit()

    return mfg
