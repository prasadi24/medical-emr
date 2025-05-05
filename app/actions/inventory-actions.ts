"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { auditLogger } from "@/lib/audit-logger"

// Inventory Categories
export async function getInventoryCategories() {
    const supabase = createServerSupabaseClient()

    const { data: categories, error } = await supabase.from("inventory_categories").select("*").order("name")

    if (error) {
        console.error("Error fetching inventory categories:", error)
        throw new Error(`Failed to fetch inventory categories: ${error.message}`)
    }

    await auditLogger.view("inventory_categories")

    return categories || []
}

export async function getInventoryCategory(id: string) {
    const supabase = createServerSupabaseClient()

    const { data: category, error } = await supabase.from("inventory_categories").select("*").eq("id", id).single()

    if (error) {
        console.error("Error fetching inventory category:", error)
        return null
    }

    await auditLogger.view("inventory_categories", id)

    return category
}

export async function createInventoryCategory(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to create an inventory category")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const parentCategoryId = (formData.get("parentCategoryId") as string) || null

    const categoryData = {
        id: uuidv4(),
        name,
        description,
        parent_category_id: parentCategoryId,
    }

    const { data, error } = await supabase.from("inventory_categories").insert(categoryData).select()

    if (error) {
        console.error("Error creating inventory category:", error)
        throw new Error(`Failed to create inventory category: ${error.message}`)
    }

    await auditLogger.create("inventory_categories", categoryData.id, { name })

    revalidatePath("/inventory/categories")
    redirect("/inventory/categories")
}

export async function updateInventoryCategory(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to update an inventory category")
    }

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const parentCategoryId = (formData.get("parentCategoryId") as string) || null

    const categoryData = {
        name,
        description,
        parent_category_id: parentCategoryId,
    }

    const { error } = await supabase.from("inventory_categories").update(categoryData).eq("id", id)

    if (error) {
        console.error("Error updating inventory category:", error)
        throw new Error(`Failed to update inventory category: ${error.message}`)
    }

    await auditLogger.update("inventory_categories", id, { name })

    revalidatePath("/inventory/categories")
    redirect("/inventory/categories")
}

export async function deleteInventoryCategory(id: string) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to delete an inventory category")
    }

    // Check if category has items
    const { data: items, error: itemsError } = await supabase
        .from("inventory_items")
        .select("id")
        .eq("category_id", id)
        .limit(1)

    if (itemsError) {
        console.error("Error checking inventory items:", itemsError)
        throw new Error(`Failed to check inventory items: ${itemsError.message}`)
    }

    if (items && items.length > 0) {
        throw new Error("Cannot delete category with associated items")
    }

    // Check if category has child categories
    const { data: childCategories, error: childCategoriesError } = await supabase
        .from("inventory_categories")
        .select("id")
        .eq("parent_category_id", id)
        .limit(1)

    if (childCategoriesError) {
        console.error("Error checking child categories:", childCategoriesError)
        throw new Error(`Failed to check child categories: ${childCategoriesError.message}`)
    }

    if (childCategories && childCategories.length > 0) {
        throw new Error("Cannot delete category with child categories")
    }

    const { error } = await supabase.from("inventory_categories").delete().eq("id", id)

    if (error) {
        console.error("Error deleting inventory category:", error)
        throw new Error(`Failed to delete inventory category: ${error.message}`)
    }

    await auditLogger.delete("inventory_categories", id)

    revalidatePath("/inventory/categories")
}

// Inventory Items
export async function getInventoryItems(params?: {
    categoryId?: string
    search?: string
    isActive?: boolean
    isMedication?: boolean
    lowStock?: boolean
    limit?: number
    offset?: number
}) {
    const supabase = createServerSupabaseClient()
    const { categoryId, search, isActive, isMedication, lowStock, limit = 50, offset = 0 } = params || {}

    let query = supabase
        .from("inventory_items")
        .select(
            `
      *,
      category:category_id(id, name),
      stock:inventory_stock(id, quantity_in_stock, expiry_date, batch_number)
    `,
            { count: "exact" },
        )
        .order("name")
        .range(offset, offset + limit - 1)

    if (categoryId) {
        query = query.eq("category_id", categoryId)
    }

    if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (isActive !== undefined) {
        query = query.eq("is_active", isActive)
    }

    if (isMedication !== undefined) {
        query = query.eq("is_medication", isMedication)
    }

    const { data: items, error, count } = await query

    if (error) {
        console.error("Error fetching inventory items:", error)
        throw new Error(`Failed to fetch inventory items: ${error.message}`)
    }

    // If lowStock is true, filter items with stock below reorder level
    let filteredItems = items || []
    if (lowStock) {
        filteredItems =
            items?.filter((item) => {
                const totalStock = item.stock.reduce((sum: number, stockItem: any) => sum + stockItem.quantity_in_stock, 0)
                return totalStock <= item.reorder_level
            }) || []
    }

    await auditLogger.view("inventory_items", undefined, { categoryId, search, isActive, isMedication, lowStock })

    return filteredItems
}

export async function getInventoryItem(id: string) {
    const supabase = createServerSupabaseClient()

    const { data: item, error } = await supabase
        .from("inventory_items")
        .select(
            `
      *,
      category:category_id(id, name),
      stock:inventory_stock(*)
    `,
        )
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching inventory item:", error)
        return null
    }

    await auditLogger.view("inventory_items", id)

    return item
}

export async function createInventoryItem(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to create an inventory item")
    }

    const name = formData.get("name") as string
    const sku = formData.get("sku") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const unitOfMeasure = formData.get("unitOfMeasure") as string
    const minimumStockLevel = Number.parseInt(formData.get("minimumStockLevel") as string) || 0
    const reorderLevel = Number.parseInt(formData.get("reorderLevel") as string) || 10
    const reorderQuantity = Number.parseInt(formData.get("reorderQuantity") as string) || 20
    const location = formData.get("location") as string
    const isMedication = formData.get("isMedication") === "on"
    const requiresPrescription = formData.get("requiresPrescription") === "on"
    const isActive = formData.get("isActive") !== "off"

    const itemData = {
        id: uuidv4(),
        name,
        sku,
        description,
        category_id: categoryId,
        unit_of_measure: unitOfMeasure,
        minimum_stock_level: minimumStockLevel,
        reorder_level: reorderLevel,
        reorder_quantity: reorderQuantity,
        location,
        is_medication: isMedication,
        requires_prescription: requiresPrescription,
        is_active: isActive,
    }

    const { data, error } = await supabase.from("inventory_items").insert(itemData).select()

    if (error) {
        console.error("Error creating inventory item:", error)
        throw new Error(`Failed to create inventory item: ${error.message}`)
    }

    await auditLogger.create("inventory_items", itemData.id, { name, sku })

    revalidatePath("/inventory/items")
    redirect("/inventory/items")
}

export async function updateInventoryItem(formData: FormData) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to update an inventory item")
    }

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const sku = formData.get("sku") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const unitOfMeasure = formData.get("unitOfMeasure") as string
    const minimumStockLevel = Number.parseInt(formData.get("minimumStockLevel") as string) || 0
    const reorderLevel = Number.parseInt(formData.get("reorderLevel") as string) || 10
    const reorderQuantity = Number.parseInt(formData.get("reorderQuantity") as string) || 20
    const location = formData.get("location") as string
    const isMedication = formData.get("isMedication") === "on"
    const requiresPrescription = formData.get("requiresPrescription") === "on"
    const isActive = formData.get("isActive") !== "off"

    const itemData = {
        name,
        sku,
        description,
        category_id: categoryId,
        unit_of_measure: unitOfMeasure,
        minimum_stock_level: minimumStockLevel,
        reorder_level: reorderLevel,
        reorder_quantity: reorderQuantity,
        location,
        is_medication: isMedication,
        requires_prescription: requiresPrescription,
        is_active: isActive,
    }

    const { error } = await supabase.from("inventory_items").update(itemData).eq("id", id)

    if (error) {
        console.error("Error updating inventory item:", error)
        throw new Error(`Failed to update inventory item: ${error.message}`)
    }

    await auditLogger.update("inventory_items", id, { name, sku })

    revalidatePath("/inventory/items")
    redirect("/inventory/items")
}

export async function deleteInventoryItem(id: string) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to delete an inventory item")
    }

    // Check if item has transactions
    const { data: transactions, error: transactionsError } = await supabase
        .from("inventory_transactions")
        .select("id")
        .eq("item_id", id)
        .limit(1)

    if (transactionsError) {
        console.error("Error checking inventory transactions:", transactionsError)
        throw new Error(`Failed to check inventory transactions: ${transactionsError.message}`)
    }

    if (transactions && transactions.length > 0) {
        // Delete associated transactions first
        const { error: deleteTransactionsError } = await supabase.from("inventory_transactions").delete().eq("item_id", id)

        if (deleteTransactionsError) {
            console.error("Error deleting associated transactions:", deleteTransactionsError)
            throw new Error(`Failed to delete associated transactions: ${deleteTransactionsError.message}`)
        }
    }

    // Delete the item
    const { error } = await supabase.from("inventory_items").delete().eq("id", id)

    if (error) {
        console.error("Error deleting inventory item:", error)
        throw new Error(`Failed to delete inventory item: ${error.message}`)
    }

    await auditLogger.delete("inventory_items", id)

    revalidatePath("/inventory/items")
}

// Inventory Transactions
export async function getInventoryTransactions(params?: {
    itemId?: string
    stockId?: string
    transactionType?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
}) {
    const supabase = createServerSupabaseClient()
    const { itemId, stockId, transactionType, startDate, endDate, limit = 50, offset = 0 } = params || {}

    let query = supabase
        .from("inventory_transactions")
        .select(
            `
      *,
      item:item_id(id, name, sku, unit_of_measure),
      stock:stock_id(id, batch_number, expiry_date),
      user:performed_by(id, email)
    `,
            { count: "exact" },
        )
        .order("transaction_date", { ascending: false })
        .range(offset, offset + limit - 1)

    if (itemId) {
        query = query.eq("item_id", itemId)
    }

    if (stockId) {
        query = query.eq("stock_id", stockId)
    }

    if (transactionType) {
        query = query.eq("transaction_type", transactionType)
    }

    if (startDate) {
        query = query.gte("transaction_date", startDate)
    }

    if (endDate) {
        query = query.lte("transaction_date", endDate)
    }

    const { data: transactions, error, count } = await query

    if (error) {
        console.error("Error fetching inventory transactions:", error)
        throw new Error(`Failed to fetch inventory transactions: ${error.message}`)
    }

    await auditLogger.view("inventory_transactions", undefined, {
        itemId,
        stockId,
        transactionType,
        startDate,
        endDate,
    })

    return transactions || []
}

export async function getInventoryTransaction(id: string) {
    const supabase = createServerSupabaseClient()

    const { data: transaction, error } = await supabase
        .from("inventory_transactions")
        .select(
            `
      *,
      item:item_id(id, name, sku, unit_of_measure),
      stock:stock_id(id, batch_number, expiry_date),
      user:performed_by(id, email)
    `,
        )
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching inventory transaction:", error)
        return null
    }

    await auditLogger.view("inventory_transactions", id)

    return transaction
}

export async function getInventoryItemTransactions(itemId: string) {
    const supabase = createServerSupabaseClient()

    const { data: transactions, error } = await supabase
        .from("inventory_transactions")
        .select(
            `
      *,
      item:item_id(id, name, sku, unit_of_measure),
      stock:stock_id(id, batch_number, expiry_date),
      user:performed_by(id, email)
    `,
        )
        .eq("item_id", itemId)
        .order("transaction_date", { ascending: false })

    if (error) {
        console.error("Error fetching item transactions:", error)
        throw new Error(`Failed to fetch item transactions: ${error.message}`)
    }

    await auditLogger.view("inventory_transactions", undefined, { itemId })

    return transactions || []
}

export async function createInventoryTransaction(data: any) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to create an inventory transaction")
    }

    // Get the current item stock
    const { data: item, error: itemError } = await supabase
        .from("inventory_items")
        .select("current_stock")
        .eq("id", data.item_id)
        .single()

    if (itemError) {
        console.error("Error fetching item for transaction:", itemError)
        throw new Error(`Failed to fetch item for transaction: ${itemError.message}`)
    }

    let newStock = item.current_stock || 0

    // Update stock based on transaction type
    if (data.transaction_type === "purchase" || data.transaction_type === "adjustment") {
        newStock += Number(data.quantity)
    } else if (data.transaction_type === "usage" || data.transaction_type === "return") {
        newStock -= Number(data.quantity)

        // Check if we have enough stock
        if (newStock < 0 && data.transaction_type === "usage") {
            throw new Error("Insufficient stock for this transaction")
        }
    }

    // Create the transaction
    const transactionData = {
        id: uuidv4(),
        ...data,
        performed_by: user.id,
        transaction_date: data.transaction_date || new Date().toISOString(),
    }

    const { data: transaction, error: transactionError } = await supabase
        .from("inventory_transactions")
        .insert(transactionData)
        .select()
        .single()

    if (transactionError) {
        console.error("Error creating inventory transaction:", transactionError)
        throw new Error(`Failed to create inventory transaction: ${transactionError.message}`)
    }

    // Update the item stock
    const { error: updateError } = await supabase
        .from("inventory_items")
        .update({ current_stock: newStock })
        .eq("id", data.item_id)

    if (updateError) {
        console.error("Error updating item stock:", updateError)

        // Rollback by deleting the transaction
        await supabase.from("inventory_transactions").delete().eq("id", transaction.id)

        throw new Error(`Failed to update item stock: ${updateError.message}`)
    }

    await auditLogger.create("inventory_transactions", transaction.id, {
        item_id: data.item_id,
        transaction_type: data.transaction_type,
        quantity: data.quantity,
    })

    revalidatePath("/inventory/transactions")
    revalidatePath("/inventory/items")
    revalidatePath(`/inventory/items/${data.item_id}`)

    return transaction
}

export async function updateInventoryTransaction(id: string, data: any) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to update an inventory transaction")
    }

    // Get the original transaction
    const { data: originalTransaction, error: originalError } = await supabase
        .from("inventory_transactions")
        .select("*")
        .eq("id", id)
        .single()

    if (originalError) {
        console.error("Error fetching original transaction:", originalError)
        throw new Error(`Failed to fetch original transaction: ${originalError.message}`)
    }

    // Get the current item stock
    const { data: item, error: itemError } = await supabase
        .from("inventory_items")
        .select("current_stock")
        .eq("id", originalTransaction.item_id)
        .single()

    if (itemError) {
        console.error("Error fetching item for transaction:", itemError)
        throw new Error(`Failed to fetch item for transaction: ${itemError.message}`)
    }

    // Calculate the stock adjustment needed
    let stockAdjustment = 0

    // Reverse the effect of the original transaction
    if (originalTransaction.transaction_type === "purchase" || originalTransaction.transaction_type === "adjustment") {
        stockAdjustment -= Number(originalTransaction.quantity)
    } else if (originalTransaction.transaction_type === "usage" || originalTransaction.transaction_type === "return") {
        stockAdjustment += Number(originalTransaction.quantity)
    }

    // Apply the effect of the new transaction
    if (data.transaction_type === "purchase" || data.transaction_type === "adjustment") {
        stockAdjustment += Number(data.quantity)
    } else if (data.transaction_type === "usage" || data.transaction_type === "return") {
        stockAdjustment -= Number(data.quantity)
    }

    // Calculate new stock level
    const newStock = item.current_stock + stockAdjustment

    // Check if we have enough stock
    if (newStock < 0) {
        throw new Error("This update would result in negative stock")
    }

    // Update the transaction
    const { data: transaction, error: transactionError } = await supabase
        .from("inventory_transactions")
        .update({
            ...data,
            performed_by: user.id,
        })
        .eq("id", id)
        .select()
        .single()

    if (transactionError) {
        console.error("Error updating inventory transaction:", transactionError)
        throw new Error(`Failed to update inventory transaction: ${transactionError.message}`)
    }

    // Update the item stock
    const { error: updateError } = await supabase
        .from("inventory_items")
        .update({ current_stock: newStock })
        .eq("id", originalTransaction.item_id)

    if (updateError) {
        console.error("Error updating item stock:", updateError)
        throw new Error(`Failed to update item stock: ${updateError.message}`)
    }

    await auditLogger.update("inventory_transactions", id, {
        original: {
            item_id: originalTransaction.item_id,
            transaction_type: originalTransaction.transaction_type,
            quantity: originalTransaction.quantity,
        },
        updated: {
            item_id: data.item_id,
            transaction_type: data.transaction_type,
            quantity: data.quantity,
        },
    })

    revalidatePath("/inventory/transactions")
    revalidatePath("/inventory/items")
    revalidatePath(`/inventory/items/${originalTransaction.item_id}`)
}

export async function deleteInventoryTransaction(id: string) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to delete an inventory transaction")
    }

    // Get the transaction to be deleted
    const { data: transaction, error: transactionError } = await supabase
        .from("inventory_transactions")
        .select("*")
        .eq("id", id)
        .single()

    if (transactionError) {
        console.error("Error fetching transaction for deletion:", transactionError)
        throw new Error(`Failed to fetch transaction for deletion: ${transactionError.message}`)
    }

    // Get the current item stock
    const { data: item, error: itemError } = await supabase
        .from("inventory_items")
        .select("current_stock")
        .eq("id", transaction.item_id)
        .single()

    if (itemError) {
        console.error("Error fetching item for transaction deletion:", itemError)
        throw new Error(`Failed to fetch item for transaction deletion: ${itemError.message}`)
    }

    // Calculate the stock adjustment needed
    let newStock = item.current_stock

    // Reverse the effect of the transaction being deleted
    if (transaction.transaction_type === "purchase" || transaction.transaction_type === "adjustment") {
        newStock -= Number(transaction.quantity)
    } else if (transaction.transaction_type === "usage" || transaction.transaction_type === "return") {
        newStock += Number(transaction.quantity)
    }

    // Check if we have enough stock
    if (newStock < 0) {
        throw new Error("Deleting this transaction would result in negative stock")
    }

    // Delete the transaction
    const { error: deleteError } = await supabase.from("inventory_transactions").delete().eq("id", id)

    if (deleteError) {
        console.error("Error deleting inventory transaction:", deleteError)
        throw new Error(`Failed to delete inventory transaction: ${deleteError.message}`)
    }

    // Update the item stock
    const { error: updateError } = await supabase
        .from("inventory_items")
        .update({ current_stock: newStock })
        .eq("id", transaction.item_id)

    if (updateError) {
        console.error("Error updating item stock after transaction deletion:", updateError)
        throw new Error(`Failed to update item stock after transaction deletion: ${updateError.message}`)
    }

    await auditLogger.delete("inventory_transactions", id, {
        item_id: transaction.item_id,
        transaction_type: transaction.transaction_type,
        quantity: transaction.quantity,
    })

    revalidatePath("/inventory/transactions")
    revalidatePath("/inventory/items")
    revalidatePath(`/inventory/items/${transaction.item_id}`)
}

// Suppliers
export async function getInventorySuppliers() {
    const supabase = createServerSupabaseClient()

    const { data: suppliers, error } = await supabase.from("inventory_suppliers").select("*").order("name")

    if (error) {
        console.error("Error fetching inventory suppliers:", error)
        throw new Error(`Failed to fetch inventory suppliers: ${error.message}`)
    }

    await auditLogger.view("inventory_suppliers")

    return suppliers || []
}

export async function getInventorySupplier(id: string) {
    const supabase = createServerSupabaseClient()

    const { data: supplier, error } = await supabase.from("inventory_suppliers").select("*").eq("id", id).single()

    if (error) {
        console.error("Error fetching inventory supplier:", error)
        return null
    }

    await auditLogger.view("inventory_suppliers", id)

    return supplier
}

export async function getInventorySupplierTransactions(supplierId: string) {
    const supabase = createServerSupabaseClient()

    const { data: transactions, error } = await supabase
        .from("inventory_transactions")
        .select(
            `
      *,
      item:item_id(id, name, sku, unit_of_measure)
    `,
        )
        .eq("supplier_id", supplierId)
        .order("transaction_date", { ascending: false })

    if (error) {
        console.error("Error fetching supplier transactions:", error)
        throw new Error(`Failed to fetch supplier transactions: ${error.message}`)
    }

    await auditLogger.view("inventory_transactions", undefined, { supplierId })

    return transactions || []
}

export async function createInventorySupplier(data: any) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to create a supplier")
    }

    const supplierData = {
        id: uuidv4(),
        ...data,
        created_by: user.id,
        created_at: new Date().toISOString(),
    }

    const { data: supplier, error } = await supabase.from("inventory_suppliers").insert(supplierData).select().single()

    if (error) {
        console.error("Error creating inventory supplier:", error)
        throw new Error(`Failed to create inventory supplier: ${error.message}`)
    }

    await auditLogger.create("inventory_suppliers", supplier.id, { name: data.name })

    revalidatePath("/inventory/suppliers")
    return supplier
}

export async function updateInventorySupplier(id: string, data: any) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to update a supplier")
    }

    const { data: supplier, error } = await supabase
        .from("inventory_suppliers")
        .update({
            ...data,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.error("Error updating inventory supplier:", error)
        throw new Error(`Failed to update inventory supplier: ${error.message}`)
    }

    await auditLogger.update("inventory_suppliers", id, { name: data.name })

    revalidatePath("/inventory/suppliers")
    revalidatePath(`/inventory/suppliers/${id}`)
    return supplier
}

export async function deleteInventorySupplier(id: string) {
    const supabase = createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("You must be logged in to delete a supplier")
    }

    // Check if supplier has transactions
    const { data: transactions, error: transactionsError } = await supabase
        .from("inventory_transactions")
        .select("id")
        .eq("supplier_id", id)
        .limit(1)

    if (transactionsError) {
        console.error("Error checking supplier transactions:", transactionsError)
        throw new Error(`Failed to check supplier transactions: ${transactionsError.message}`)
    }

    if (transactions && transactions.length > 0) {
        throw new Error("Cannot delete supplier with associated transactions")
    }

    const { error } = await supabase.from("inventory_suppliers").delete().eq("id", id)

    if (error) {
        console.error("Error deleting inventory supplier:", error)
        throw new Error(`Failed to delete inventory supplier: ${error.message}`)
    }

    await auditLogger.delete("inventory_suppliers", id)

    revalidatePath("/inventory/suppliers")
}

// Dashboard Stats
export async function getInventoryDashboardStats() {
    const supabase = createServerSupabaseClient()

    // Get total items count
    const { data: items, error: itemsError } = await supabase
        .from("inventory_items")
        .select("id, name, current_stock, reorder_level, unit_price")

    if (itemsError) {
        console.error("Error fetching inventory items for dashboard:", itemsError)
        throw new Error(`Failed to fetch inventory items for dashboard: ${itemsError.message}`)
    }

    // Calculate stats
    const totalItems = items?.length || 0
    const lowStockItems =
        items?.filter((item) => item.current_stock <= item.reorder_level && item.current_stock > 0).length || 0
    const outOfStockItems = items?.filter((item) => item.current_stock <= 0).length || 0
    const totalValue = items?.reduce((sum, item) => sum + (item.current_stock || 0) * (item.unit_price || 0), 0) || 0

    // Get recent transactions
    const { data: recentTransactions, error: transactionsError } = await supabase
        .from("inventory_transactions")
        .select(`
      id,
      transaction_type,
      quantity,
      transaction_date,
      item:item_id(id, name)
    `)
        .order("transaction_date", { ascending: false })
        .limit(5)

    if (transactionsError) {
        console.error("Error fetching recent transactions for dashboard:", transactionsError)
        throw new Error(`Failed to fetch recent transactions for dashboard: ${transactionsError.message}`)
    }

    // Format transactions for display
    const formattedTransactions = []
    for (const transaction of recentTransactions || []) {
        formattedTransactions.push({
            id: transaction.id,
            transaction_type: transaction.transaction_type,
            quantity: transaction.quantity,
            transaction_date: transaction.transaction_date,
            item_name: Array.isArray(transaction.item) && transaction.item.length > 0
                ? transaction.item[0]?.name || "Unknown Item"
                : "Unknown Item",
        })
    }

    // Get categories with item counts
    const { data: categories, error: categoriesError } = await supabase
        .from("inventory_categories")
        .select("id, name")
        .order("name")

    if (categoriesError) {
        console.error("Error fetching categories for dashboard:", categoriesError)
        throw new Error(`Failed to fetch categories for dashboard: ${categoriesError.message}`)
    }

    // For each category, count items separately
    const topCategoriesArray = []
    for (const category of categories || []) {
        const { count, error: countError } = await supabase
            .from("inventory_items")
            .select("id", { count: "exact" })
            .eq("category_id", category.id)

        if (countError) {
            console.error(`Error counting items for category ${category.id}:`, countError)
            continue
        }

        topCategoriesArray.push({
            name: category.name,
            count: count || 0,
        })
    }

    // Sort by count and take top 5
    const sortedTopCategories = [...topCategoriesArray].sort((a, b) => b.count - a.count).slice(0, 5)

    return {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue,
        recentTransactions: formattedTransactions,
        topCategories: sortedTopCategories,
    }
}