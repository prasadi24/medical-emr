"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VitalsList } from "@/components/vitals/vitals-list"
import { PrescriptionsList } from "@/components/prescriptions/prescriptions-list"
import { DocumentsList } from "@/components/documents/documents-list"
import { LabResultsList } from "@/components/lab-results/lab-results-list"

interface MedicalRecordTabsProps {
    medicalRecordId: string
    patientId: string
    vitals: any[]
    prescriptions: any[]
    documents: any[]
    labResults: any[]
}

export function MedicalRecordTabs({
    medicalRecordId,
    patientId,
    vitals,
    prescriptions,
    documents,
    labResults,
}: MedicalRecordTabsProps) {
    const [activeTab, setActiveTab] = useState("vitals")

    return (
        <Tabs defaultValue="vitals" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="vitals">Vitals</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
            </TabsList>
            <TabsContent value="vitals" className="mt-6">
                <VitalsList vitals={vitals} medicalRecordId={medicalRecordId} />
            </TabsContent>
            <TabsContent value="prescriptions" className="mt-6">
                <PrescriptionsList prescriptions={prescriptions} medicalRecordId={medicalRecordId} />
            </TabsContent>
            <TabsContent value="documents" className="mt-6">
                <DocumentsList documents={documents} medicalRecordId={medicalRecordId} />
            </TabsContent>
            <TabsContent value="lab-results" className="mt-6">
                <LabResultsList labResults={labResults} medicalRecordId={medicalRecordId} />
            </TabsContent>
        </Tabs>
    )
}
