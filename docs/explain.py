"""
================================================================================
  NAWI TEST REPORT GENERATOR (SIH PROBLEM STATEMENT 26035)
  OIML R 76-1 Legal Metrology Web Application - Complete Explanation (Hinglish)
================================================================================

Namaste! Yeh file hamare NAWI Test Report Generator web application ke pure architecture,
codebase structure, mathematical engine (OIML R 76-1), frontend-backend workflows
aur step-by-step working ko Hinglish me detail se samjhati hai.

--------------------------------------------------------------------------------
1. PROJECT KA OVERVIEW & UNMATCHED PURPOSE (Yeh App Kya Karta Hai?)
--------------------------------------------------------------------------------
- Client / Department: Legal Metrology Department, Ministry of Consumer Affairs, Govt of India.
- Problem Statement: SIH Problem Statement 26035.
- Purpose: Non-Automatic Weighing Instruments (NAWI) - Jaise lab balances, commercial scales, 
  weighbridges - in sabki Type Evaluation aur Standardized Test Report Generation ko automate karna.
- Compliance Standard: OIML Recommendation R 76-1 (2006).

Pehle metrology officers manual calculations aur register me entry karte the jisse errors ke chances the.
Yeh web application real-time Maximum Permissible Error (MPE) calculate karta hai, observations record 
karta hai, audit trails rakhta hai, aur official Government-grade PDF & DOCX certificates generate karta hai.

--------------------------------------------------------------------------------
2. TECH STACK & SYSTEM ARCHITECTURE
--------------------------------------------------------------------------------
[FRONTEND]:
  - React.js (TypeScript) + Vite (Superfast bundling & hot reload)
  - TailwindCSS (Sleek modern dark/light UI design system)
  - Recharts (Analytics dashboard Graphs & charts)
  - Lucide React (Modern iconography)

[BACKEND]:
  - Python 3.13 + FastAPI (High performance async REST API framework)
  - SQLAlchemy ORM (Database connection & entity relationships)
  - Pydantic v2 (Strict request/response data validation & schema matching)
  - Alembic (Database migrations)

[DATABASE]:
  - SQLite (Zero-config local testing for instant execution: `./nawi_test.db`)
  - PostgreSQL 15+ (Production level enterprise database support)

[SECURITY & AUTHENTICATION]:
  - OAuth2 JWT Bearer Tokens (HS256 encryption with password hashing using bcrypt)
  - Role-Based Access Control (RBAC):
      1. ADMIN: User management, full system config, all reports view
      2. LAB_TECHNICIAN: Sessions create karna, test wizard me data bharna, draft reports
      3. REVIEWER: Test reports evaluate karna, approve/reject karna
      4. VIEWER: Read-only access & certificate search

[REPORT GENERATION ENGINES]:
  - ReportLab (Python): Non-tamperable official PDF Certificate generation (Govt emblem layout)
  - python-docx: Fully editable Word DOCX report generation for official customization

--------------------------------------------------------------------------------
3. FOLDER STRUCTURE & KEY FILES EXPLANATION
--------------------------------------------------------------------------------
FIFA/
├── .env                       <- Environment configurations (DB URL, JWT Secret, Lab Info)
├── backend/
│   ├── app/
│   │   ├── main.py            <- FastAPI app initialization, CORS middleware, router mounts
│   │   ├── config.py          <- Settings loads from .env using Pydantic BaseSettings
│   │   ├── database.py        <- SQLAlchemy Engine, SessionLocal, Base model
│   │   ├── models/
│   │   │   └── domain.py      <- DB Tables: User, Manufacturer, Instrument, TestSession, TestObservation, AuditLog
│   │   ├── schemas/
│   │   │   └── domain_schemas.py <- Pydantic validation schemas (UserCreate, InstrumentOut, etc.)
│   │   ├── core/
│   │   │   ├── security.py    <- JWT token generation, password hashing (bcrypt)
│   │   │   └── deps.py        <- Dependency injection (get_db, get_current_user, RoleChecker)
│   │   ├── services/
│   │   │   ├── oiml_engine.py <- OIML R 76-1 Mathematical engine & MPE calculations
│   │   │   ├── report_pdf.py  <- ReportLab PDF certificate generator
│   │   │   └── report_docx.py <- Python-docx Word report generator
│   │   └── api/
│   │       ├── auth.py        <- POST /login, GET /me
│   │       ├── users.py       <- User management endpoints
│   │       ├── manufacturers.py <- Manufacturer registry endpoints
│   │       ├── instruments.py <- Instrument registration & photo upload endpoints
│   │       ├── sessions.py    <- Test Session creation, Wizard observation saving, PDF/DOCX download
│   │       └── dashboard.py   <- Dashboard metrics & analytics statistics
│   ├── seed_data.py           <- Database seeding script (Creates default Admin, Tech, Reviewer, Instruments)
│   └── tests/                 <- Pytest test suite (test_api.py, test_oiml_engine.py)
└── frontend/
    ├── src/
    │   ├── App.tsx            <- Main React routing & authentication wrapper
    │   ├── components/        <- Header, Sidebar, MpeCalculatorModal
    │   ├── pages/             <- DashboardPage, ManufacturersPage, InstrumentsPage, SessionsPage, TestWizardPage
    │   └── services/api.ts    <- Axios API client with automatic JWT bearer header injection

--------------------------------------------------------------------------------
4. OIML R 76-1 MATHEMATICAL CALCULATION ENGINE (`oiml_engine.py`)
--------------------------------------------------------------------------------
OIML R 76-1 standard ke mutabiq, har weighing instrument (scale) ke 4 Accuracy Classes hote hain:
  - Class I    : Special (Fine lab balances, e.g. e = 0.001 g)
  - Class II   : High (Jewelry/analytical balances, e.g. e = 0.01 g)
  - Class III  : Medium (Commercial shop scales, weighbridges, e.g. e = 5 g)
  - Class IIII : Ordinary (Bulk industrial scales, e.g. e = 50 g)

[MPE (Maximum Permissible Error) Table 6 Formula]:
Load 'm' ko scale interval 'e' me convert kiya jata hai: load_in_e = m / e

Class III (Medium) Example:
  - 0 <= m/e <= 500      => MPE = ± 0.5 e
  - 500 < m/e <= 2000    => MPE = ± 1.0 e
  - m/e > 2000           => MPE = ± 1.5 e

Automated Evaluations in Code:
  1. Span / Linearity Test:
     Indication error E = Indication - Load. Check karte hain ki |E| <= MPE hai ya nahi.
  2. Repeatability Test:
     Same load par kam se kam 3 readings li jaati hain. Max_Reading - Min_Reading <= MPE hona chahiye.
  3. Eccentricity Test (Off-Center Load):
     Platform ke 5 positions (Center, Front-Left, Front-Right, Back-Left, Back-Right) par test hota hai.
  4. Discrimination Test:
     Scale par 1.4e ka extra weight rakhne par display me kam se kam 1e ka clear change aana chahiye.
  5. Temperature Test:
     20°C reference, min temp (-10°C), max temp (40°C) par zero drift aur error evaluate hota hai.
  6. Overload & Safety Check:
     Load Max + 9e se uper jaane par display blank/cut-off hona chahiye.

--------------------------------------------------------------------------------
5. STEP-BY-STEP END-TO-END WORKFLOW (App Kaise Kaam Karta Hai)
--------------------------------------------------------------------------------
STEP 1: LOGIN
  - User frontend URL `http://localhost:5173` par jata hai.
  - Default Admin credentials (`admin` / `Admin@123`) ya Tech (`tech1` / `Tech@123`) se login karta hai.
  - Backend JWT Token return karta hai jo localStorage me save hota hai.

STEP 2: MANUFACTURER & INSTRUMENT REGISTRATION
  - Manufacturer add kiya jata hai (e.g. Avery India Ltd, MFR Code: AVRY-01).
  - Instrument register hota hai (Model: EWB-30K, Serial: SN-101, Accuracy Class: Class III, Max: 30kg, e: 10g).

STEP 3: TEST SESSION CREATION
  - Lab Technician instrument select karke new Test Session create karta hai.
  - Unique Session Code generate hota hai (e.g. `NAWI-20260824-A1B2C3`). Status `DRAFT` set hota hai.

STEP 4: TEST WIZARD & DATA ENTRY
  - Technician "Test Wizard" open karta hai aur step-by-step observations enter karta hai:
      - Ambient Temperature (23°C), Humidity (55%)
      - Span Test readings
      - Repeatability 3 readings
      - Eccentricity 5 positions readings
  - Backend real-time me `oiml_engine.py` se evaluation karke PASS/FAIL declare karta hai.

STEP 5: SUBMISSION & REVIEWER APPROVAL
  - Tech evaluation submit karta hai. Status `UNDER_REVIEW` ho jata hai.
  - Reviewer (ya Admin) login karke compliance metrics inspect karta hai.
  - Reviewer "APPROVE" button click karta hai. Status `APPROVED` ho jata hai.

STEP 6: CERTIFICATE GENERATION & DOWNLOAD
  - User single click me:
      - **PDF Certificate**: Official non-tamperable certificate download kar sakta hai.
      - **DOCX Report**: Fully editable Word document download kar sakta hai.

--------------------------------------------------------------------------------
6. DEFAULT PRE-SEEDED CREDENTIALS
--------------------------------------------------------------------------------
Role            | Username  | Password     | Access Scope
----------------|-----------|--------------|---------------------------------------------
Admin           | admin     | Admin@123    | Full system control, User CRUD, Reports
Lab Technician  | tech1     | Tech@123     | Create Session, Test Wizard, Draft Reports
Reviewer        | reviewer1 | Reviewer@123 | Verify Test Observations, Approve/Reject

--------------------------------------------------------------------------------
7. HOW TO RUN THE APP
--------------------------------------------------------------------------------
1. Backend Run:
   $env:PYTHONPATH="."
   python backend/seed_data.py
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000

2. Frontend Run:
   cd frontend
   npm run dev

3. Test Suite Run:
   $env:PYTHONPATH="."
   python -m pytest backend/tests/
================================================================================
"""

import sys

def explain_app():
    print("==================================================================")
    print(" NAWI Test Report Generator (SIH Problem Statement 26035) ")
    print(" Legal Metrology Dept - Govt of India | OIML R 76-1 Standard")
    print("==================================================================")
    print("\n[OK] Project summary and detailed Hinglish guide written successfully!")
    print("[OK] You can open and read explain.py for full details anytime.")

if __name__ == "__main__":
    explain_app()
