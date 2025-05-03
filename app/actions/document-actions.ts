"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { auditLogger } from "@/lib/audit-logger"

// Define proper types for our parameters
interface DocumentQueryParams {
    patientId?: string
    medicalRecordId?: string
    documentTypeId?: number
    search?: string
    limit?: number
    offset?: number
    page?: number
}

export async function getDocuments(params: DocumentQueryParams = {}) {
    const { patientId, medicalRecordId, documentTypeId, search, limit = 10, offset = 0, page = 1 } = params
    const supabase = createServerSupabaseClient()
    const calculatedOffset = offset || (page - 1) * limit

    let query = supabase
        .from("documents")
        .select(
            `
      *,
      document_types (
        name,
        description
      ),
      uploaded_by_user:uploaded_by (
        email,
        user_profiles (
          first_name,
          last_name
        )
      )
    `,
            { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(calculatedOffset, calculatedOffset + limit - 1)

    if (patientId) {
        query = query.eq("patient_id", patientId)
    }

    if (medicalRecordId) {
        query = query.eq("medical_record_id", medicalRecordId)
    }

    if (documentTypeId) {
        query = query.eq("document_type_id", documentTypeId)
    }

    if (search) {
        query = query.ilike("name", `%${search}%`)
    }

    const { data: documents, error, count } = await query

    if (error) {
        console.error("Error fetching documents:", error)
        throw new Error(`Failed to fetch documents: ${error.message}`)
    }

    await auditLogger.view("documents", undefined, { patientId, medicalRecordId, documentTypeId, search })

    return { documents: documents || [], totalCount: count || 0, page, limit }
}

export async function getDocumentById(id: string) {
    const supabase = createServerSupabaseClient()

    const { data: document, error } = await supabase
        .from("documents")
        .select(`
      *,
      document_types (
        name,
        description
      ),
      uploaded_by_user:uploaded_by (
        email,
        user_profiles (
          first_name,
          last_name
        )
      ),
      signed_by_user:signed_by (
        email,
        user_profiles (
          first_name,
          last_name
        )
      ),
      patients (
        first_name,
        last_name,
        date_of_birth
      ),
      medical_records (
        visit_date,
        chief_complaint,
        diagnosis
      ),
      document_templates (
        name,
        content,
        variables
      )
    `)
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching document:", error)
        throw new Error(`Failed to fetch document: ${error.message}`)
    }

    await auditLogger.view("documents", id)

    return document
}

export async function uploadDocument(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to upload a document")
    }

    const name = formData.get("name") as string
    const documentTypeId = Number.parseInt(formData.get("documentTypeId") as string)
    const patientId = formData.get("patientId") as string
    const medicalRecordId = (formData.get("medicalRecordId") as string) || null
    const file = formData.get("file") as File
    const tags = formData.get("tags") as string
    const tagArray = tags ? tags.split(",").map((tag) => tag.trim()) : []

    if (!file) {
        throw new Error("No file provided")
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `documents/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("medical-documents")
        .upload(filePath, file)

    if (uploadError) {
        console.error("Error uploading file:", uploadError)
        throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    // Get public URL for the file
    const {
        data: { publicUrl },
    } = supabase.storage.from("medical-documents").getPublicUrl(filePath)

    // Create document record
    const documentData = {
        id: uuidv4(),
        name,
        document_type_id: documentTypeId,
        patient_id: patientId,
        medical_record_id: medicalRecordId,
        uploaded_by: user.id,
        file_path: publicUrl,
        file_type: file.type,
        file_size: file.size,
        tags: tagArray,
    }

    const { data, error } = await supabase.from("documents").insert(documentData).select()

    if (error) {
        console.error("Error creating document record:", error)
        throw new Error(`Failed to create document record: ${error.message}`)
    }

    await auditLogger.create("documents", documentData.id, {
        name,
        documentTypeId,
        patientId,
        medicalRecordId,
        fileSize: file.size,
        fileType: file.type,
    })

    if (medicalRecordId) {
        revalidatePath(`/medical-records/${medicalRecordId}`)
        redirect(`/medical-records/${medicalRecordId}`)
    } else {
        revalidatePath(`/patients/${patientId}`)
        redirect(`/patients/${patientId}`)
    }
}

export async function deleteDocument(id: string, redirectPath: string) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to delete a document")
    }

    // Get the document to find the file path
    const { data: document, error: fetchError } = await supabase
        .from("documents")
        .select("file_path")
        .eq("id", id)
        .single()

    if (fetchError) {
        console.error("Error fetching document:", fetchError)
        throw new Error(`Failed to fetch document: ${fetchError.message}`)
    }

    // Extract the file path from the URL
    const filePath = document.file_path.split("/").pop()

    // Delete the file from storage
    const { error: storageError } = await supabase.storage.from("medical-documents").remove([`documents/${filePath}`])

    if (storageError) {
        console.error("Error deleting file from storage:", storageError)
        // Continue with deleting the record even if file deletion fails
    }

    // Delete the document record
    const { error } = await supabase.from("documents").delete().eq("id", id)

    if (error) {
        console.error("Error deleting document:", error)
        throw new Error(`Failed to delete document: ${error.message}`)
    }

    await auditLogger.delete("documents", id)

    revalidatePath(redirectPath)
    redirect(redirectPath)
}

export async function getDocumentTypes() {
    const supabase = createServerSupabaseClient()

    const { data: documentTypes, error } = await supabase.from("document_types").select("*").order("name")

    if (error) {
        console.error("Error fetching document types:", error)
        throw new Error(`Failed to fetch document types: ${error.message}`)
    }

    return documentTypes
}

interface DocumentTemplateQueryParams {
    documentTypeId?: number
    search?: string
    limit?: number
    offset?: number
    page?: number
}

export async function getDocumentTemplates(params: DocumentTemplateQueryParams = {}) {
    const { documentTypeId, search, limit = 10, offset = 0, page = 1 } = params
    const supabase = createServerSupabaseClient()
    const calculatedOffset = offset || (page - 1) * limit

    let query = supabase
        .from("document_templates")
        .select(
            `
      *,
      document_types (
        name,
        description
      ),
      created_by_user:created_by (
        email,
        user_profiles (
          first_name,
          last_name
        )
      )
    `,
            { count: "exact" },
        )
        .order("name")
        .range(calculatedOffset, calculatedOffset + limit - 1)

    if (documentTypeId) {
        query = query.eq("document_type_id", documentTypeId)
    }

    if (search) {
        query = query.ilike("name", `%${search}%`)
    }

    const { data: templates, error, count } = await query

    if (error) {
        console.error("Error fetching document templates:", error)
        throw new Error(`Failed to fetch document templates: ${error.message}`)
    }

    return { templates: templates || [], totalCount: count || 0, page, limit }
}

export async function createDocumentFromTemplate(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to create a document")
    }

    const templateId = formData.get("templateId") as string
    const name = formData.get("name") as string
    const patientId = formData.get("patientId") as string
    const medicalRecordId = (formData.get("medicalRecordId") as string) || null

    // Get the template
    const { data: template, error: templateError } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", templateId)
        .single()

    if (templateError) {
        console.error("Error fetching template:", templateError)
        throw new Error(`Failed to fetch template: ${templateError.message}`)
    }

    // Get patient data for variable replacement
    const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single()

    if (patientError && patientId) {
        console.error("Error fetching patient:", patientError)
        throw new Error(`Failed to fetch patient: ${patientError.message}`)
    }

    // Get clinic data for variable replacement
    const { data: clinics, error: clinicError } = await supabase.from("clinics").select("*").limit(1)

    if (clinicError) {
        console.error("Error fetching clinic:", clinicError)
        throw new Error(`Failed to fetch clinic: ${clinicError.message}`)
    }

    const clinic = clinics && clinics.length > 0 ? clinics[0] : null

    // Replace variables in template content
    let content = template.content
    if (patient) {
        content = content.replace(/{{patient_name}}/g, `${patient.first_name} ${patient.last_name}`)
    }
    if (clinic) {
        content = content.replace(/{{clinic_name}}/g, clinic.name)
    }

    // Create a PDF or text file from the content
    // This is a placeholder - in a real app, you'd use a PDF generation library
    const blob = new Blob([content], { type: "text/plain" })
    const file = new File([blob], `${name}.txt`, { type: "text/plain" })

    // Upload file to Supabase Storage
    const fileName = `${uuidv4()}.txt`
    const filePath = `documents/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("medical-documents")
        .upload(filePath, file)

    if (uploadError) {
        console.error("Error uploading file:", uploadError)
        throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    // Get public URL for the file
    const {
        data: { publicUrl },
    } = supabase.storage.from("medical-documents").getPublicUrl(filePath)

    // Create document record
    const documentData = {
        id: uuidv4(),
        name,
        document_type_id: template.document_type_id,
        patient_id: patientId,
        medical_record_id: medicalRecordId,
        uploaded_by: user.id,
        file_path: publicUrl,
        file_type: "text/plain",
        file_size: file.size,
        is_template_generated: true,
        template_id: templateId,
    }

    const { data, error } = await supabase.from("documents").insert(documentData).select()

    if (error) {
        console.error("Error creating document record:", error)
        throw new Error(`Failed to create document record: ${error.message}`)
    }

    await auditLogger.create("documents", documentData.id, { name, templateId, patientId, medicalRecordId })

    if (medicalRecordId) {
        revalidatePath(`/medical-records/${medicalRecordId}`)
        redirect(`/medical-records/${medicalRecordId}`)
    } else {
        revalidatePath(`/patients/${patientId}`)
        redirect(`/patients/${patientId}`)
    }
}
