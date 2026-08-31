import os
import sys

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.domain import User, UserRole, Manufacturer, Instrument, AccuracyClassEnum, TestSession, SessionStatus
from backend.app.core.security import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users if not existing
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@legalmetrology.gov.in",
                full_name="Chief Administrator",
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN,
                lab_code="NPL-DELHI"
            )
            db.add(admin)

        tech = db.query(User).filter(User.username == "tech1").first()
        if not tech:
            tech = User(
                username="tech1",
                email="tech1@legalmetrology.gov.in",
                full_name="Rajesh Sharma (Senior Technician)",
                hashed_password=get_password_hash("Tech@123"),
                role=UserRole.LAB_TECHNICIAN,
                lab_code="NPL-DELHI"
            )
            db.add(tech)
        reviewer = db.query(User).filter(User.username == "reviewer1").first()
        if not reviewer:
            reviewer = User(
                username="reviewer1",
                email="reviewer1@legalmetrology.gov.in",
                full_name="Dr. Sunita Verma (Lead Reviewer)",
                hashed_password=get_password_hash("Reviewer@123"),
                role=UserRole.REVIEWER,
                lab_code="NPL-DELHI"
            )
            db.add(reviewer)

        db.commit()

        # 2. Seed Manufacturers
        mfg1 = db.query(Manufacturer).filter(Manufacturer.code == "MFG-METTLER").first()
        if not mfg1:
            mfg1 = Manufacturer(
                name="Mettler Toledo India Pvt Ltd",
                code="MFG-METTLER",
                address="Plot 12, Subhash Nagar, Industrial Area, Mumbai",
                contact_person="Amitabh Roy",
                email="contact@mettler.co.in",
                phone="+91-22-67890000",
                country="India",
                license_number="LM/IND/2024/0981"
            )
            db.add(mfg1)
            db.commit()
            db.refresh(mfg1)

        mfg2 = db.query(Manufacturer).filter(Manufacturer.code == "MFG-ESSAE").first()
        if not mfg2:
            mfg2 = Manufacturer(
                name="Essae Digitronics Pvt Ltd",
                code="MFG-ESSAE",
                address="Peenya Industrial Area, Bengaluru, Karnataka",
                contact_person="Suresh Kumar",
                email="info@essae.com",
                phone="+91-80-28391122",
                country="India",
                license_number="LM/IND/2023/0445"
            )
            db.add(mfg2)
            db.commit()
            db.refresh(mfg2)

        # 3. Seed Instruments
        inst1 = db.query(Instrument).filter(Instrument.serial_number == "SN-2026-X1").first()
        if not inst1:
            inst1 = Instrument(
                manufacturer_id=mfg1.id,
                model_name="Precision Balance PB-300",
                serial_number="SN-2026-X1",
                accuracy_class=AccuracyClassEnum.CLASS_II,
                max_capacity=3000.0, # 3000 g (3 kg)
                min_capacity=1.0,     # 1 g
                verification_scale_interval=0.1, # e = 0.1 g
                actual_scale_interval=0.01,       # d = 0.01 g
                unit="g",
                num_load_receptors=1,
                temperature_min=10.0,
                temperature_max=30.0,
                power_supply_spec="230V AC ±10%, 50Hz"
            )
            db.add(inst1)

        inst2 = db.query(Instrument).filter(Instrument.serial_number == "SN-2026-WB50T").first()
        if not inst2:
            inst2 = Instrument(
                manufacturer_id=mfg2.id,
                model_name="Commercial Platform Scale DS-500",
                serial_number="SN-2026-WB50T",
                accuracy_class=AccuracyClassEnum.CLASS_III,
                max_capacity=15.0, # 15 kg
                min_capacity=0.1,  # 100 g
                verification_scale_interval=0.005, # e = 5 g (0.005 kg)
                actual_scale_interval=0.005,       # d = 5 g
                unit="kg",
                num_load_receptors=1,
                temperature_min=-10.0,
                temperature_max=40.0,
                power_supply_spec="230V AC / 6V DC Battery"
            )
            db.add(inst2)

        db.commit()
        print("Database seeded successfully with default Admin, Lab Tech, Reviewer, Manufacturers, and Instruments!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
