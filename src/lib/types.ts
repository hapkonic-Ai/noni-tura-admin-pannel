export interface Admin {
  id: string;
  name: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  logo_url?: string;
  address?: string;
  contact?: string;
  registration_number?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  phone: string;
  specialty: string;
  hospital_id?: string;
  hospital?: Hospital;
  is_active: boolean;
  created_at: string;
}

export interface Nurse {
  id: string;
  name: string;
  phone: string;
  doctor_id: string;
  doctor?: Doctor;
  hospital_id?: string;
  hospital?: Hospital;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  blood_group?: string;
  allergies?: string;
  parent_name: string;
  parent_phone: string;
  doctor_id: string;
  doctor?: Doctor;
  hospital_id?: string;
  hospital?: Hospital;
  created_at: string;
}

export interface ConsentContentTemplate {
  id: string;
  name: string;
  procedure: string;
  procedure_description?: string;
  anesthesia: string[];
  risks: string[];
  benefits: string[];
  alternatives: string[];
  possible_complications: string[];
  material_risks?: string;
  post_op_care?: string;
  expected_recovery?: string;
  statutory_reference?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LayoutBlock {
  id: string;
  type: string;
  title?: string;
  visible?: boolean;
  content?: string;
  height?: string;
  align?: "left" | "center" | "right";
  columns?: 1 | 2;
}

export interface LayoutStyles {
  page_size?: "A4" | "Letter";
  page_margins?: string;
  primary_color?: string;
  font_family?: string;
  font_size?: string;
  line_height?: string;
  section_spacing?: string;
  border_style?: "none" | "solid" | "dashed";
}

export interface ConsentLayoutTemplate {
  id: string;
  name: string;
  html?: string;
  blocks_json?: LayoutBlock[];
  styles_json?: LayoutStyles;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsentForm {
  id: string;
  admission_id: string;
  patient_id: string;
  doctor_id: string;
  form_type: string;
  status: string;
  pdf_url?: string;
  signed_pdf_url?: string;
  generated_at: string;
  signed_at?: string;
  consent_number?: string;
  patient?: Patient;
  doctor?: Doctor;
}
