export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            permissions: {
                Row: {
                    id: number
                    name: string
                    description: string | null
                    resource: string
                    action: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    description?: string | null
                    resource: string
                    action: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    description?: string | null
                    resource?: string
                    action?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            role_permissions: {
                Row: {
                    role_id: number
                    permission_id: number
                    created_at: string
                }
                Insert: {
                    role_id: number
                    permission_id: number
                    created_at?: string
                }
                Update: {
                    role_id?: number
                    permission_id?: number
                    created_at?: string
                }
            }
            roles: {
                Row: {
                    id: number
                    name: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            user_profiles: {
                Row: {
                    id: string
                    first_name: string | null
                    last_name: string | null
                    phone_number: string | null
                    date_of_birth: string | null
                    address: string | null
                    profile_image_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    first_name?: string | null
                    last_name?: string | null
                    phone_number?: string | null
                    date_of_birth?: string | null
                    address?: string | null
                    profile_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    first_name?: string | null
                    last_name?: string | null
                    phone_number?: string | null
                    date_of_birth?: string | null
                    address?: string | null
                    profile_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            user_roles: {
                Row: {
                    user_id: string
                    role_id: number
                    created_at: string
                }
                Insert: {
                    user_id: string
                    role_id: number
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    role_id?: number
                    created_at?: string
                }
            }
            patients: {
                Row: {
                    id: string
                    user_id: string | null
                    first_name: string
                    last_name: string
                    date_of_birth: string
                    gender: string
                    blood_type: string | null
                    address: string | null
                    phone_number: string | null
                    email: string | null
                    emergency_contact_name: string | null
                    emergency_contact_phone: string | null
                    insurance_provider: string | null
                    insurance_policy_number: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    first_name: string
                    last_name: string
                    date_of_birth: string
                    gender: string
                    blood_type?: string | null
                    address?: string | null
                    phone_number?: string | null
                    email?: string | null
                    emergency_contact_name?: string | null
                    emergency_contact_phone?: string | null
                    insurance_provider?: string | null
                    insurance_policy_number?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    first_name?: string
                    last_name?: string
                    date_of_birth?: string
                    gender?: string
                    blood_type?: string | null
                    address?: string | null
                    phone_number?: string | null
                    email?: string | null
                    emergency_contact_name?: string | null
                    emergency_contact_phone?: string | null
                    insurance_provider?: string | null
                    insurance_policy_number?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            medical_records: {
                Row: {
                    id: string
                    patient_id: string
                    doctor_id: string
                    visit_date: string
                    chief_complaint: string
                    diagnosis: string | null
                    treatment_plan: string | null
                    notes: string | null
                    follow_up_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    patient_id: string
                    doctor_id: string
                    visit_date?: string
                    chief_complaint: string
                    diagnosis?: string | null
                    treatment_plan?: string | null
                    notes?: string | null
                    follow_up_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    patient_id?: string
                    doctor_id?: string
                    visit_date?: string
                    chief_complaint?: string
                    diagnosis?: string | null
                    treatment_plan?: string | null
                    notes?: string | null
                    follow_up_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            vitals: {
                Row: {
                    id: string
                    medical_record_id: string
                    recorded_by: string
                    recorded_at: string
                    temperature: number | null
                    heart_rate: number | null
                    respiratory_rate: number | null
                    blood_pressure_systolic: number | null
                    blood_pressure_diastolic: number | null
                    oxygen_saturation: number | null
                    height: number | null
                    weight: number | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    medical_record_id: string
                    recorded_by: string
                    recorded_at?: string
                    temperature?: number | null
                    heart_rate?: number | null
                    respiratory_rate?: number | null
                    blood_pressure_systolic?: number | null
                    blood_pressure_diastolic?: number | null
                    oxygen_saturation?: number | null
                    height?: number | null
                    weight?: number | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    medical_record_id?: string
                    recorded_by?: string
                    recorded_at?: string
                    temperature?: number | null
                    heart_rate?: number | null
                    respiratory_rate?: number | null
                    blood_pressure_systolic?: number | null
                    blood_pressure_diastolic?: number | null
                    oxygen_saturation?: number | null
                    height?: number | null
                    weight?: number | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            prescriptions: {
                Row: {
                    id: string
                    medical_record_id: string
                    prescribed_by: string
                    medication_name: string
                    dosage: string
                    frequency: string
                    duration: string
                    instructions: string | null
                    status: string
                    prescribed_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    medical_record_id: string
                    prescribed_by: string
                    medication_name: string
                    dosage: string
                    frequency: string
                    duration: string
                    instructions?: string | null
                    status?: string
                    prescribed_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    medical_record_id?: string
                    prescribed_by?: string
                    medication_name?: string
                    dosage?: string
                    frequency?: string
                    duration?: string
                    instructions?: string | null
                    status?: string
                    prescribed_at?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            lab_tests: {
                Row: {
                    id: string
                    medical_record_id: string
                    ordered_by: string
                    test_name: string
                    test_description: string | null
                    status: string
                    ordered_at: string
                    completed_at: string | null
                    results: string | null
                    result_notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    medical_record_id: string
                    ordered_by: string
                    test_name: string
                    test_description?: string | null
                    status?: string
                    ordered_at?: string
                    completed_at?: string | null
                    results?: string | null
                    result_notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    medical_record_id?: string
                    ordered_by?: string
                    test_name?: string
                    test_description?: string | null
                    status?: string
                    ordered_at?: string
                    completed_at?: string | null
                    results?: string | null
                    result_notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            audit_logs: {
                Row: {
                    id: string
                    user_id: string | null
                    action: string
                    resource_type: string
                    resource_id: string | null
                    details: Json | null
                    ip_address: string | null
                    user_agent: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    action: string
                    resource_type: string
                    resource_id?: string | null
                    details?: Json | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    action?: string
                    resource_type?: string
                    resource_id?: string | null
                    details?: Json | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
            }
        }
    }
    auth: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                }
            }
        }
    }
}
