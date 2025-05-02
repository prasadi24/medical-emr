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
