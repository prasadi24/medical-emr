"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { auditLogger } from "@/lib/audit-logger"
import { v4 as uuidv4 } from "uuid"

// Billing Items Actions
export async function getBillingItems(
    options: {
        category?: string
        isActive?: boolean
        search?: string
        page?: number
        limit?: number
    } = {},
) {
    try {
        const supabase = createServerSupabaseClient()
        const { category, isActive, search, page = 1, limit = 50 } = options
        const offset = (page - 1) * limit

        let query = supabase.from("billing_items").select("*", { count: "exact" })

        if (category) {
            query = query.eq("category", category)
        }

        if (isActive !== undefined) {
            query = query.eq("is_active", isActive)
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`)
        }

        const { data, count, error } = await query
            .order("category", { ascending: true })
            .order("name", { ascending: true })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error("Error fetching billing items:", error)
            return { billingItems: [], totalCount: 0, page, limit }
        }

        return {
            billingItems: data || [],
            totalCount: count || 0,
            page,
            limit,
        }
    } catch (error) {
        console.error("Error fetching billing items:", error)
        return { billingItems: [], totalCount: 0, page: 1, limit: 50 }
    }
}

export async function getBillingItemById(id: string) {
    try {
        const supabase = createServerSupabaseClient()
        const { data, error } = await supabase.from("billing_items").select("*").eq("id", id).single()

        if (error) {
            console.error("Error fetching billing item:", error)
            return null
        }

        return data
    } catch (error) {
        console.error("Error fetching billing item:", error)
        return null
    }
}

export async function createBillingItem(formData: FormData) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const code = formData.get("code") as string
        const name = formData.get("name") as string
        const description = (formData.get("description") as string) || null
        const category = formData.get("category") as string
        const defaultPrice = Number.parseFloat(formData.get("defaultPrice") as string)
        const isActive = formData.get("isActive") === "true"

        const { data, error } = await supabase
            .from("billing_items")
            .insert({
                code,
                name,
                description,
                category,
                default_price: defaultPrice,
                is_active: isActive,
            })
            .select()

        if (error) {
            console.error("Error creating billing item:", error)
            return { success: false, message: "Failed to create billing item", error }
        }

        await auditLogger.create("billing_items", data[0].id, {
            code,
            name,
            category,
            defaultPrice,
            userId: userData.user.id,
        })

        revalidatePath("/billing/items")
        return { success: true, message: "Billing item created successfully", data: data[0] }
    } catch (error) {
        console.error("Error creating billing item:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateBillingItem(id: string, formData: FormData) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const code = formData.get("code") as string
        const name = formData.get("name") as string
        const description = (formData.get("description") as string) || null
        const category = formData.get("category") as string
        const defaultPrice = Number.parseFloat(formData.get("defaultPrice") as string)
        const isActive = formData.get("isActive") === "true"

        const { data, error } = await supabase
            .from("billing_items")
            .update({
                code,
                name,
                description,
                category,
                default_price: defaultPrice,
                is_active: isActive,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()

        if (error) {
            console.error("Error updating billing item:", error)
            return { success: false, message: "Failed to update billing item", error }
        }

        await auditLogger.update("billing_items", id, {
            code,
            name,
            category,
            defaultPrice,
            isActive,
            userId: userData.user.id,
        })

        revalidatePath("/billing/items")
        revalidatePath(`/billing/items/${id}`)
        return { success: true, message: "Billing item updated successfully", data: data[0] }
    } catch (error) {
        console.error("Error updating billing item:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteBillingItem(id: string) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        // Check if the billing item is used in any invoice items
        const { count, error: checkError } = await supabase
            .from("invoice_items")
            .select("*", { count: "exact" })
            .eq("billing_item_id", id)

        if (checkError) {
            console.error("Error checking billing item usage:", checkError)
            return { success: false, message: "Failed to check if billing item is in use", error: checkError }
        }

        if (count && count > 0) {
            return {
                success: false,
                message: "Cannot delete billing item as it is used in invoices. Consider marking it as inactive instead.",
            }
        }

        const { error } = await supabase.from("billing_items").delete().eq("id", id)

        if (error) {
            console.error("Error deleting billing item:", error)
            return { success: false, message: "Failed to delete billing item", error }
        }

        await auditLogger.delete("billing_items", id, {
            userId: userData.user.id,
        })

        revalidatePath("/billing/items")
        return { success: true, message: "Billing item deleted successfully" }
    } catch (error) {
        console.error("Error deleting billing item:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

// Invoice Actions
export async function getInvoices(
    options: {
        patientId?: string
        medicalRecordId?: string
        appointmentId?: string
        status?: string
        startDate?: string
        endDate?: string
        search?: string
        page?: number
        limit?: number
    } = {},
) {
    try {
        const supabase = createServerSupabaseClient()
        const {
            patientId,
            medicalRecordId,
            appointmentId,
            status,
            startDate,
            endDate,
            search,
            page = 1,
            limit = 10,
        } = options
        const offset = (page - 1) * limit

        let query = supabase.from("invoices").select(
            `
        *,
        patient:patient_id (
          id,
          first_name,
          last_name,
          date_of_birth,
          insurance_provider,
          insurance_policy_number
        ),
        medical_record:medical_record_id (
          id,
          visit_date,
          chief_complaint
        ),
        appointment:appointment_id (
          id,
          appointment_date,
          appointment_type,
          status
        ),
        created_by_user:created_by (
          email,
          user_profiles (
            first_name,
            last_name
          )
        ),
        payments (
          id,
          payment_date,
          amount,
          payment_method
        ),
        insurance_claims (
          id,
          claim_number,
          claim_date,
          claim_amount,
          approved_amount,
          status
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

        if (appointmentId) {
            query = query.eq("appointment_id", appointmentId)
        }

        if (status) {
            query = query.eq("status", status)
        }

        if (startDate) {
            query = query.gte("issued_date", startDate)
        }

        if (endDate) {
            query = query.lte("issued_date", endDate)
        }

        if (search) {
            query = query.or(`invoice_number.ilike.%${search}%,notes.ilike.%${search}%`)
        }

        const { data, count, error } = await query
            .order("issued_date", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error("Error fetching invoices:", error)
            return { invoices: [], totalCount: 0, page, limit }
        }

        return {
            invoices: data || [],
            totalCount: count || 0,
            page,
            limit,
        }
    } catch (error) {
        console.error("Error fetching invoices:", error)
        return { invoices: [], totalCount: 0, page: 1, limit: 10 }
    }
}

export async function getInvoiceById(id: string) {
    try {
        const supabase = createServerSupabaseClient()
        const { data, error } = await supabase
            .from("invoices")
            .select(`
        *,
        patient:patient_id (
          id,
          first_name,
          last_name,
          date_of_birth,
          email,
          phone,
          address,
          city,
          state,
          zip,
          country,
          insurance_provider,
          insurance_policy_number,
          insurance_group_number,
          billing_address,
          billing_city,
          billing_state,
          billing_zip,
          billing_country
        ),
        medical_record:medical_record_id (
          id,
          visit_date,
          chief_complaint
        ),
        appointment:appointment_id (
          id,
          appointment_date,
          appointment_type,
          status
        ),
        created_by_user:created_by (
          email,
          user_profiles (
            first_name,
            last_name
          )
        ),
        invoice_items (
          id,
          billing_item_id,
          description,
          quantity,
          unit_price,
          discount_percentage,
          discount_amount,
          tax_percentage,
          tax_amount,
          total_amount,
          billing_item:billing_item_id (
            code,
            name,
            category
          )
        ),
        payments (
          id,
          payment_date,
          amount,
          payment_method,
          reference_number,
          notes,
          created_at
        ),
        insurance_claims (
          id,
          insurance_provider,
          policy_number,
          claim_number,
          claim_date,
          claim_amount,
          approved_amount,
          status,
          denial_reason,
          notes
        )
      `)
            .eq("id", id)
            .single()

        if (error) {
            console.error("Error fetching invoice:", error)
            return null
        }

        return data
    } catch (error) {
        console.error("Error fetching invoice:", error)
        return null
    }
}

export async function createInvoice(formData: FormData) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        // Generate a unique invoice number (format: INV-YYYYMMDD-XXXX)
        const today = new Date()
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
        const randomStr = Math.floor(1000 + Math.random() * 9000).toString()
        const invoiceNumber = `INV-${dateStr}-${randomStr}`

        const patientId = formData.get("patientId") as string
        const medicalRecordId = (formData.get("medicalRecordId") as string) || null
        const appointmentId = (formData.get("appointmentId") as string) || null
        const issuedDate = (formData.get("issuedDate") as string) || today.toISOString().slice(0, 10)
        const dueDate =
            (formData.get("dueDate") as string) || new Date(today.setDate(today.getDate() + 30)).toISOString().slice(0, 10)
        const notes = (formData.get("notes") as string) || null

        // Parse invoice items from JSON string
        const invoiceItemsJson = formData.get("invoiceItems") as string
        const invoiceItems = JSON.parse(invoiceItemsJson || "[]")

        // Calculate totals
        let subtotal = 0
        let totalTax = 0
        let totalDiscount = 0

        invoiceItems.forEach((item: any) => {
            subtotal += item.quantity * item.unitPrice
            totalTax += item.taxAmount || 0
            totalDiscount += item.discountAmount || 0
        })

        const totalAmount = subtotal + totalTax - totalDiscount

        // Create the invoice
        const { data: invoiceData, error: invoiceError } = await supabase
            .from("invoices")
            .insert({
                invoice_number: invoiceNumber,
                patient_id: patientId,
                medical_record_id: medicalRecordId,
                appointment_id: appointmentId,
                issued_date: issuedDate,
                due_date: dueDate,
                subtotal,
                tax_amount: totalTax,
                discount_amount: totalDiscount,
                total_amount: totalAmount,
                status: "draft",
                notes,
                created_by: userData.user.id,
            })
            .select()

        if (invoiceError) {
            console.error("Error creating invoice:", invoiceError)
            return { success: false, message: "Failed to create invoice", error: invoiceError }
        }

        const invoiceId = invoiceData[0].id

        // Create invoice items
        if (invoiceItems.length > 0) {
            const invoiceItemsToInsert = invoiceItems.map((item: any) => ({
                id: uuidv4(),
                invoice_id: invoiceId,
                billing_item_id: item.billingItemId || null,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                discount_percentage: item.discountPercentage || 0,
                discount_amount: item.discountAmount || 0,
                tax_percentage: item.taxPercentage || 0,
                tax_amount: item.taxAmount || 0,
                total_amount: item.quantity * item.unitPrice + (item.taxAmount || 0) - (item.discountAmount || 0),
            }))

            const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItemsToInsert)

            if (itemsError) {
                console.error("Error creating invoice items:", itemsError)
                // Delete the invoice if items creation fails
                await supabase.from("invoices").delete().eq("id", invoiceId)
                return { success: false, message: "Failed to create invoice items", error: itemsError }
            }
        }

        await auditLogger.create("invoices", invoiceId, {
            invoiceNumber,
            patientId,
            totalAmount,
            userId: userData.user.id,
        })

        revalidatePath("/billing/invoices")
        if (patientId) {
            revalidatePath(`/patients/${patientId}`)
        }
        if (medicalRecordId) {
            revalidatePath(`/medical-records/${medicalRecordId}`)
        }
        if (appointmentId) {
            revalidatePath(`/appointments/${appointmentId}`)
        }

        return {
            success: true,
            message: "Invoice created successfully",
            data: { id: invoiceId, invoiceNumber },
        }
    } catch (error) {
        console.error("Error creating invoice:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateInvoiceStatus(id: string, status: string, notes?: string) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const updateData: any = {
            status,
            updated_at: new Date().toISOString(),
        }

        if (notes) {
            updateData.notes = notes
        }

        const { data, error } = await supabase.from("invoices").update(updateData).eq("id", id).select()

        if (error) {
            console.error("Error updating invoice status:", error)
            return { success: false, message: "Failed to update invoice status", error }
        }

        await auditLogger.update("invoices", id, {
            status,
            userId: userData.user.id,
        })

        revalidatePath("/billing/invoices")
        revalidatePath(`/billing/invoices/${id}`)

        // Also revalidate related paths
        const { data: invoice } = await supabase
            .from("invoices")
            .select("patient_id, medical_record_id, appointment_id")
            .eq("id", id)
            .single()

        if (invoice) {
            if (invoice.patient_id) {
                revalidatePath(`/patients/${invoice.patient_id}`)
            }
            if (invoice.medical_record_id) {
                revalidatePath(`/medical-records/${invoice.medical_record_id}`)
            }
            if (invoice.appointment_id) {
                revalidatePath(`/appointments/${invoice.appointment_id}`)
            }
        }

        return { success: true, message: "Invoice status updated successfully", data: data[0] }
    } catch (error) {
        console.error("Error updating invoice status:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deleteInvoice(id: string) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        // Get invoice info before deletion for revalidation
        const { data: invoice } = await supabase
            .from("invoices")
            .select("patient_id, medical_record_id, appointment_id, status")
            .eq("id", id)
            .single()

        // Only allow deletion of draft invoices
        if (invoice && invoice.status !== "draft") {
            return {
                success: false,
                message: "Only draft invoices can be deleted. Consider cancelling the invoice instead.",
            }
        }

        // Delete the invoice (cascade will delete related items)
        const { error } = await supabase.from("invoices").delete().eq("id", id)

        if (error) {
            console.error("Error deleting invoice:", error)
            return { success: false, message: "Failed to delete invoice", error }
        }

        await auditLogger.delete("invoices", id, {
            userId: userData.user.id,
        })

        revalidatePath("/billing/invoices")

        // Also revalidate related paths
        if (invoice) {
            if (invoice.patient_id) {
                revalidatePath(`/patients/${invoice.patient_id}`)
            }
            if (invoice.medical_record_id) {
                revalidatePath(`/medical-records/${invoice.medical_record_id}`)
            }
            if (invoice.appointment_id) {
                revalidatePath(`/appointments/${invoice.appointment_id}`)
            }
        }

        return { success: true, message: "Invoice deleted successfully" }
    } catch (error) {
        console.error("Error deleting invoice:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

// Payment Actions
export async function createPayment(formData: FormData) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const invoiceId = formData.get("invoiceId") as string
        const paymentDate = formData.get("paymentDate") as string
        const amount = Number.parseFloat(formData.get("amount") as string)
        const paymentMethod = formData.get("paymentMethod") as string
        const referenceNumber = (formData.get("referenceNumber") as string) || null
        const notes = (formData.get("notes") as string) || null

        // Get the invoice to check if payment is valid
        const { data: invoice, error: invoiceError } = await supabase
            .from("invoices")
            .select("total_amount, status")
            .eq("id", invoiceId)
            .single()

        if (invoiceError) {
            console.error("Error fetching invoice:", invoiceError)
            return { success: false, message: "Failed to fetch invoice", error: invoiceError }
        }

        // Get total payments already made
        const { data: payments, error: paymentsError } = await supabase
            .from("payments")
            .select("amount")
            .eq("invoice_id", invoiceId)

        if (paymentsError) {
            console.error("Error fetching payments:", paymentsError)
            return { success: false, message: "Failed to fetch existing payments", error: paymentsError }
        }

        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
        const remainingAmount = invoice.total_amount - totalPaid

        // Check if payment amount is valid
        if (amount <= 0) {
            return { success: false, message: "Payment amount must be greater than zero" }
        }

        if (amount > remainingAmount) {
            return {
                success: false,
                message: `Payment amount exceeds the remaining balance of ${remainingAmount.toFixed(2)}`,
            }
        }

        // Create the payment
        const { data, error } = await supabase
            .from("payments")
            .insert({
                invoice_id: invoiceId,
                payment_date: paymentDate,
                amount,
                payment_method: paymentMethod,
                reference_number: referenceNumber,
                notes,
                created_by: userData.user.id,
            })
            .select()

        if (error) {
            console.error("Error creating payment:", error)
            return { success: false, message: "Failed to create payment", error }
        }

        // Update invoice status based on payment
        const newTotalPaid = totalPaid + amount
        let newStatus = invoice.status

        if (newTotalPaid >= invoice.total_amount) {
            newStatus = "paid"
        } else if (newTotalPaid > 0) {
            newStatus = "partially_paid"
        }

        if (newStatus !== invoice.status) {
            await supabase
                .from("invoices")
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", invoiceId)
        }

        await auditLogger.create("payments", data[0].id, {
            invoiceId,
            amount,
            paymentMethod,
            userId: userData.user.id,
        })

        revalidatePath("/billing/invoices")
        revalidatePath(`/billing/invoices/${invoiceId}`)

        return { success: true, message: "Payment recorded successfully", data: data[0] }
    } catch (error) {
        console.error("Error creating payment:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function deletePayment(id: string) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        // Get payment info before deletion
        const { data: payment, error: paymentError } = await supabase
            .from("payments")
            .select("invoice_id, amount")
            .eq("id", id)
            .single()

        if (paymentError) {
            console.error("Error fetching payment:", paymentError)
            return { success: false, message: "Failed to fetch payment", error: paymentError }
        }

        // Delete the payment
        const { error } = await supabase.from("payments").delete().eq("id", id)

        if (error) {
            console.error("Error deleting payment:", error)
            return { success: false, message: "Failed to delete payment", error }
        }

        // Update invoice status based on remaining payments
        const { data: remainingPayments, error: remainingError } = await supabase
            .from("payments")
            .select("amount")
            .eq("invoice_id", payment.invoice_id)

        if (remainingError) {
            console.error("Error fetching remaining payments:", remainingError)
            // Continue even if this fails
        }

        const { data: invoice, error: invoiceError } = await supabase
            .from("invoices")
            .select("total_amount, status")
            .eq("id", payment.invoice_id)
            .single()

        if (!invoiceError && invoice) {
            const totalPaid = (remainingPayments || []).reduce((sum, p) => sum + p.amount, 0)
            let newStatus = invoice.status

            if (totalPaid <= 0) {
                newStatus = "issued"
            } else if (totalPaid < invoice.total_amount) {
                newStatus = "partially_paid"
            } else {
                newStatus = "paid"
            }

            if (newStatus !== invoice.status) {
                await supabase
                    .from("invoices")
                    .update({
                        status: newStatus,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", payment.invoice_id)
            }
        }

        await auditLogger.delete("payments", id, {
            invoiceId: payment.invoice_id,
            amount: payment.amount,
            userId: userData.user.id,
        })

        revalidatePath("/billing/invoices")
        revalidatePath(`/billing/invoices/${payment.invoice_id}`)

        return { success: true, message: "Payment deleted successfully" }
    } catch (error) {
        console.error("Error deleting payment:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

// Insurance Claim Actions
export async function createInsuranceClaim(formData: FormData) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const invoiceId = formData.get("invoiceId") as string
        const insuranceProvider = formData.get("insuranceProvider") as string
        const policyNumber = formData.get("policyNumber") as string
        const claimNumber = (formData.get("claimNumber") as string) || null
        const claimDate = formData.get("claimDate") as string
        const claimAmount = Number.parseFloat(formData.get("claimAmount") as string)
        const notes = (formData.get("notes") as string) || null

        // Create the insurance claim
        const { data, error } = await supabase
            .from("insurance_claims")
            .insert({
                invoice_id: invoiceId,
                insurance_provider: insuranceProvider,
                policy_number: policyNumber,
                claim_number: claimNumber,
                claim_date: claimDate,
                claim_amount: claimAmount,
                status: "submitted",
                notes,
            })
            .select()

        if (error) {
            console.error("Error creating insurance claim:", error)
            return { success: false, message: "Failed to create insurance claim", error }
        }

        // Update invoice status to reflect claim submission
        await supabase
            .from("invoices")
            .update({
                status: "insurance_pending",
                updated_at: new Date().toISOString(),
            })
            .eq("id", invoiceId)

        await auditLogger.create("insurance_claims", data[0].id, {
            invoiceId,
            insuranceProvider,
            claimAmount,
            userId: userData.user.id,
        })

        revalidatePath("/billing/invoices")
        revalidatePath(`/billing/invoices/${invoiceId}`)

        return { success: true, message: "Insurance claim submitted successfully", data: data[0] }
    } catch (error) {
        console.error("Error creating insurance claim:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}

export async function updateInsuranceClaim(id: string, formData: FormData) {
    try {
        const supabase = createServerSupabaseClient()
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) {
            return { success: false, message: "Authentication error", error: userError }
        }

        const status = formData.get("status") as string
        const approvedAmount = formData.has("approvedAmount")
            ? Number.parseFloat(formData.get("approvedAmount") as string)
            : null
        const denialReason = (formData.get("denialReason") as string) || null
        const notes = (formData.get("notes") as string) || null

        // Get claim info before update
        const { data: claim, error: claimError } = await supabase
            .from("insurance_claims")
            .select("invoice_id, claim_amount")
            .eq("id", id)
            .single()

        if (claimError) {
            console.error("Error fetching claim:", claimError)
            return { success: false, message: "Failed to fetch claim", error: claimError }
        }

        // Update the claim
        const { data, error } = await supabase
            .from("insurance_claims")
            .update({
                status,
                approved_amount: approvedAmount,
                denial_reason: denialReason,
                notes,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()

        if (error) {
            console.error("Error updating insurance claim:", error)
            return { success: false, message: "Failed to update insurance claim", error }
        }

        // If claim is approved, create a payment for the approved amount
        if (status === "approved" && approvedAmount && approvedAmount > 0) {
            await supabase.from("payments").insert({
                invoice_id: claim.invoice_id,
                payment_date: new Date().toISOString().slice(0, 10),
                amount: approvedAmount,
                payment_method: "insurance",
                reference_number: data[0].claim_number || `Claim ID: ${id}`,
                notes: `Insurance payment for approved claim (${data[0].insurance_provider})`,
                created_by: userData.user.id,
            })

            // Update invoice status
            const { data: invoice } = await supabase
                .from("invoices")
                .select("total_amount")
                .eq("id", claim.invoice_id)
                .single()

            if (invoice) {
                const remainingBalance = invoice.total_amount - approvedAmount
                const newStatus = remainingBalance <= 0 ? "paid" : "partially_paid"

                await supabase
                    .from("invoices")
                    .update({
                        status: newStatus,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", claim.invoice_id)
            }
        } else if (status === "denied") {
            // Update invoice status if claim is denied
            await supabase
                .from("invoices")
                .update({
                    status: "issued", // Reset to issued so patient can pay
                    updated_at: new Date().toISOString(),
                })
                .eq("id", claim.invoice_id)
        }

        await auditLogger.update("insurance_claims", id, {
            status,
            approvedAmount,
            userId: userData.user.id,
        })

        revalidatePath("/billing/invoices")
        revalidatePath(`/billing/invoices/${claim.invoice_id}`)

        return { success: true, message: "Insurance claim updated successfully", data: data[0] }
    } catch (error) {
        console.error("Error updating insurance claim:", error)
        return { success: false, message: "An unexpected error occurred", error }
    }
}
