from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.domain import User, UserRole, AuditLog
from backend.app.schemas.domain_schemas import UserOut, UserCreate
from backend.app.core.security import get_password_hash
from backend.app.core.deps import get_current_user, RoleChecker

router = APIRouter(prefix="/users", tags=["Users Management"])
admin_only = RoleChecker([UserRole.ADMIN])


@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    return db.query(User).all()


@router.post("", response_model=UserOut)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        lab_code=user_in.lab_code or "NPL-DELHI"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    audit = AuditLog(user_id=current_user.id, action="CREATE_USER", resource="USERS", details_json={"created_user_id": user.id})
    db.add(audit)
    db.commit()

    return user
