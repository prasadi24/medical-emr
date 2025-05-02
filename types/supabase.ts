export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            contacts: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    email: string
                    message: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    email: string
                    message: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    email?: string
                    message?: string
                }
            }
            // Add other tables as needed
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
