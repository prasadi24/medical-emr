"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, Loader2, InfoIcon } from "lucide-react"

type Message = {
    role: "user" | "assistant" | "system"
    content: string
}

type PatientAIChatProps = {
    patientId: string
    patientName: string
}

export default function PatientAIChat({ patientId, patientName }: PatientAIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "system",
            content: "Welcome to your medical assistant. How can I help you today?",
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = async () => {
        if (input.trim() === "") return
        const userMessage = input.trim()
        setInput("")

        // Add user message to chat
        const newMessages: Message[] = [...messages, { role: "user", content: userMessage }]
        setMessages(newMessages)

        setIsLoading(true)

        try {
            // Create formatted chat history for AI
            const chatHistory = newMessages
                .filter((m) => m.role !== "system")
                .map((m) => ({
                    role: m.role,
                    content: m.content,
                }))

            // Set system prompt with patient context
            const systemPrompt = `You are a medical assistant chatbot helping patient ${patientName} (ID: ${patientId}).
      Provide helpful, accurate health information, but avoid giving specific medical advice or diagnoses.
      For serious concerns, recommend consulting with a healthcare professional.
      For medication questions, remind that a doctor should be consulted.
      Be empathetic, clear, and concise in your responses.`

            // Get AI response
            const result = await streamAIResponse(chatHistory, systemPrompt)

            // Add AI response to chat
            setMessages((prev) => [...prev, { role: "assistant", content: result }])
        } catch (error) {
            console.error("Error sending message:", error)
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "I'm sorry, I encountered an error. Please try again later.",
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    // Mock streaming for this demonstration
    const streamAIResponse = async (
        messages: { role: string; content: string }[],
        systemPrompt: string,
    ): Promise<string> => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simple mock responses based on message content
        const userMessage = messages[messages.length - 1].content.toLowerCase()

        if (userMessage.includes("hello") || userMessage.includes("hi")) {
            return `Hello! How can I assist you with your health questions today?`
        } else if (userMessage.includes("appointment")) {
            return `If you'd like to schedule an appointment, you can do so through the Appointments tab in the patient portal. Alternatively, you can call the clinic directly. Would you like information about available time slots?`
        } else if (userMessage.includes("medication") || userMessage.includes("medicine")) {
            return `For medication-related questions, it's best to consult with your doctor. They can provide specific guidance based on your medical history. If you're experiencing side effects or have concerns about your current medications, please contact your healthcare provider.`
        } else if (userMessage.includes("result") || userMessage.includes("test")) {
            return `Your lab results are available in the Lab Results section of your patient portal. If you have questions about interpreting your results, I'd recommend discussing them with your healthcare provider at your next appointment.`
        } else if (userMessage.includes("pain") || userMessage.includes("hurt")) {
            return `I'm sorry to hear you're experiencing pain. Without a proper medical examination, I can't provide specific advice. If you're experiencing severe or persistent pain, please contact your healthcare provider right away. For mild pain, rest and over-the-counter pain relievers may help, but always follow your doctor's recommendations.`
        } else if (userMessage.includes("thank")) {
            return `You're welcome! If you have any other questions, feel free to ask. I'm here to help.`
        } else {
            return `Thank you for your question. As a medical assistant, I can provide general health information, but for personalized medical advice specific to your condition, I recommend consulting with your healthcare provider. Is there something else I can help you with?`
        }
    }

    return (
        <Card className="w-full h-[500px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <span>Medical Assistant</span>
                </CardTitle>
                <CardDescription>Ask questions about your health, appointments, or medications</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <div className="space-y-4">
                    {messages
                        .filter((m) => m.role !== "system")
                        .map((message, i) => (
                            <div key={i} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                                <div className="flex gap-2 max-w-[80%]">
                                    {message.role === "assistant" && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`rounded-lg px-3 py-2 text-sm ${message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                    {message.role === "user" && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-slate-200">
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </div>
                        ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-2 max-w-[80%]">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </CardContent>
            <CardFooter>
                <div className="w-full space-y-2">
                    <div className="bg-amber-50 p-2 rounded flex gap-2 text-xs">
                        <InfoIcon className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <span className="text-amber-800">
                            This assistant can provide general information but not medical advice. Always consult healthcare
                            professionals for medical concerns.
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button onClick={handleSendMessage} disabled={isLoading || input.trim() === ""}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
