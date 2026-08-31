export type UserRole = 'ADMIN' | 'LAB_TECHNICIAN' | 'REVIEWER' | 'VIEWER';
export type SessionStatus = 'DRAFT' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type AccuracyClass = 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IIII';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  lab_code: string;
  is_active: boolean;
  created_at: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  code: string;
  address?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  country: string;
  license_number?: string;
  created_at: string;
}

export interface Instrument {
  id: number;
  manufacturer_id: number;
  model_name: string;
  serial_number: string;
  accuracy_class: AccuracyClass;
  max_capacity: number;
  min_capacity: number;
  verification_scale_interval: number;
  actual_scale_interval: number;
  unit: string;
  num_load_receptors: number;
  temperature_min: number;
  temperature_max: number;
  power_supply_spec: string;
  photos_json?: string[];
  docs_json?: string[];
  created_at: string;
  manufacturer?: Manufacturer;
}

export interface TestObservation {
  id: number;
  session_id: number;
  test_type: string;
  raw_data_json: any;
  evaluated_data_json: any;
  is_passed: boolean;
  created_at: string;
}

export interface TestSession {
  id: number;
  session_code: string;
  instrument_id: number;
  technician_id: number;
  reviewer_id?: number;
  status: SessionStatus;
  test_date: string;
  temperature_c: number;
  humidity_percent: number;
  pressure_hpa: number;
  remarks?: string;
  report_pdf_path?: string;
  report_docx_path?: string;
  overall_pass: boolean;
  created_at: string;
  updated_at: string;
  instrument?: Instrument;
  technician?: User;
  reviewer?: User;
  observations: TestObservation[];
}

export interface DashboardStats {
  metrics: {
    total_sessions: number;
    approved_sessions: number;
    rejected_sessions: number;
    under_review: number;
    in_progress: number;
    total_instruments: number;
    total_manufacturers: number;
    approval_rate: number;
  };
  class_breakdown: { accuracy_class: string; count: number }[];
  recent_sessions: {
    id: number;
    session_code: string;
    model_name: string;
    status: string;
    test_date: string;
    overall_pass: boolean;
  }[];
}
