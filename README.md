# NAWI Test Report Generator (SIH Problem Statement 26035)

> **Government-Grade Web Application for Automating Non-Automatic Weighing Instruments (NAWI) Type Evaluation & Standardized Test Report Generation as per OIML Recommendation R 76**
> Developed for **Legal Metrology Department, Ministry of Consumer Affairs, Food & Public Distribution, Government of India**.

---

## Technical Stack

- **Frontend**: React.js (TypeScript, Vite), TailwindCSS, Recharts, Lucide React
- **Backend**: Python FastAPI, SQLAlchemy ORM, Pydantic v2, Alembic
- **Database**: PostgreSQL 15+ (with SQLite auto-fallback for zero-config local testing)
- **Auth**: JWT Authentication with Role-Based Access Control (`ADMIN`, `LAB_TECHNICIAN`, `REVIEWER`, `VIEWER`)
- **Report Generation**: ReportLab (Official PDF Certificates) & `python-docx` (Editable Word DOCX Reports)
- **Testing**: Pytest + pytest-asyncio (Backend), Vitest / TypeScript Compiler (Frontend)
- **Containerization**: Docker & Docker Compose

---

## Core Features

1. **OIML R 76-1 Calculation Engine**:
   - Auto-calculates Maximum Permissible Error (MPE) for Accuracy Classes **I, II, III, and IIII** based on verification scale interval $e$ and applied load $m$.
   - Evaluates Weighing Span & Linearity, Repeatability (min 3 readings), Eccentricity (5 positions), Discrimination ($1.4e$), Temperature Effect, and Safety/Overload (> Max + 9e).

2. **Standardized Report Generation**:
   - **PDF Generator**: Non-tamperable official report with Government of India header, laboratory conditions, observation tables, and signature blocks.
   - **DOCX Generator**: Fully editable Word format for administrative customization.

3. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full system management, user creation, report overview.
   - **Lab Technician**: Record observations, launch test wizards, generate drafts.
   - **Reviewer**: Approve or reject test reports.
   - **Viewer**: Read-only repository search & inspection.

4. **Live Interactive MPE Calculator**:
   - Instant inline calculator in the header for calculating MPE limits for any load and scale interval on the fly.

---

## Default Login Credentials (Pre-seeded)

| Role | Username | Password | Access Scope |
|---|---|---|---|
| **Admin** | `admin` | `Admin@123` | Full Access (User CRUD, All Reports, Config) |
| **Lab Technician** | `tech1` | `Tech@123` | Session Creation, Observation Entry, Drafts |
| **Reviewer** | `reviewer1` | `Reviewer@123` | Report Verification, Approval/Rejection |

---

## How to Run Locally

### 1. Backend Setup & Startup
```bash
# Set Python Path & Run Seed Script (creates database & initial users/manufacturers/instruments)
$env:PYTHONPATH="."
python backend/seed_data.py

# Run FastAPI Server
uvicorn backend.app.main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup & Startup
```bash
cd frontend
npm run dev
```
- App URL: `http://localhost:5173`

### 3. Run Pytest Suite
```bash
$env:PYTHONPATH="."
python -m pytest backend/tests/
```

### 4. Run via Docker Compose
```bash
docker-compose up --build
```

---

## Standard Compliance & Calculation Methodology

### OIML R 76-1 Table 6 (Initial Verification MPE Tiers)

For load $m$ expressed in scale intervals $e$ ($m/e$):

- **Class I**:
  - $0 \le m/e \le 50,000 \implies \text{MPE} = \pm 0.5e$
  - $50,000 < m/e \le 200,000 \implies \text{MPE} = \pm 1.0e$
  - $m/e > 200,000 \implies \text{MPE} = \pm 1.5e$

- **Class II**:
  - $0 \le m/e \le 5,000 \implies \text{MPE} = \pm 0.5e$
  - $5,000 < m/e \le 20,000 \implies \text{MPE} = \pm 1.0e$
  - $20,000 < m/e \le 100,000 \implies \text{MPE} = \pm 1.5e$

- **Class III**:
  - $0 \le m/e \le 500 \implies \text{MPE} = \pm 0.5e$
  - $500 < m/e \le 2,000 \implies \text{MPE} = \pm 1.0e$
  - $2,000 < m/e \le 10,000 \implies \text{MPE} = \pm 1.5e$

- **Class IIII**:
  - $0 \le m/e \le 50 \implies \text{MPE} = \pm 0.5e$
  - $50 < m/e \le 200 \implies \text{MPE} = \pm 1.0e$
  - $200 < m/e \le 1,000 \implies \text{MPE} = \pm 1.5e$
