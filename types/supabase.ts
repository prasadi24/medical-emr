import type React from "react"
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Add this type definition at the top of the file if it doesn't exist
type SidebarItem = {
    title: string
    href: string
    icon: React.ElementType
    roles?: string[]
    subItems?: {
        title: string
        href: string
    }[]
}

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
            clinics: {
                Row: {
                    id: string
                    name: string
                    address: string
                    phone_number: string
                    email: string | null
                    website: string | null
                    opening_hours: Json | null
                    facilities: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    address: string
                    phone_number: string
                    email?: string | null
                    website?: string | null
                    opening_hours?: Json | null
                    facilities?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    address?: string
                    phone_number?: string
                    email?: string | null
                    website?: string | null
                    opening_hours?: Json | null
                    facilities?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
            }
            employment_types: {
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
            specialties: {
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
            doctors: {
                Row: {
                    id: string
                    user_id: string
                    specialty_id: number | null
                    license_number: string
                    employment_type_id: number | null
                    clinic_id: string | null
                    consultation_fee: number | null
                    education: string[] | null
                    experience: number | null
                    bio: string | null
                    languages: string[] | null
                    available_days: string[] | null
                    available_hours: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    specialty_id?: number | null
                    license_number: string
                    employment_type_id?: number | null
                    clinic_id?: string | null
                    consultation_fee?: number | null
                    education?: string[] | null
                    experience?: number | null
                    bio?: string | null
                    languages?: string[] | null
                    available_days?: string[] | null
                    available_hours?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    specialty_id?: number | null
                    license_number?: string
                    employment_type_id?: number | null
                    clinic_id?: string | null
                    consultation_fee?: number | null
                    education?: string[] | null
                    experience?: number | null
                    bio?: string | null
                    languages?: string[] | null
                    available_days?: string[] | null
                    available_hours?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            staff: {
                Row: {
                    id: string
                    user_id: string
                    position: string
                    employment_type_id: number | null
                    clinic_id: string | null
                    department: string | null
                    hire_date: string
                    education: string[] | null
                    certifications: string[] | null
                    languages: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    position: string
                    employment_type_id?: number | null
                    clinic_id?: string | null
                    department?: string | null
                    hire_date: string
                    education?: string[] | null
                    certifications?: string[] | null
                    languages?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    position?: string
                    employment_type_id?: number | null
                    clinic_id?: string | null
                    department?: string | null
                    hire_date?: string
                    education?: string[] | null
                    certifications?: string[] | null
                    languages?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
            }
            lab_test_categories: {
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
            lab_test_types: {
                Row: {
                    id: number
                    category_id: number | null
                    name: string
                    description: string | null
                    price: number
                    preparation_instructions: string | null
                    result_turnaround_time: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    category_id?: number | null
                    name: string
                    description?: string | null
                    price: number
                    preparation_instructions?: string | null
                    result_turnaround_time?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    category_id?: number | null
                    name?: string
                    description?: string | null
                    price?: number
                    preparation_instructions?: string | null
                    result_turnaround_time?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            appointments: {
                Row: {
                    id: string
                    patient_id: string
                    doctor_id: string
                    clinic_id: string
                    appointment_date: string
                    duration: number
                    status: string
                    type: string
                    reason: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    patient_id: string
                    doctor_id: string
                    clinic_id: string
                    appointment_date: string
                    duration?: number
                    status?: string
                    type?: string
                    reason?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    patient_id?: string
                    doctor_id?: string
                    clinic_id?: string
                    appointment_date?: string
                    duration?: number
                    status?: string
                    type?: string
                    reason?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            billing_items: {
                Row: {
                    id: number
                    name: string
                    description: string | null
                    category: string
                    price: number
                    taxable: boolean
                    active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    description?: string | null
                    category: string
                    price: number
                    taxable?: boolean
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    description?: string | null
                    category?: string
                    price?: number
                    taxable?: boolean
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            invoices: {
                Row: {
                    id: string
                    patient_id: string
                    appointment_id: string | null
                    invoice_number: string
                    issue_date: string
                    due_date: string
                    status: string
                    subtotal: number
                    tax_amount: number
                    discount_amount: number
                    total_amount: number
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    patient_id: string
                    appointment_id?: string | null
                    invoice_number: string
                    issue_date: string
                    due_date: string
                    status?: string
                    subtotal: number
                    tax_amount: number
                    discount_amount?: number
                    total_amount: number
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    patient_id?: string
                    appointment_id?: string | null
                    invoice_number?: string
                    issue_date?: string
                    due_date?: string
                    status?: string
                    subtotal?: number
                    tax_amount?: number
                    discount_amount?: number
                    total_amount?: number
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            invoice_items: {
                Row: {
                    id: string
                    invoice_id: string
                    billing_item_id: number | null
                    description: string
                    quantity: number
                    unit_price: number
                    tax_rate: number
                    discount_amount: number
                    total_amount: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    billing_item_id?: number | null
                    description: string
                    quantity?: number
                    unit_price: number
                    tax_rate?: number
                    discount_amount?: number
                    total_amount: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    billing_item_id?: number | null
                    description?: string
                    quantity?: number
                    unit_price?: number
                    tax_rate?: number
                    discount_amount?: number
                    total_amount?: number
                    created_at?: string
                }
            }
            payments: {
                Row: {
                    id: string
                    invoice_id: string
                    payment_date: string
                    amount: number
                    payment_method: string
                    transaction_id: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    payment_date: string
                    amount: number
                    payment_method: string
                    transaction_id?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    payment_date?: string
                    amount?: number
                    payment_method?: string
                    transaction_id?: string | null
                    notes?: string | null
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
