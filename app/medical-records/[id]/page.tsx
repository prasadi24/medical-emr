import Link from "next/link"
import { getMedicalRecordById } from "@/app/actions/medical-record-actions"
import { getVitalsByMedicalRecordId } from "@/app/actions/vitals-actions"
import { RequireRole } from "@/components/auth/require-role"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VitalsList } from "@/components/vitals/vitals-list"
import { VitalsForm } from "@/components/vitals/vitals-form"
import { PencilIcon } from "lucide-react"
import { notFound } from "next/navigation"

export default async function MedicalRecordDetailsPage({ params }: { params: { id: string } }) {
  const record = await getMedicalRecordById(params.id)
  const vitals = await getVitalsByMedicalRecordId(params.id)

  if (!record) {
    notFound()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <RequireRole roles={["Admin", "Doctor", "Nurse"]} fallback={<div>Access denied</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medical Record</h1>
            <p className="text-muted-foreground">
              {record.patients?.first_name} {record.patients?.last_name} • Visit Date: {formatDate(record.visit_date)}
            </p>
          </div>
          <div className="flex gap-2">
            <RequireRole roles={["Admin", "Doctor"]}>
              <Button variant="outline" asChild>
                <Link href={`/medical-records/${record.id}/edit`}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit Record
                </Link>
              </Button>
            </RequireRole>
            <Button asChild>
              <Link href={`/patients/${record.patient_id}`}>View Patient</Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Record Details</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Record Details</CardTitle>
                <CardDescription>
                  Recorded by Dr. {record.doctor?.email?.split("@")[0] || "Unknown"} on {formatDate(record.visit_date)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Chief Complaint</h3>
                  <p className="mt-1">{record.chief_complaint}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Diagnosis</h3>
                  <p className="mt-1">{record.diagnosis || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Treatment Plan</h3>
                  <p className="mt-1">{record.treatment_plan || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Additional Notes</h3>
                  <p className="mt-1">{record.notes || "Not specified"}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Follow-up Date</h3>
                  <p className="mt-1">{formatDate(record.follow_up_date)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="vitals" className="space-y-6 pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vitals</CardTitle>
                  <CardDescription>Patient's vital signs</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <VitalsList vitals={vitals} />

                <RequireRole roles={["Admin", "Doctor", "Nurse"]}>
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Record New Vitals</h3>
                    <VitalsForm medicalRecordId={record.id} />
                  </div>
                </RequireRole>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RequireRole>
  )
}
