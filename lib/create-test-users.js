import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://qoxgpijfeacnmmzjwkpa.supabase.co' //process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFveGdwaWpmZWFjbm1temp3a3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwNzY5MywiZXhwIjoyMDYxNzgzNjkzfQ.kotOFS75fLd17g9t0sY-_WYzlgExRtTWVcgLeB7kMok'


// Initialize the Supabase client with the service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseKey)

// Common password for all test users
const commonPassword = 'MediConnect123'

// Test users to create
const testUsers = [
    { email: 'admin@kriyanix.com', firstName: 'Admin', lastName: 'User', role: 'Admin', phone: '555-0001' },
    { email: 'doctor@kriyanix.com', firstName: 'John', lastName: 'Smith', role: 'Doctor', phone: '555-0002' },
    { email: 'nurse@kriyanix.com', firstName: 'Sarah', lastName: 'Johnson', role: 'Nurse', phone: '555-0003' },
    { email: 'receptionist@kriyanix.com', firstName: 'Emily', lastName: 'Davis', role: 'Receptionist', phone: '555-0004' },
    { email: 'labtech@kriyanix.com', firstName: 'Michael', lastName: 'Brown', role: 'Lab Technician', phone: '555-0005' },
    { email: 'pharmacist@kriyanix.com', firstName: 'Jessica', lastName: 'Wilson', role: 'Pharmacist', phone: '555-0006' },
    { email: 'billing@kriyanix.com', firstName: 'David', lastName: 'Miller', role: 'Billing Specialist', phone: '555-0007' },
    { email: 'patient@kriyanix.com', firstName: 'Robert', lastName: 'Taylor', role: 'Patient', phone: '555-0008' },
    { email: 'radiologist@kriyanix.com', firstName: 'Lisa', lastName: 'Anderson', role: 'Radiologist', phone: '555-0009' },
    { email: 'itsupport@kriyanix.com', firstName: 'James', lastName: 'Thomas', role: 'IT Support', phone: '555-0010' }
]

async function createTestUsers() {
    console.log('Starting user creation process...')

    for (const user of testUsers) {
        try {
            console.log(`Creating user: ${user.email}`)

            // 1. Create the user in auth.users
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: commonPassword,
                email_confirm: true // Auto-confirm email
            })

            if (authError) {
                console.error(`Error creating user ${user.email}:`, authError.message)
                continue
            }

            console.log(`User created: ${user.email} with ID: ${authUser.user.id}`)

            // 2. Create user profile
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: authUser.user.id,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    phone_number: user.phone
                })

            if (profileError) {
                console.error(`Error creating profile for ${user.email}:`, profileError.message)
            }

            // 3. Get role ID
            const { data: roleData, error: roleError } = await supabase
                .from('roles')
                .select('id')
                .eq('name', user.role)
                .single()

            if (roleError) {
                console.error(`Error finding role for ${user.email}:`, roleError.message)
                continue
            }

            // 4. Assign role to user
            const { error: userRoleError } = await supabase
                .from('user_roles')
                .insert({
                    user_id: authUser.user.id,
                    role_id: roleData.id
                })

            if (userRoleError) {
                console.error(`Error assigning role to ${user.email}:`, userRoleError.message)
            } else {
                console.log(`Successfully assigned role ${user.role} to ${user.email}`)
            }

        } catch (error) {
            console.error(`Unexpected error for ${user.email}:`, error.message)
        }
    }

    console.log('User creation process completed!')
}

// Execute the function
createTestUsers()