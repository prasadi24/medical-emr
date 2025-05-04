"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { auditLogger } from "@/lib/audit-logger"

export async function createLabResult(formData: FormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const patientId = formData.get("patientId") as string
        const medicalRecordId = (formData.get("medicalRecordId") as string) || null
        const labTestTypeId = formData.get("labTestTypeId") as string
        const orderedByDoctorId = formData.get("orderedByDoctorId") as string
        const performedByStaffId = (formData.get("performedByStaffId") as string) || null
        const testDate = formData.get("testDate") as string
        const resultDate = (formData.get("resultDate") as string) || null
        const result = (formData.get("result") as string) || null
        const unit = (formData.get("unit") as string) || null
        const status = formData.get("status") as string
        const notes = (formData.get("notes") as string) || null
        const isAbnormal = formData.get("isAbnormal") === "true"

        const { data, error } = await supabase
            .from("lab_results")
            .insert({
                patient_id: patientId,
                medical_record_id: medicalRecordId,
                lab_test_type_id: Number.parseInt(labTestTypeId),
                ordered_by_doctor: orderedByDoctorId,
                performed_by_staff: performedByStaffId,
                test_date: testDate,
                result_date: resultDate,
                result,
                unit,
                status,
                notes,
                is_abnormal: isAbnormal,
            })
            .select()

        if (error) {
            console.error("Error creating lab result:", error)
            return { success: false, message: "Failed to create lab result", error }
        }

        // Create notification if result is completed
        if (status === "completed") {
            await supabase.from("patient_notifications").insert({
                patient_id: patientId,
                title: "Lab Result Available",
                message: "Your lab test results are now available. Please check your lab results section.",
                type: "lab_result",
                reference_type: "lab_result",
                reference_id: data[0].id,
            })
        }

        await auditLogger.create("lab_results", data[0].id, {
            patientId,
            labTestTypeId,
            status,
            userId: userData.user.id,
        })

        revalidatePath("/lab-results")
        revalidatePath(`/patients/${patientId}/lab-results`)
        if (medicalRecordId) {
            revalidatePath(`/medical-records/${medicalRecordId}`)
        }

        return { success: true, message: "Lab result created successfully", data: data[0] }
    } catch (error) {
        console.error("Error creating lab result:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateLabResult(labResultId: string, formData: FormData) {
    try {
        const supabase = createServerSupabaseClient()

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const patientId = formData.get("patientId") as string
        const medicalRecordId = (formData.get("medicalRecordId") as string) || null
        const labTestTypeId = formData.get("labTestTypeId") as string
        const performedByStaffId = (formData.get("performedByStaffId") as string) || null
        const resultDate = (formData.get("resultDate") as string) || null
        const result = (formData.get("result") as string) || null
        const unit = (formData.get("unit") as string) || null
        const status = formData.get("status") as string
        const notes = (formData.get("notes") as string) || null
        const isAbnormal = formData.get("isAbnormal") === "true"

        // Get current lab result to check if status changed
        const { data: currentLabResult } = await supabase
            .from("lab_results")
            .select("status")
            .eq("id", labResultId)
            .single()

        const { data, error } = await supabase
            .from("lab_results")
            .update({
                performed_by_staff: performedByStaffId,
                result_date: resultDate,
                result,
                unit,
                status,
                notes,
                is_abnormal: isAbnormal,
                updated_at: new Date().toISOString(),
            })
            .eq("id", labResultId)
            .select()

        if (error) {
            console.error("Error updating lab result:", error)
            return { success: false, message: "Failed to update lab result", error }
        }

        // Create notification if status changed to completed
        if (currentLabResult && currentLabResult.status !== "completed" && status === "completed") {
            await supabase.from("patient_notifications").insert({
                patient_id: patientId,
                title: "Lab Result Available",
                message: "Your lab test results are now available. Please check your lab results section.",
                type: "lab_result",
                reference_type: "lab_result",
                reference_id: labResultId,
            })
        }

        await auditLogger.update("lab_results", labResultId, {
            status,
            result,
            isAbnormal,
            userId: userData.user.id,
        })

        revalidatePath("/lab-results")
        revalidatePath(`/lab-results/${labResultId}`)
        revalidatePath(`/patients/${patientId}/lab-results`)
        if (medicalRecordId) {
            revalidatePath(`/medical-records/${medicalRecordId}`)
        }

        return { success: true, message: "Lab result updated successfully", data: data[0] }
    } catch (error) {
        console.error("Error updating lab result:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteLabResult(labResultId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        // Get lab result info before deletion
        const { data: labResult } = await supabase
            .from("lab_results")
            .select("patient_id, medical_record_id")
            .eq("id", labResultId)
            .single()

        const { error } = await supabase.from("lab_results").delete().eq("id", labResultId)

        if (error) {
            console.error("Error deleting lab result:", error)
            return { success: false, message: "Failed to delete lab result", error }
        }

        await auditLogger.delete("lab_results", labResultId, {
            userId: userData.user.id,
        })

        revalidatePath("/lab-results")
        if (labResult) {
            revalidatePath(`/patients/${labResult.patient_id}/lab-results`)
            if (labResult.medical_record_id) {
                revalidatePath(`/medical-records/${labResult.medical_record_id}`)
            }
        }

        return { success: true, message: "Lab result deleted successfully" }
    } catch (error) {
        console.error("Error deleting lab result:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function getLabResults(
    options: {
        patientId?: string
        medicalRecordId?: string
        status?: string
        page?: number
        limit?: number
    } = {},
) {
    try {
        const supabase = createServerSupabaseClient()
        const { patientId, medicalRecordId, status, page = 1, limit = 10 } = options
        const offset = (page - 1) * limit

        let query = supabase.from("lab_results").select(
            `
        *,
        patient:patient_id (
          id,
          first_name,
          last_name
        ),
        lab_test_type:lab_test_type_id (
          id,
          name,
          lab_test_categories (
            id,
            name
          )
        ),
        doctor:ordered_by_doctor (
          id,
          user_id,
          user:user_id (
            email,
            user_profiles (
              first_name,
              last_name
            )
          )
        ),
        staff:performed_by_staff (
          id,
          user_id,
          user:user_id (
            email,
            user_profiles (
              first_name,
              last_name
            )
          )
        )
      `,
            { count: "exact" },
        )

        if (patientId) {
            query = query.eq("patient_id", patientId)
        }

        if (medicalRecordId) {
            query = query.eq("medical_record_id", medicalRecordId)
        }

        if (status) {
            query = query.eq("status", status)
        }

        const { data, count, error } = await query
            .order("test_date", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error("Error fetching lab results:", error)
            return { labResults: [], totalCount: 0, page, limit }
        }

        return {
            labResults: data || [],
            totalCount: count || 0,
            page,
            limit,
        }
    } catch (error) {
        console.error("Error fetching lab results:", error)
        return { labResults: [], totalCount: 0, page: 1, limit: 10 }
    }
}

export async function getLabResultById(labResultId: string) {
    try {
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase
            .from("lab_results")
            .select(`
        *,
        patient:patient_id (
          id,
          first_name,
          last_name,
          date_of_birth,
          gender
        ),
        lab_test_type:lab_test_type_id (
          id,
          name,
          description,
          normal_range,
          unit,
          lab_test_categories (
            id,
            name
          )
        ),
        doctor:ordered_by_doctor (
          id,
          user_id,
          user:user_id (
            email,
            user_profiles (
              first_name,
              last_name
            )
          )
        ),
        staff:performed_by_staff (
          id,
          user_id,
          user:user_id (
            email,
            user_profiles (
              first_name,
              last_name
            )
          )
        )
      `)
            .eq("id", labResultId)
            .single()

        if (error) {
            console.error("Error fetching lab result:", error)
            return null
        }

        return data
    } catch (error) {
        console.error("Error fetching lab result:", error)
        return null
    }
}
