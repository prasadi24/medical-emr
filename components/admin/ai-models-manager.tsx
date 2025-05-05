"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, RefreshCw } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { getAIModels, seedAIModels, updateAIModel } from "@/app/actions/ai-model-actions"

type AIModel = {
    id: number
    name: string
    description: string
    model_type: string
    provider: string
    config: {
        model: string
        temperature: number
        max_tokens: number
    }
    is_active: boolean
}

export default function AIModelsManager() {
    const { toast } = useToast()
    const [models, setModels] = useState<AIModel[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<number | null>(null)
    const [seeding, setSeeding] = useState(false)

    useEffect(() => {
        loadModels()
    }, [])

    const loadModels = async () => {
        setLoading(true)
        try {
            const result = await getAIModels()
            if (result.success && result.data) {
                setModels(result.data)
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to load AI models",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error loading AI models:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSeedModels = async () => {
        setSeeding(true)
        try {
            const result = await seedAIModels()
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message || "AI models seeded successfully",
                })
                loadModels()
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to seed AI models",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error seeding AI models:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setSeeding(false)
        }
    }

    const handleUpdateModel = async (id: number, updates: Partial<AIModel>) => {
        setSaving(id)
        try {
            const result = await updateAIModel(id, updates)
            if (result.success) {
                toast({
                    title: "Success",
                    description: "AI model updated successfully",
                })

                // Update local state
                setModels(models.map(model =>
                    model.id === id ? { ...model, ...updates } : model
                ))
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to update AI model",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating AI model:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setSaving(null)
        }
    }

    const handleToggleActive = (id: number, isActive: boolean) => {
        handleUpdateModel(id, { is_active: isActive })
    }

    const handleUpdateConfig = (id: number, config: any) => {
        handleUpdateModel(id, { config })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (models.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No AI models configured yet</p>
                <Button onClick={handleSeedModels} disabled={seeding}>
                    {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Initialize AI Models
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={loadModels} className="gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {models.map((model) => (
                <div key={model.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium text-lg">{model.name}</h3>
                            <p className="text-sm text-muted-foreground">{model.description}</p>
                            <div className="flex gap-2 mt-1">
                                <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded">
                                    {model.model_type}
                                </span>
                                <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded">
                                    {model.provider}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${model.id}`} className="text-sm">Active</Label>
                            <Switch
                                id={`active-${model.id}`}
                                checked={model.is_active}
                                onCheckedChange={(checked) => handleToggleActive(model.id, checked)}
                                disabled={saving === model.id}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor={`model-${model.id}`}>Model</Label>
                            <Input
                                id={`model-${model.id}`}
                                value={model.config.model}
                                onChange={(e) => {
                                    const newConfig = { ...model.config, model: e.target.value }
                                    handleUpdateConfig(model.id, newConfig)
                                }}
                                disabled={saving === model.id}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`temperature-${model.id}`}>
                                Temperature ({model.config.temperature})
                            </Label>
                            <Input
                                id={`temperature-${model.id}`}
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={model.config.temperature}
                                onChange={(e) => {
                                    const newConfig = { ...model.config, temperature: parseFloat(e.target.value) }
                                    handleUpdateConfig(model.id, newConfig)
                                }}
                                disabled={saving === model.id}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`tokens-${model.id}`}>Max Tokens</Label>
                            <Input
                                id={`tokens-${model.id}`}
                                type="number"
                                value={model.config.max_tokens}
                                onChange={(e) => {
                                    const newConfig = { ...model.config, max_tokens: parseInt(e.target.value) }
                                    handleUpdateConfig(model.id, newConfig)
                                }}
                                disabled={saving === model.id}
                            />
                        </div>
                    </div>

                    {saving === model.id && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving changes...</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
