from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.config import settings

db_url = settings.get_database_url

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_db_initialized():
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            from backend.app.models.domain import User
            admin_user = db.query(User).filter(User.username == "admin").first()
            if not admin_user:
                from backend.seed_data import seed_db
                seed_db()
            else:
                from backend.app.core.security import get_password_hash
                default_credentials = {
                    "admin": "Admin@123",
                    "tech1": "Tech@123",
                    "reviewer1": "Reviewer@123"
                }
                updated = False
                for username, plain_pwd in default_credentials.items():
                    user = db.query(User).filter(User.username == username).first()
                    if user and (user.hashed_password.startswith("$2b$") or user.hashed_password.startswith("$2a$")):
                        user.hashed_password = get_password_hash(plain_pwd)
                        updated = True
                if updated:
                    db.commit()
        finally:
            db.close()
    except Exception as e:
        print(f"Database init warning: {e}")


def get_db():
    ensure_db_initialized()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
