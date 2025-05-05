"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Search, BrainCircuit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { searchMedicalRecordsWithAI } from "@/app/actions/ai-medical-record-actions"

type SearchResult = {
    id: string
    patientName: string
    visitDate: string
    diagnosis: string
    relevanceScore: number
    matchedFields: string[]
}

type AIPoweredSearchProps = {
    onResultSelect: (recordId: string) => void
}

export default function AIPoweredSearch({ onResultSelect }: AIPoweredSearchProps) {
    const { toast } = useToast()
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<SearchResult[]>([])

    const handleSearch = async () => {
        if (!query.trim()) {
            toast({
                title: "Empty search",
                description: "Please enter a search query",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            const response = await searchMedicalRecordsWithAI(query)

            if (response.success) {
                // Fix: Add a default empty array if results is undefined
                setResults(response.results || [])

                if ((response.results || []).length === 0) {
                    toast({
                        title: "No results found",
                        description: "Try a different search query",
                        variant: "default",
                    })
                }
            } else {
                toast({
                    title: "Search error",
                    description: response.message || "Failed to perform search",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error performing AI search:", error)
            toast({
                title: "Search error",
                description: "Failed to perform search. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" />
                    <span>AI-Powered Medical Record Search</span>
                </CardTitle>
                <CardDescription>
                    Search medical records using natural language. Try queries like "patients with diabetes and hypertension" or
                    "records mentioning adverse reaction to antibiotics"
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter your search query..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                            className="flex-1"
                            disabled={loading}
                        />
                        <Button onClick={handleSearch} disabled={loading || !query.trim()} className="gap-1">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            <span>Search</span>
                        </Button>
                    </div>

                    {results.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-medium mb-3">Search Results</h3>
                            <div className="space-y-3">
                                {results.map((result) => (
                                    <div
                                        key={result.id}
                                        className="p-3 rounded-md border hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => onResultSelect(result.id)}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium">{result.patientName}</h4>
                                            <span className="text-xs text-muted-foreground">{result.visitDate}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-1">{result.diagnosis}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1">
                                                {result.matchedFields.map((field) => (
                                                    <span key={field} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                                                        {field}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                Relevance: {(result.relevanceScore * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {query && !loading && results.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
