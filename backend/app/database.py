import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
from backend.app.config import settings

db_url = settings.get_database_url

connect_args = {}
engine_kwargs = {"pool_pre_ping": True}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 30}
    if ":memory:" in db_url:
        engine_kwargs["poolclass"] = StaticPool

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_db_initialized = False


def ensure_db_initialized():
    global _db_initialized
    if _db_initialized:
        return
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            from backend.app.models.domain import User, UserRole
            from backend.app.core.security import get_password_hash

            default_users = [
                ("admin", "Admin@123", "admin@legalmetrology.gov.in", "Chief Administrator", UserRole.ADMIN),
                ("tech1", "Tech@123", "tech1@legalmetrology.gov.in", "Rajesh Sharma (Senior Technician)", UserRole.LAB_TECHNICIAN),
                ("reviewer1", "Reviewer@123", "reviewer1@legalmetrology.gov.in", "Dr. V. K. Verma (Metrology Reviewer)", UserRole.REVIEWER),
            ]

            updated = False
            for username, password, email, full_name, role in default_users:
                u = db.query(User).filter(User.username == username).first()
                if not u:
                    u = User(
                        username=username,
                        email=email,
                        full_name=full_name,
                        hashed_password=get_password_hash(password),
                        role=role,
                        lab_code="NPL-DELHI"
                    )
                    db.add(u)
                    updated = True
                elif u.hashed_password.startswith("$2b$") or u.hashed_password.startswith("$2a$"):
                    u.hashed_password = get_password_hash(password)
                    updated = True

            if updated:
                db.commit()

            from backend.app.models.domain import Manufacturer
            if not db.query(Manufacturer).first():
                from backend.seed_data import seed_db
                seed_db()
        finally:
            db.close()
        _db_initialized = True
    except Exception as e:
        print(f"Database init warning: {e}")


def get_db():
    ensure_db_initialized()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

