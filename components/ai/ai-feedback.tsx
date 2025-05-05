"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { aiLogger } from "@/app/actions/ai-logging-actions"

type AIFeedbackProps = {
    logId: string
    userId: string
    feature: string
}

export default function AIFeedback({ logId, userId, feature }: AIFeedbackProps) {
    const { toast } = useToast()
    const [isHelpful, setIsHelpful] = useState<boolean | null>(null)
    const [isAccurate, setIsAccurate] = useState<boolean | null>(null)
    const [rating, setRating] = useState<number | null>(null)
    const [feedback, setFeedback] = useState("")
    const [showFeedbackForm, setShowFeedbackForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleInitialFeedback = (helpful: boolean) => {
        setIsHelpful(helpful)
        setShowFeedbackForm(true)
    }

    const handleSubmitFeedback = async () => {
        if (isHelpful === null) return

        setSubmitting(true)
        try {
            const result = await aiLogger.logFeedback({
                userId,
                logId,
                rating: rating || (isHelpful ? 4 : 2),
                feedback,
                isHelpful: isHelpful,
                isAccurate: isAccurate === null ? isHelpful : isAccurate,
            })

            if (result.success) {
                toast({
                    title: "Feedback Submitted",
                    description: "Thank you for your feedback!",
                })
                setSubmitted(true)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to submit feedback. Please try again.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error submitting feedback:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <Card className="w-full bg-slate-50">
                <CardContent className="pt-4 text-center text-sm text-muted-foreground">
                    Thank you for your feedback! It helps us improve our AI features.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full bg-slate-50">
            <CardContent className="pt-4">
                {!showFeedbackForm ? (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Was this AI response helpful?</div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => handleInitialFeedback(true)}>
                                <ThumbsUp className="h-4 w-4" />
                                <span>Yes</span>
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => handleInitialFeedback(false)}>
                                <ThumbsDown className="h-4 w-4" />
                                <span>No</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">
                                {isHelpful ? "What did you like about this response?" : "How could this response be improved?"}
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`w-6 h-6 flex items-center justify-center rounded-full ${rating && star <= rating ? "bg-primary text-primary-foreground" : "bg-slate-200"
                                            }`}
                                    >
                                        {star}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!isHelpful && (
                            <div className="space-y-2">
                                <div className="text-sm">Was the information accurate?</div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={isAccurate === true ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setIsAccurate(true)}
                                    >
                                        Yes
                                    </Button>
                                    <Button
                                        variant={isAccurate === false ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setIsAccurate(false)}
                                    >
                                        No
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center gap-1 text-sm">
                                <MessageSquare className="h-4 w-4" />
                                <span>Additional feedback (optional)</span>
                            </div>
                            <Textarea
                                placeholder="Share your thoughts on this AI response..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowFeedbackForm(false)
                                    setIsHelpful(null)
                                    setIsAccurate(null)
                                    setRating(null)
                                    setFeedback("")
                                }}
                            >
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSubmitFeedback} disabled={submitting} className="gap-1">
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Submit Feedback
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
