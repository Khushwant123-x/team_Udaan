from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from backend.app.models.domain import UserRole, SessionStatus, AccuracyClassEnum


# Auth Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.LAB_TECHNICIAN
    lab_code: Optional[str] = "NPL-DELHI"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    full_name: str
    role: UserRole
    lab_code: str
    is_active: bool
    created_at: datetime


# Manufacturer Schemas
class ManufacturerCreate(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = "India"
    license_number: Optional[str] = None


class ManufacturerOut(ManufacturerCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# Instrument Schemas
class InstrumentCreate(BaseModel):
    manufacturer_id: int
    model_name: str
    serial_number: str
    accuracy_class: AccuracyClassEnum = AccuracyClassEnum.CLASS_III
    max_capacity: float
    min_capacity: float
    verification_scale_interval: float
    actual_scale_interval: float
    unit: str = "kg"
    num_load_receptors: int = 1
    temperature_min: float = -10.0
    temperature_max: float = 40.0
    power_supply_spec: str = "230V AC, 50Hz"


class InstrumentOut(InstrumentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    photos_json: List[str] = []
    docs_json: List[str] = []
    created_at: datetime
    manufacturer: Optional[ManufacturerOut] = None


# Test Session Schemas
class TestSessionCreate(BaseModel):
    instrument_id: int
    test_date: Optional[datetime] = None
    temperature_c: float = 20.0
    humidity_percent: float = 50.0
    pressure_hpa: float = 1013.25
    remarks: Optional[str] = None


class TestSessionUpdate(BaseModel):
    status: Optional[SessionStatus] = None
    reviewer_id: Optional[int] = None
    temperature_c: Optional[float] = None
    humidity_percent: Optional[float] = None
    pressure_hpa: Optional[float] = None
    remarks: Optional[str] = None


class TestObservationCreate(BaseModel):
    session_id: int
    test_type: str
    raw_data_json: Dict[str, Any]


class TestObservationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    test_type: str
    raw_data_json: Dict[str, Any]
    evaluated_data_json: Dict[str, Any]
    is_passed: bool
    created_at: datetime


class TestSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_code: str
    instrument_id: int
    technician_id: int
    reviewer_id: Optional[int] = None
    status: SessionStatus
    test_date: datetime
    temperature_c: float
    humidity_percent: float
    pressure_hpa: float
    remarks: Optional[str] = None
    report_pdf_path: Optional[str] = None
    report_docx_path: Optional[str] = None
    overall_pass: bool
    created_at: datetime
    updated_at: datetime

    instrument: Optional[InstrumentOut] = None
    technician: Optional[UserOut] = None
    reviewer: Optional[UserOut] = None
    observations: List[TestObservationOut] = []
