"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { auditLogger } from "@/lib/audit-logger"

function createChangeLog(oldValues: any, newValues: any) {
    const changes: string[] = []

    for (const key in newValues) {
        if (newValues.hasOwnProperty(key)) {
            if (oldValues[key] !== newValues[key]) {
                changes.push(`\`${key}\` from \`${oldValues[key]}\` to \`${newValues[key]}\``)
            }
        }
    }

    return changes.length > 0 ? `Changed ${changes.join(", ")}` : "No changes"
}

export async function getPrescriptions(params: {
    patientId?: string
    medicalRecordId?: string
    status?: string
    limit?: number
    offset?: number
}) {
    const { patientId, medicalRecordId, status, limit = 10, offset = 0 } = params
    const supabase = createServerSupabaseClient()

    let query = supabase
        .from("prescriptions")
        .select(`
      *,
      medical_records!inner (
        patient_id,
        patients!inner (
          first_name,
          last_name
        )
      ),
      doctors!inner (
        user_id,
        user_profiles!inner (
          first_name,
          last_name
        )
      )
    `)
        .order("prescribed_at", { ascending: false })
        .range(offset, offset + limit - 1)

    if (patientId) {
        query = query.eq("medical_records.patient_id", patientId)
    }

    if (medicalRecordId) {
        query = query.eq("medical_record_id", medicalRecordId)
    }

    if (status) {
        query = query.eq("status", status)
    }

    const { data: prescriptions, error, count } = await query

    if (error) {
        console.error("Error fetching prescriptions:", error)
        throw new Error(`Failed to fetch prescriptions: ${error.message}`)
    }

    await auditLogger.view("prescriptions", undefined, { patientId, medicalRecordId, status })

    return { prescriptions, count }
}

export async function getPrescriptionById(id: string) {
    const supabase = createServerSupabaseClient()

    const { data: prescription, error } = await supabase
        .from("prescriptions")
        .select(`
      *,
      medical_records!inner (
        patient_id,
        chief_complaint,
        diagnosis,
        patients!inner (
          first_name,
          last_name,
          date_of_birth,
          gender
        )
      ),
      doctors!inner (
        user_id,
        user_profiles!inner (
          first_name,
          last_name
        )
      )
    `)
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching prescription:", error)
        throw new Error(`Failed to fetch prescription: ${error.message}`)
    }

    await auditLogger.view("prescriptions", id)

    return prescription
}

export async function createPrescription(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to create a prescription")
    }

    const medicalRecordId = formData.get("medicalRecordId") as string
    const doctorId = formData.get("doctorId") as string
    const medicationName = formData.get("medicationName") as string
    const dosage = formData.get("dosage") as string
    const frequency = formData.get("frequency") as string
    const duration = formData.get("duration") as string
    const instructions = formData.get("instructions") as string
    const status = (formData.get("status") as string) || "active"

    const prescriptionData = {
        id: uuidv4(),
        medical_record_id: medicalRecordId,
        prescribed_by: doctorId,
        medication_name: medicationName,
        dosage,
        frequency,
        duration,
        instructions,
        status,
        prescribed_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("prescriptions").insert(prescriptionData).select()

    if (error) {
        console.error("Error creating prescription:", error)
        throw new Error(`Failed to create prescription: ${error.message}`)
    }

    await auditLogger.create("prescriptions", prescriptionData.id, prescriptionData)

    revalidatePath(`/medical-records/${medicalRecordId}`)
    redirect(`/medical-records/${medicalRecordId}`)
}

export async function updatePrescription(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to update a prescription")
    }

    const id = formData.get("id") as string
    const medicalRecordId = formData.get("medicalRecordId") as string
    const medicationName = formData.get("medicationName") as string
    const dosage = formData.get("dosage") as string
    const frequency = formData.get("frequency") as string
    const duration = formData.get("duration") as string
    const instructions = formData.get("instructions") as string
    const status = formData.get("status") as string

    // Get the current prescription for change logging
    const { data: currentPrescription, error: fetchError } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("id", id)
        .single()

    if (fetchError) {
        console.error("Error fetching current prescription:", fetchError)
        throw new Error(`Failed to fetch current prescription: ${fetchError.message}`)
    }

    const prescriptionData = {
        medication_name: medicationName,
        dosage,
        frequency,
        duration,
        instructions,
        status,
        updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("prescriptions").update(prescriptionData).eq("id", id).select()

    if (error) {
        console.error("Error updating prescription:", error)
        throw new Error(`Failed to update prescription: ${error.message}`)
    }

    // Create change log
    const changes = createChangeLog(currentPrescription, { ...currentPrescription, ...prescriptionData })

    await auditLogger.update("prescriptions", id, { changes })

    revalidatePath(`/medical-records/${medicalRecordId}`)
    redirect(`/medical-records/${medicalRecordId}`)
}

export async function deletePrescription(id: string, medicalRecordId: string) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to delete a prescription")
    }

    const { error } = await supabase.from("prescriptions").delete().eq("id", id)

    if (error) {
        console.error("Error deleting prescription:", error)
        throw new Error(`Failed to delete prescription: ${error.message}`)
    }

    await auditLogger.delete("prescriptions", id)

    revalidatePath(`/medical-records/${medicalRecordId}`)
}

export async function getMedicationCatalog(params: {
    search?: string
    limit?: number
    offset?: number
}) {
    const { search, limit = 10, offset = 0 } = params
    const supabase = createServerSupabaseClient()

    let query = supabase
        .from("medication_catalog")
        .select("*", { count: "exact" })
        .order("name")
        .range(offset, offset + limit - 1)

    if (search) {
        query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%`)
    }

    const { data: medications, error, count } = await query

    if (error) {
        console.error("Error fetching medications:", error)
        throw new Error(`Failed to fetch medications: ${error.message}`)
    }

    return { medications, count }
}

export async function createPrescriptionRefill(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to create a prescription refill")
    }

    const prescriptionId = formData.get("prescriptionId") as string
    const refillAmount = formData.get("refillAmount") as string
    const authorizedById = formData.get("authorizedById") as string
    const pharmacyId = formData.get("pharmacyId") as string
    const notes = formData.get("notes") as string

    const refillData = {
        id: uuidv4(),
        prescription_id: prescriptionId,
        refill_date: new Date().toISOString(),
        refill_amount: refillAmount,
        authorized_by: authorizedById,
        pharmacy_id: pharmacyId || null,
        status: "pending",
        notes,
    }

    const { data, error } = await supabase.from("prescription_refills").insert(refillData).select()

    if (error) {
        console.error("Error creating prescription refill:", error)
        throw new Error(`Failed to create prescription refill: ${error.message}`)
    }

    await auditLogger.create("prescription_refills", refillData.id, refillData)

    // Get the medical record ID for the prescription
    const { data: prescription } = await supabase
        .from("prescriptions")
        .select("medical_record_id")
        .eq("id", prescriptionId)
        .single()

    revalidatePath(`/medical-records/${prescription?.medical_record_id}`)
    redirect(`/medical-records/${prescription?.medical_record_id}`)
}

export async function getPharmacies(params: {
    search?: string
    isPartner?: boolean
    limit?: number
    offset?: number
}) {
    const { search, isPartner, limit = 10, offset = 0 } = params
    const supabase = createServerSupabaseClient()

    let query = supabase
        .from("pharmacies")
        .select("*", { count: "exact" })
        .order("name")
        .range(offset, offset + limit - 1)

    if (search) {
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`)
    }

    if (isPartner !== undefined) {
        query = query.eq("is_partner", isPartner)
    }

    const { data: pharmacies, error, count } = await query

    if (error) {
        console.error("Error fetching pharmacies:", error)
        throw new Error(`Failed to fetch pharmacies: ${error.message}`)
    }

    return { pharmacies, count }
}
