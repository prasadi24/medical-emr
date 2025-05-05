"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { AIService } from "@/lib/ai/ai-service"
import { auditLogger } from "@/lib/audit-logger"
import { v4 as uuidv4 } from "uuid"

export async function generateAIInsightsForMedicalRecord(recordId: string) {
    try {
        const supabase = createServerSupabaseClient()

        // Get user info for audit logging
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        // Fetch the medical record
        const { data: record, error: recordError } = await supabase
            .from("medical_records")
            .select(`
        *,
        patients (id, first_name, last_name, date_of_birth, gender, allergies, medical_history),
        vitals (*)
      `)
            .eq("id", recordId)
            .single()

        if (recordError) {
            console.error("Error fetching medical record:", recordError)
            return { success: false, message: "Failed to fetch medical record", error: recordError }
        }

        // Prepare comprehensive context for AI
        const patientAge = record.patients.date_of_birth
            ? Math.floor((new Date().getTime() - new Date(record.patients.date_of_birth).getTime()) / 31557600000)
            : 0 // Default to 0 if unknown

        const patientData = {
            age: patientAge,
            gender: record.patients.gender || "Unknown",
            allergies: record.patients.allergies || [],
            activeConditions: record.patients.medical_history?.conditions || [],
            currentMedications: record.patients.medical_history?.medications || [],
        }

        // Combine all clinical notes for context
        const clinicalNotes = `
    Chief Complaint: ${record.chief_complaint || "N/A"}
    Diagnosis: ${record.diagnosis || "N/A"}
    Treatment Plan: ${record.treatment_plan || "N/A"}
    Notes: ${record.notes || "N/A"}
    Vitals: ${record.vitals ? JSON.stringify(record.vitals, null, 2) : "N/A"}
    `

        // Generate AI insights
        const insights = await AIService.generateMedicalInsights(clinicalNotes, {
            temperature: 0.3,
            systemPrompt:
                "You are a clinical decision support system. Analyze the clinical data and provide medical insights.",
        })

        if (!insights.success) {
            return { success: false, message: "Failed to generate insights", error: insights.error }
        }

        // Generate treatment suggestions if diagnosis exists
        let treatmentSuggestions = null
        if (record.diagnosis) {
            const suggestions = await AIService.generateTreatmentSuggestions(patientData, {
                diagnosis: record.diagnosis,
            })

            if (suggestions.success) {
                treatmentSuggestions = suggestions.data
            }
        }

        // Update the medical record with AI insights
        const { error: updateError } = await supabase
            .from("medical_records")
            .update({
                ai_insights: insights.data,
                ai_treatment_suggestions: treatmentSuggestions,
                updated_at: new Date().toISOString(),
            })
            .eq("id", recordId)

        if (updateError) {
            console.error("Error updating medical record with AI insights:", updateError)
            return { success: false, message: "Failed to save AI insights", error: updateError }
        }

        // Log the AI analysis action
        await auditLogger.create("ai_analysis", recordId, {
            actionType: "ai_medical_record_insights",
            userId: userData.user.id,
            recordId,
        })

        revalidatePath(`/medical-records/${recordId}`)

        return {
            success: true,
            message: "AI insights generated successfully",
            data: {
                insights: insights.data,
                treatmentSuggestions,
            },
        }
    } catch (error) {
        console.error("Error generating AI insights for medical record:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function generateAIDocumentation(
    recordId: string,
    documentType: "progress_note" | "discharge_summary" | "consultation" | "procedure_note",
) {
    try {
        const supabase = createServerSupabaseClient()

        // Get user info for audit logging
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        // Fetch the medical record with related data
        const { data: record, error: recordError } = await supabase
            .from("medical_records")
            .select(`
        *,
        patients (id, first_name, last_name, date_of_birth, gender, allergies, medical_history),
        vitals (*)
      `)
            .eq("id", recordId)
            .single()

        if (recordError) {
            console.error("Error fetching medical record:", recordError)
            return { success: false, message: "Failed to fetch medical record", error: recordError }
        }

        // Get doctor information
        const { data: doctorData } = await supabase
            .from("doctors")
            .select(`
        id,
        user_id,
        user_profiles!inner (first_name, last_name),
        specialties!inner (name)
      `)
            .eq("user_id", record.doctor_id)
            .single()

        // Prepare comprehensive context for document generation
        const patientInfo = `
    Patient: ${record.patients.first_name} ${record.patients.last_name}
    DOB: ${record.patients.date_of_birth || "Unknown"}
    Gender: ${record.patients.gender || "Unknown"}
    Allergies: ${record.patients.allergies?.join(", ") || "None reported"}
    `

        const medicalInfo = `
    Visit Date: ${record.visit_date || new Date().toISOString().split("T")[0]}
    Chief Complaint: ${record.chief_complaint || "N/A"}
    Diagnosis: ${record.diagnosis || "N/A"}
    Treatment Plan: ${record.treatment_plan || "N/A"}
    Clinical Notes: ${record.notes || "N/A"}
    Vitals: ${record.vitals
                ? `BP: ${record.vitals.blood_pressure || "N/A"}, 
      HR: ${record.vitals.heart_rate || "N/A"}, 
      Temp: ${record.vitals.temperature || "N/A"}°C, 
      RR: ${record.vitals.respiratory_rate || "N/A"}, 
      SPO2: ${record.vitals.oxygen_saturation || "N/A"}%`
                : "Not recorded"
            }
    `

        // Fix: Access user_profiles and specialties correctly
        // The query is set up to return objects, not arrays
        const doctorName = doctorData?.user_profiles
            ? `Dr. ${doctorData.user_profiles.first_name || ""} ${doctorData.user_profiles.last_name || ""}`
            : "Unknown Doctor"

        const specialty = doctorData?.specialties ? doctorData.specialties.name || "Unknown Specialty" : "Unknown Specialty"

        const doctorInfo = doctorData
            ? `Provider: ${doctorName}
      Specialty: ${specialty}`
            : "Provider information not available"

        // Combine all information
        const contextForAI = `
    ${patientInfo}
    
    ${medicalInfo}
    
    ${doctorInfo}
    `

        // Generate documentation with AI
        const result = await AIService.generateClinicalDocumentation(contextForAI, documentType)

        if (!result.success) {
            return { success: false, message: "Failed to generate documentation", error: result.error }
        }

        // Create document record in database
        const documentTypeMapping = {
            progress_note: 1,
            discharge_summary: 2,
            consultation: 3,
            procedure_note: 4,
        }

        // Ensure document_types table has these types
        const documentTypeId = documentTypeMapping[documentType] || 1

        // Create document in the system
        const { data: documentData, error: documentError } = await supabase
            .from("documents")
            .insert({
                id: uuidv4(),
                patient_id: record.patient_id,
                medical_record_id: recordId,
                document_type_id: documentTypeId,
                name: `AI Generated ${documentType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`,
                content: result.data || "", // Ensure we have a string even if data is undefined
                is_ai_generated: true,
                uploaded_by: userData.user.id,
                file_type: "text/plain",
                file_size: result.data ? result.data.length : 0,
                status: "draft",
            })
            .select()

        if (documentError) {
            console.error("Error saving AI-generated document:", documentError)
            return {
                success: true,
                message: "Documentation generated but not saved",
                data: { documentation: result.data },
                error: documentError,
            }
        }

        // Log the AI document generation
        await auditLogger.create("documents", documentData[0].id, {
            actionType: "ai_document_generation",
            userId: userData.user.id,
            recordId,
            documentType,
        })

        revalidatePath(`/medical-records/${recordId}`)
        revalidatePath(`/patients/${record.patient_id}/documents`)

        return {
            success: true,
            message: "Documentation generated and saved successfully",
            data: {
                documentation: result.data,
                documentId: documentData[0].id,
            },
        }
    } catch (error) {
        console.error("Error generating AI documentation:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function searchMedicalRecordsWithAI(query: string) {
    try {
        const supabase = createServerSupabaseClient()

        // First, get all medical records (in a real app, you'd want to paginate this)
        const { data: medicalRecords, error: recordsError } = await supabase
            .from("medical_records")
            .select(`
        *,
        patients!inner (
          first_name,
          last_name,
          date_of_birth,
          gender
        )
      `)
            .order("created_at", { ascending: false })
            .limit(100) // Limit to prevent processing too many records

        if (recordsError) {
            console.error("Error fetching medical records:", recordsError)
            return { success: false, message: "Failed to fetch medical records", error: recordsError }
        }

        // This would use AI in a real implementation
        // For now, just do a simple search
        const results =
            medicalRecords
                ?.filter((record) => {
                    const searchTerms = query.toLowerCase().split(" ")

                    // Check if any search term is present in the record
                    return searchTerms.some(
                        (term) =>
                            (record.chief_complaint && record.chief_complaint.toLowerCase().includes(term)) ||
                            (record.diagnosis && record.diagnosis.toLowerCase().includes(term)) ||
                            (record.treatment_plan && record.treatment_plan.toLowerCase().includes(term)) ||
                            (record.notes && record.notes.toLowerCase().includes(term)) ||
                            (record.patients.first_name && record.patients.first_name.toLowerCase().includes(term)) ||
                            (record.patients.last_name && record.patients.last_name.toLowerCase().includes(term)),
                    )
                })
                .map((record) => ({
                    id: record.id,
                    patientName: `${record.patients.first_name} ${record.patients.last_name}`,
                    visitDate: record.visit_date,
                    diagnosis: record.diagnosis || "No diagnosis",
                    relevanceScore: 0.8, // Mock score
                    matchedFields: ["diagnosis", "notes"], // Mock matched fields
                })) || []

        // Sort by mock relevance
        results.sort((a, b) => b.relevanceScore - a.relevanceScore)

        return { success: true, results }
    } catch (error) {
        console.error("Error searching medical records with AI:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}
