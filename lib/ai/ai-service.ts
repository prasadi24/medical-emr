import { generateText as aiGenerateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"

// AI Models configuration
const GENERAL_MODEL = "gpt-4o"
const MEDICAL_MODEL = "gpt-4o" // In a real app, this could be a specialized medical model

export type AIServiceOptions = {
    temperature?: number
    model?: string
    maxTokens?: number
    systemPrompt?: string
}

type PatientData = {
    age: number
    gender: string
    allergies: string[]
    activeConditions: string[]
    currentMedications: string[]
}

/**
 * AI Service for Medical EMR system
 * Provides functions for various AI features throughout the application
 */
export class AIService {
    // Default options
    private static defaultOptions: AIServiceOptions = {
        temperature: 0.7,
        model: GENERAL_MODEL,
        maxTokens: 1000,
        systemPrompt: "You are a medical AI assistant helping healthcare professionals.",
    }

    /**
     * Generate text with AI
     */
    static async generateText({
        prompt,
        system,
        temperature = 0.7,
        model = GENERAL_MODEL,
        maxTokens,
    }: {
        prompt: string
        system?: string
        temperature?: number
        model?: string
        maxTokens?: number
    }) {
        try {
            const { text } = await aiGenerateText({
                model: openai(model),
                prompt,
                system,
                temperature,
                maxTokens,
            })

            return { text }
        } catch (error) {
            console.error("Error generating text:", error)
            return { text: null, error }
        }
    }

    /**
     * Generate medical insights from clinical notes
     */
    static async generateMedicalInsights(clinicalNotes: string, options?: AIServiceOptions) {
        const prompt = `
    Analyze the following clinical notes and provide:
    1. Key findings summary
    2. Potential diagnoses to consider
    3. Suggested follow-up actions
    
    Clinical Notes:
    ${clinicalNotes}
    `

        const mergedOptions = { ...this.defaultOptions, ...options }
        const systemPrompt =
            options?.systemPrompt ||
            "You are a medical AI assistant. Provide concise, accurate medical insights based on clinical notes."

        try {
            const { text } = await aiGenerateText({
                model: openai(mergedOptions.model || MEDICAL_MODEL),
                prompt,
                system: systemPrompt,
                temperature: mergedOptions.temperature,
                maxTokens: mergedOptions.maxTokens,
            })

            return { success: true, data: text }
        } catch (error) {
            console.error("Error generating medical insights:", error)
            return { success: false, error }
        }
    }

    /**
     * Generate treatment plan suggestions based on diagnosis
     */
    static async generateTreatmentSuggestions(
        patientData: PatientData,
        options: { diagnosis: string } & AIServiceOptions,
    ) {
        const prompt = `
    Generate evidence-based treatment suggestions for the following:
    
    Diagnosis: ${options.diagnosis}
    
    Patient Information:
    - Age: ${patientData.age}
    - Gender: ${patientData.gender}
    - Allergies: ${patientData.allergies.join(", ") || "None"}
    - Active Conditions: ${patientData.activeConditions.join(", ") || "None"}
    - Current Medications: ${patientData.currentMedications.join(", ") || "None"}
    
    Provide:
    1. First-line treatments (medications, dosage, duration)
    2. Alternative treatments
    3. Non-pharmacological interventions
    4. Follow-up recommendations
    5. Patient education points
    `

        const mergedOptions = { ...this.defaultOptions, ...options }
        const systemPrompt =
            options?.systemPrompt ||
            "You are a clinical decision support system. Provide evidence-based treatment options based on current medical guidelines."

        try {
            const { text } = await aiGenerateText({
                model: openai(mergedOptions.model || MEDICAL_MODEL),
                prompt,
                system: systemPrompt,
                temperature: mergedOptions.temperature || 0.4, // Lower temperature for medical treatments
                maxTokens: mergedOptions.maxTokens,
            })

            return { success: true, data: text }
        } catch (error) {
            console.error("Error generating treatment suggestions:", error)
            return { success: false, error }
        }
    }

    /**
     * Generate a summary of patient medical history
     */
    static async summarizePatientHistory(patientHistory: string, options?: AIServiceOptions) {
        const prompt = `
    Summarize the following patient medical history into a concise overview:
    
    ${patientHistory}
    
    Include:
    1. Key chronic conditions
    2. Major surgical history
    3. Important allergies
    4. Significant family history
    5. Current medication summary
    `

        const mergedOptions = { ...this.defaultOptions, ...options }
        const systemPrompt =
            options?.systemPrompt ||
            "You are a medical summarization tool. Create concise, accurate summaries of patient histories."

        try {
            const { text } = await aiGenerateText({
                model: openai(mergedOptions.model || MEDICAL_MODEL),
                prompt,
                system: systemPrompt,
                temperature: mergedOptions.temperature || 0.3,
                maxTokens: mergedOptions.maxTokens || 500,
            })

            return { success: true, data: text }
        } catch (error) {
            console.error("Error summarizing patient history:", error)
            return { success: false, error }
        }
    }

    /**
     * Create a medical chat completion (streaming)
     */
    static createMedicalChatStream(
        messages: { role: "user" | "system" | "assistant"; content: string }[],
        options?: AIServiceOptions,
    ) {
        const mergedOptions = { ...this.defaultOptions, ...options }
        const systemPrompt =
            options?.systemPrompt ||
            "You are a medical assistant helping healthcare professionals. Provide accurate, evidence-based responses."

        // Prepare messages for the AI model
        const fullMessages = [{ role: "system", content: systemPrompt }, ...messages]

        const prompt = fullMessages
            .map(
                (msg) => `${msg.role === "user" ? "Human" : msg.role === "assistant" ? "Assistant" : "System"}: ${msg.content}`,
            )
            .join("\n\n")

        try {
            return streamText({
                model: openai(mergedOptions.model || MEDICAL_MODEL),
                prompt,
                system: systemPrompt,
                temperature: mergedOptions.temperature,
                maxTokens: mergedOptions.maxTokens,
            })
        } catch (error) {
            console.error("Error creating medical chat stream:", error)
            throw error
        }
    }

    /**
     * Extract structured data from unstructured medical text
     */
    static async extractStructuredData(text: string, options?: AIServiceOptions) {
        const prompt = `
    Extract structured information from the following medical text:
    
    ${text}
    
    Return a JSON object with the following fields (if present):
    - diagnoses: Array of diagnoses mentioned
    - medications: Array of medications with dosage and frequency
    - procedures: Array of procedures mentioned
    - vitals: Object containing blood pressure, heart rate, respiratory rate, temperature
    - lab_values: Array of lab tests with values and units
    - allergies: Array of allergies mentioned
    `

        const mergedOptions = { ...this.defaultOptions, ...options }
        const systemPrompt =
            options?.systemPrompt ||
            "You are a medical NLP system. Extract structured data from medical text. Return valid JSON only."

        try {
            const { text: jsonStr } = await aiGenerateText({
                model: openai(mergedOptions.model || MEDICAL_MODEL),
                prompt,
                system: systemPrompt,
                temperature: 0.1, // Very low temperature for structured extraction
                maxTokens: mergedOptions.maxTokens,
            })

            if (!jsonStr) {
                return { success: false, error: "No response from AI" }
            }

            // Parse the JSON response
            const structuredData = JSON.parse(jsonStr)
            return { success: true, data: structuredData }
        } catch (error) {
            console.error("Error extracting structured data:", error)
            return { success: false, error }
        }
    }

    /**
     * Generate clinical documentation from notes
     */
    static async generateClinicalDocumentation(
        notes: string,
        documentType: "progress_note" | "discharge_summary" | "consultation" | "procedure_note",
        options?: AIServiceOptions,
    ) {
        const templatePrompts = {
            progress_note: `
        Generate a comprehensive progress note from the following clinical information:
        
        ${notes}
        
        Include:
        - Subjective (patient's chief complaint, history)
        - Objective (physical examination findings, vital signs, test results)
        - Assessment (diagnosis, clinical impression)
        - Plan (treatment plan, medications, follow-up)
      `,
            discharge_summary: `
        Generate a discharge summary from the following notes:
        
        ${notes}
        
        Include:
        - Admission date and reason
        - Hospital course
        - Procedures performed
        - Discharge diagnosis
        - Discharge medications
        - Follow-up instructions
      `,
            consultation: `
        Generate a consultation report from the following notes:
        
        ${notes}
        
        Include:
        - Reason for consultation
        - History of present illness
        - Review of relevant systems
        - Physical examination
        - Assessment and recommendations
      `,
            procedure_note: `
        Generate a procedure note from the following information:
        
        ${notes}
        
        Include:
        - Procedure performed
        - Indication
        - Technique
        - Findings
        - Complications (if any)
        - Post-procedure plan
      `,
        }

        const prompt = templatePrompts[documentType]
        const mergedOptions = { ...this.defaultOptions, ...options }
        const systemPrompt =
            options?.systemPrompt ||
            "You are a medical documentation assistant. Generate professional, accurate clinical documentation following standard formats."

        try {
            const { text } = await aiGenerateText({
                model: openai(mergedOptions.model || MEDICAL_MODEL),
                prompt,
                system: systemPrompt,
                temperature: mergedOptions.temperature || 0.4,
                maxTokens: mergedOptions.maxTokens || 2000,
            })

            return { success: true, data: text }
        } catch (error) {
            console.error("Error generating clinical documentation:", error)
            return { success: false, error }
        }
    }
}
