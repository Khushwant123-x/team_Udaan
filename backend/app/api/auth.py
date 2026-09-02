from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.domain import User, UserRole, AuditLog
from backend.app.schemas.domain_schemas import Token, UserOut, UserCreate, UserLogin
from backend.app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from backend.app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")

    access_token = create_access_token(subject=user.username)
    refresh_token = create_refresh_token(subject=user.username)

    # Log audit safely
    try:
        audit = AuditLog(user_id=user.id, action="LOGIN", resource="AUTH", details_json={"username": user.username})
        db.add(audit)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Audit log write warning: {e}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "lab_code": user.lab_code
        }
    }


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
