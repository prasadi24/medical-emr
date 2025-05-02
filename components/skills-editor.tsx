"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SkillsEditorProps {
    skills: Record<string, number>
    onChange: (skills: Record<string, number>) => void
}

export function SkillsEditor({ skills, onChange }: SkillsEditorProps) {
    const [newSkill, setNewSkill] = useState("")
    const [newRating, setNewRating] = useState("3")

    const handleAddSkill = () => {
        if (!newSkill.trim()) return

        const updatedSkills = {
            ...skills,
            [newSkill.trim()]: Number.parseInt(newRating),
        }

        onChange(updatedSkills)
        setNewSkill("")
        setNewRating("3")
    }

    const handleRemoveSkill = (skill: string) => {
        const updatedSkills = { ...skills }
        delete updatedSkills[skill]
        onChange(updatedSkills)
    }

    const handleRatingChange = (skill: string, rating: string) => {
        const updatedSkills = {
            ...skills,
            [skill]: Number.parseInt(rating),
        }
        onChange(updatedSkills)
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1"
                />
                <Select value={newRating} onValueChange={setNewRating}>
                    <SelectTrigger className="w-24">
                        <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddSkill} size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {Object.keys(skills).length > 0 ? (
                <div className="space-y-2 rounded-md border p-4">
                    {Object.entries(skills).map(([skill, rating]) => (
                        <div key={skill} className="flex items-center justify-between gap-2">
                            <div className="font-medium">{skill}</div>
                            <div className="flex items-center gap-2">
                                <Select value={rating.toString()} onValueChange={(value) => handleRatingChange(skill, value)}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                        <SelectItem value="5">5</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="h-8 w-8 text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No skills added yet. Add your first skill above.
                </div>
            )}
        </div>
    )
}
