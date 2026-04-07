import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'

/* ---- Types matching CaseloadController.GetResident response ---- */

interface Safehouse {
  safehouseId: number
  name: string
}

interface ResidentProfile {
  residentId: number
  caseControlNo: string
  internalCode: string
  safehouseId: number
  safehouse: Safehouse
  caseStatus: string
  sex: string | null
  dateOfBirth: string | null
  caseCategory: string | null
  currentRiskLevel: string
  initialRiskLevel: string
  assignedSocialWorker: string | null
  dateOfAdmission: string | null
  dateClosed: string | null
  reintegrationStatus: string | null
  lengthOfStay: string | null
  referralSource: string | null
  processRecordings: unknown[]
  homeVisitations: unknown[]
  educationRecords: unknown[]
  healthWellbeingRecords: unknown[]
  interventionPlans: unknown[]
  incidentReports: unknown[]
}

type TabName = 'profile' | 'recordings' | 'visitations' | 'interventions' | 'incidents'
const TABS: { key: TabName; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'recordings', label: 'Sessions' },
  { key: 'visitations', label: 'Visitations' },
  { key: 'interventions', label: 'Interventions' },
  { key: 'incidents', label: 'Incidents' },
]

const TAB_CONFIG: Record<string, { columns: string[]; idField: string }> = {
  recordings: {
    columns: ['sessionDate', 'sessionType', 'sessionDurationMinutes', 'emotionalStateObserved', 'concernsFlagged'],
    idField: 'recordingId',
  },
  visitations: {
    columns: ['visitDate', 'visitType', 'locationVisited', 'visitOutcome', 'safetyConcernsNoted'],
    idField: 'visitationId',
  },
  interventions: {
    columns: ['interventionCategory', 'description', 'servicesProvided', 'targetDate', 'status'],
    idField: 'planId',
  },
  incidents: {
    columns: ['incidentDate', 'incidentType', 'severity', 'resolved', 'reportedBy'],
    idField: 'incidentId',
  },
}

/* ---- Component ---- */

export function ResidentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [resident, setResident] = useState<ResidentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabName>('profile')

  useEffect(() => {
    if (!id) return
    api
      .get<ResidentProfile>(`/api/caseload/${id}`)
      .then(setResident)
      .catch((err) => console.error('Failed to load resident profile', err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!resident) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground">Resident not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">
        {resident.internalCode}
      </h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {resident.caseControlNo} | {resident.safehouse?.name ?? 'Unknown Safehouse'} | {resident.caseStatus}
      </p>

      {/* Tabs */}
      <div className="border-border mb-6 flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.key
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && <ProfileTab resident={resident} />}
      {activeTab !== 'profile' && TAB_CONFIG[activeTab] && (
        <RelatedRecordsTab
          residentId={resident.residentId}
          endpoint={activeTab}
          columns={TAB_CONFIG[activeTab].columns}
          idField={TAB_CONFIG[activeTab].idField}
        />
      )}
    </div>
  )
}

/* ---- Profile sub-tab ---- */

function ProfileTab({ resident }: { resident: ResidentProfile }) {
  const fields: { label: string; value: string | null }[] = [
    { label: 'Case Control No', value: resident.caseControlNo },
    { label: 'Internal Code', value: resident.internalCode },
    { label: 'Sex', value: resident.sex },
    { label: 'Date of Birth', value: resident.dateOfBirth },
    { label: 'Safehouse', value: resident.safehouse?.name ?? null },
    { label: 'Case Category', value: resident.caseCategory },
    { label: 'Status', value: resident.caseStatus },
    { label: 'Initial Risk Level', value: resident.initialRiskLevel },
    { label: 'Current Risk Level', value: resident.currentRiskLevel },
    { label: 'Admission Date', value: resident.dateOfAdmission },
    { label: 'Date Closed', value: resident.dateClosed },
    { label: 'Reintegration Status', value: resident.reintegrationStatus },
    { label: 'Length of Stay', value: resident.lengthOfStay },
    { label: 'Assigned Worker', value: resident.assignedSocialWorker },
    { label: 'Referral Source', value: resident.referralSource },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.label}>
          <p className="text-muted-foreground text-xs font-medium uppercase">{f.label}</p>
          <p className="text-sm">{f.value ?? '-'}</p>
        </div>
      ))}
    </div>
  )
}

/* ---- Generic related-records sub-tab ---- */

function RelatedRecordsTab({
  residentId,
  endpoint,
  columns,
  idField,
}: {
  residentId: number
  endpoint: string
  columns: string[]
  idField: string
}) {
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<Record<string, unknown>[]>(`/api/caseload/${residentId}/${endpoint}`)
      setRecords(res)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [residentId, endpoint])

  useEffect(() => {
    void fetchRecords()
  }, [fetchRecords])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`/api/caseload/${residentId}/${endpoint}`, {
        residentId,
        ...formData,
      })
      setFormData({})
      setShowForm(false)
      void fetchRecords()
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : `Add ${endpoint}`}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border-border mb-4 rounded-lg border p-4">
          <div className="grid grid-cols-2 gap-3">
            {columns.map((col) => (
              <label key={col} className="block">
                <span className="text-xs font-medium">{col}</span>
                <input
                  type="text"
                  value={formData[col] ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [col]: e.target.value }))}
                  className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                />
              </label>
            ))}
          </div>
          <div className="mt-3">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground animate-pulse text-sm">Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-muted-foreground text-sm">No records found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b text-left">
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => (
                <tr key={String(rec[idField] ?? i)} className="border-border border-b">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2">
                      {rec[col] == null ? '-' : typeof rec[col] === 'boolean' ? (rec[col] ? 'Yes' : 'No') : String(rec[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
