import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    LAB_TECHNICIAN = "LAB_TECHNICIAN"
    REVIEWER = "REVIEWER"
    VIEWER = "VIEWER"


class SessionStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class AccuracyClassEnum(str, enum.Enum):
    CLASS_I = "CLASS_I"
    CLASS_II = "CLASS_II"
    CLASS_III = "CLASS_III"
    CLASS_IIII = "CLASS_IIII"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.LAB_TECHNICIAN, nullable=False)
    lab_code = Column(String(50), default="NPL-DELHI")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    test_sessions = relationship("TestSession", foreign_keys="TestSession.technician_id", back_populates="technician")
    reviewed_sessions = relationship("TestSession", foreign_keys="TestSession.reviewer_id", back_populates="reviewer")


class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    code = Column(String(50), unique=True, index=True)
    address = Column(Text, nullable=True)
    contact_person = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    country = Column(String(50), default="India")
    license_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    instruments = relationship("Instrument", back_populates="manufacturer")


class Instrument(Base):
    __tablename__ = "instruments"

    id = Column(Integer, primary_key=True, index=True)
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id"), nullable=False)
    model_name = Column(String(100), nullable=False, index=True)
    serial_number = Column(String(100), nullable=False, index=True)
    accuracy_class = Column(Enum(AccuracyClassEnum), default=AccuracyClassEnum.CLASS_III, nullable=False)
    max_capacity = Column(Float, nullable=False) # e.g. 15.0
    min_capacity = Column(Float, nullable=False) # e.g. 0.1
    verification_scale_interval = Column(Float, nullable=False) # e e.g. 0.005
    actual_scale_interval = Column(Float, nullable=False) # d e.g. 0.001
    unit = Column(String(10), default="kg")
    num_load_receptors = Column(Integer, default=1)
    temperature_min = Column(Float, default=-10.0)
    temperature_max = Column(Float, default=40.0)
    power_supply_spec = Column(String(100), default="230V AC, 50Hz")
    photos_json = Column(JSON, default=list)
    docs_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    manufacturer = relationship("Manufacturer", back_populates="instruments")
    sessions = relationship("TestSession", back_populates="instrument")


class TestSession(Base):
    __tablename__ = "test_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_code = Column(String(50), unique=True, index=True, nullable=False)
    instrument_id = Column(Integer, ForeignKey("instruments.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(SessionStatus), default=SessionStatus.DRAFT, nullable=False)
    test_date = Column(DateTime, default=datetime.utcnow)
    
    temperature_c = Column(Float, default=20.0)
    humidity_percent = Column(Float, default=50.0)
    pressure_hpa = Column(Float, default=1013.25)
    
    remarks = Column(Text, nullable=True)
    report_pdf_path = Column(String(255), nullable=True)
    report_docx_path = Column(String(255), nullable=True)
    overall_pass = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    instrument = relationship("Instrument", back_populates="sessions")
    technician = relationship("User", foreign_keys=[technician_id], back_populates="test_sessions")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviewed_sessions")
    observations = relationship("TestObservation", back_populates="session", cascade="all, delete-orphan")


class TestObservation(Base):
    __tablename__ = "test_observations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("test_sessions.id"), nullable=False)
    test_type = Column(String(50), nullable=False) # SPAN, REPEATABILITY, ECCENTRICITY, DISCRIMINATION, TEMPERATURE, DISTURBANCE, SAFETY
    raw_data_json = Column(JSON, nullable=False)
    evaluated_data_json = Column(JSON, nullable=False)
    is_passed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("TestSession", back_populates="observations")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    details_json = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
