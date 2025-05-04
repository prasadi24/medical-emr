"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Vitals = {
    id: string
    medical_record_id: string
    recorded_by: string
    recorded_at: string
    temperature: number | null
    heart_rate: number | null
    respiratory_rate: number | null
    blood_pressure_systolic: number | null
    blood_pressure_diastolic: number | null
    oxygen_saturation: number | null
    height: number | null
    weight: number | null
    notes: string | null
    recorder?: {
        email: string
    }
}

// Add the medicalRecordId prop to the interface
interface VitalsListProps {
    vitals: any[]
    medicalRecordId?: string
}

// Update the function signature to include the new prop
export function VitalsList({ vitals, medicalRecordId }: VitalsListProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Temperature</TableHead>
                            <TableHead>Heart Rate</TableHead>
                            <TableHead>Blood Pressure</TableHead>
                            <TableHead>O₂ Sat</TableHead>
                            <TableHead>Recorded By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vitals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No vitals recorded
                                </TableCell>
                            </TableRow>
                        ) : (
                            vitals.map((vital) => (
                                <TableRow key={vital.id}>
                                    <TableCell>{formatDate(vital.recorded_at)}</TableCell>
                                    <TableCell>{vital.temperature ? `${vital.temperature}°F` : "-"}</TableCell>
                                    <TableCell>{vital.heart_rate ? `${vital.heart_rate} bpm` : "-"}</TableCell>
                                    <TableCell>
                                        {vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                                            ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic} mmHg`
                                            : "-"}
                                    </TableCell>
                                    <TableCell>{vital.oxygen_saturation ? `${vital.oxygen_saturation}%` : "-"}</TableCell>
                                    <TableCell>{vital.recorder?.email?.split("@")[0] || "Unknown"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
