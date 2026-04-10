import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BookOpen, Heart } from 'lucide-react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { caseloadApi, type CreateResidentRequest } from '@/api/caseloadApi'
import { ResidentFormModal } from '@/components/admin/ResidentFormModal'
import {
  SubCategorySection,
  DisabilitySection,
  FamilyProfileSection,
  ReferralSection,
  ReintegrationSection,
  DemographicsSection,
} from '@/components/admin/ResidentProfileSections'

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
  reintegrationType: string | null
  lengthOfStay: string | null
  referralSource: string | null
  referringAgencyPerson: string | null
  dateEnrolled: string | null
  dateColbRegistered: string | null
  dateColbObtained: string | null
  initialCaseAssessment: string | null
  dateCaseStudyPrepared: string | null
  birthStatus: string | null
  placeOfBirth: string | null
  religion: string | null
  ageUponAdmission: string | null
  presentAge: string | null
  subCatOrphaned: boolean
  subCatTrafficked: boolean
  subCatChildLabor: boolean
  subCatPhysicalAbuse: boolean
  subCatSexualAbuse: boolean
  subCatOsaec: boolean
  subCatCicl: boolean
  subCatAtRisk: boolean
  subCatStreetChild: boolean
  subCatChildWithHiv: boolean
  isPwd: boolean
  pwdType: string | null
  hasSpecialNeeds: boolean
  specialNeedsDiagnosis: string | null
  familyIs4ps: boolean
  familySoloParent: boolean
  familyIndigenous: boolean
  familyParentPwd: boolean
  familyInformalSettler: boolean
  notesRestricted: string | null
  processRecordings: unknown[]
  homeVisitations: unknown[]
  educationRecords: unknown[]
  healthWellbeingRecords: unknown[]
  interventionPlans: unknown[]
  incidentReports: unknown[]
}

type TabName = 'profile' | 'recordings' | 'visitations' | 'interventions' | 'incidents' | 'conferences'
const TABS: { key: TabName; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'recordings', label: 'Sessions' },
  { key: 'visitations', label: 'Visitations' },
  { key: 'interventions', label: 'Interventions' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'conferences', label: 'Conferences' },
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
    columns: ['planCategory', 'planDescription', 'servicesProvided', 'targetDate', 'status'],
    idField: 'planId',
  },
  incidents: {
    columns: ['incidentDate', 'incidentType', 'severity', 'resolved', 'reportedBy'],
    idField: 'incidentId',
  },
  conferences: {
    columns: ['caseConferenceDate', 'planCategory', 'planDescription', 'status'],
    idField: 'planId',
  },
}

/* ---- Component ---- */

export function ResidentProfilePage() {
  const { id } = useParams<{ id: string }>()
  if (!id) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground">Invalid resident.</p>
      </div>
    )
  }
  return <ResidentProfileContent id={id} />
}

function ResidentProfileContent({ id }: { id: string }) {
  const [resident, setResident] = useState<ResidentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabName>('profile')
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get<ResidentProfile>(`/api/caseload/${id}`)
      .then((r) => {
        if (!cancelled) setResident(r)
      })
      .catch((err) => console.error('Failed to load resident profile', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function reloadResident() {
    setLoading(true)
    api
      .get<ResidentProfile>(`/api/caseload/${id}`)
      .then(setResident)
      .catch((err) => console.error('Failed to load resident profile', err))
      .finally(() => setLoading(false))
  }

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
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {resident.caseControlNo} | {resident.safehouse?.name ?? 'Unknown Safehouse'} | {resident.caseStatus}
        </p>
        <Button size="sm" onClick={() => setShowEdit(true)}>Edit Resident</Button>
      </div>

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
      {activeTab === 'recordings' && (
        <ProcessRecordingTimeline residentId={resident.residentId} />
      )}
      {activeTab === 'conferences' && (
        <CaseConferencesTab residentId={resident.residentId} />
      )}
      {activeTab !== 'profile' && activeTab !== 'recordings' && activeTab !== 'conferences' && TAB_CONFIG[activeTab] && (
        <RelatedRecordsTab
          residentId={resident.residentId}
          endpoint={activeTab}
          columns={TAB_CONFIG[activeTab].columns}
          idField={TAB_CONFIG[activeTab].idField}
        />
      )}

      {showEdit && (
        <ResidentFormModal
          initial={{
            caseControlNo: resident.caseControlNo,
            internalCode: resident.internalCode,
            safehouseId: resident.safehouseId,
            caseStatus: resident.caseStatus,
            sex: resident.sex ?? '',
            dateOfBirth: resident.dateOfBirth ?? '',
            birthStatus: resident.birthStatus ?? '',
            placeOfBirth: resident.placeOfBirth ?? '',
            religion: resident.religion ?? '',
            caseCategory: resident.caseCategory ?? '',
            subCatOrphaned: resident.subCatOrphaned,
            subCatTrafficked: resident.subCatTrafficked,
            subCatChildLabor: resident.subCatChildLabor,
            subCatPhysicalAbuse: resident.subCatPhysicalAbuse,
            subCatSexualAbuse: resident.subCatSexualAbuse,
            subCatOsaec: resident.subCatOsaec,
            subCatCicl: resident.subCatCicl,
            subCatAtRisk: resident.subCatAtRisk,
            subCatStreetChild: resident.subCatStreetChild,
            subCatChildWithHiv: resident.subCatChildWithHiv,
            isPwd: resident.isPwd,
            pwdType: resident.pwdType,
            hasSpecialNeeds: resident.hasSpecialNeeds,
            specialNeedsDiagnosis: resident.specialNeedsDiagnosis,
            familyIs4ps: resident.familyIs4ps,
            familySoloParent: resident.familySoloParent,
            familyIndigenous: resident.familyIndigenous,
            familyParentPwd: resident.familyParentPwd,
            familyInformalSettler: resident.familyInformalSettler,
            dateOfAdmission: resident.dateOfAdmission ?? '',
            ageUponAdmission: resident.ageUponAdmission,
            presentAge: resident.presentAge,
            lengthOfStay: resident.lengthOfStay,
            referralSource: resident.referralSource ?? '',
            referringAgencyPerson: resident.referringAgencyPerson,
            assignedSocialWorker: resident.assignedSocialWorker ?? '',
            initialCaseAssessment: resident.initialCaseAssessment,
            reintegrationType: resident.reintegrationType,
            reintegrationStatus: resident.reintegrationStatus,
            initialRiskLevel: resident.initialRiskLevel,
            currentRiskLevel: resident.currentRiskLevel,
            dateEnrolled: resident.dateEnrolled ?? '',
            notesRestricted: resident.notesRestricted,
          } as CreateResidentRequest}
          onSubmit={async (data: CreateResidentRequest) => {
            await caseloadApi.updateResident(resident.residentId, data)
            setShowEdit(false)
            reloadResident()
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}

/* ---- Profile sub-tab ---- */

function ProfileTab({ resident }: { resident: ResidentProfile }) {
  const coreFields: { label: string; value: string | null }[] = [
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
    { label: 'Length of Stay', value: resident.lengthOfStay },
    { label: 'Assigned Worker', value: resident.assignedSocialWorker },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {coreFields.map((f) => (
          <div key={f.label}>
            <p className="text-xs font-medium uppercase text-soft-purple/70">{f.label}</p>
            <p className="text-sm text-plum">{f.value ?? '-'}</p>
          </div>
        ))}
      </div>

      <SubCategorySection data={resident} />
      <DisabilitySection data={resident} />
      <FamilyProfileSection data={resident} />
      <DemographicsSection data={resident} />
      <ReferralSection data={resident} />
      <ReintegrationSection data={resident} />
    </div>
  )
}

/* ---- Healing Journey Timeline (Process Recordings) ---- */

function ProcessRecordingTimeline({ residentId }: { residentId: number }) {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>(`/api/caseload/${residentId}/recordings`)
      .then(setRecords)
      .finally(() => setLoading(false))
  }, [residentId])

  if (loading) return <p className="animate-pulse text-sm text-muted-foreground">Loading journey...</p>
  if (records.length === 0) return <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:bg-gradient-to-b before:from-primary/20 before:via-primary/20 before:to-transparent md:before:mx-auto md:before:translate-x-0">
      {records.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()).map((rec) => (
        <div key={rec.recordingId} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Dot */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
            <Heart className="size-4 fill-current" />
          </div>
          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <time className="font-heading font-bold text-accent">{new Date(rec.sessionDate).toLocaleDateString()}</time>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                rec.concernsFlagged ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
              }`}>
                {rec.emotionalStateObserved}
              </span>
            </div>
            <div className="text-muted-foreground text-xs mb-2">
              {rec.sessionType} Session • {rec.sessionDurationMinutes} mins • {rec.socialWorker}
            </div>
            <p className="text-sm text-foreground leading-relaxed italic mb-3">"{rec.sessionNarrative}"</p>
            <div className="space-y-2">
              <div className="text-[11px]">
                <span className="font-bold uppercase text-soft-purple/70">Interventions:</span>
                <p className="text-plum">{rec.interventionsApplied}</p>
              </div>
              <div className="text-[11px]">
                <span className="font-bold uppercase text-soft-purple/70">Follow-up:</span>
                <p className="text-plum">{rec.followUpActions}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---- Case Conferences Tab ---- */

function CaseConferencesTab({ residentId }: { residentId: number }) {
  const [conferences, setConferences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<any[]>(`/api/caseload/${residentId}/case-conferences`)
      .then(setConferences)
      .finally(() => setLoading(false))
  }, [residentId])

  if (loading) return <p className="animate-pulse text-sm text-muted-foreground">Loading conferences...</p>

  const today = new Date().setHours(0,0,0,0)
  const upcoming = conferences.filter(c => new Date(c.caseConferenceDate).getTime() >= today)
  const past = conferences.filter(c => new Date(c.caseConferenceDate).getTime() < today)

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Upcoming Conferences</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-dashed border-border">No upcoming conferences scheduled.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map(c => (
              <ConferenceCard key={c.planId} conference={c} isUpcoming />
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Conference History</h3>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">No past conferences found.</p>
        ) : (
          <div className="space-y-3">
            {past.map(c => (
              <ConferenceCard key={c.planId} conference={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ConferenceCard({ conference, isUpcoming }: { conference: any, isUpcoming?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${isUpcoming ? 'bg-primary/5 border-primary/20 shadow-bloom' : 'bg-card border-border shadow-sm'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className={`size-4 ${isUpcoming ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="font-heading font-bold text-accent">{new Date(conference.caseConferenceDate).toLocaleDateString()}</span>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-muted rounded-full">{conference.status}</span>
      </div>
      <p className="text-xs font-bold uppercase text-soft-purple/70 mb-1">{conference.planCategory}</p>
      <p className="text-sm text-plum">{conference.planDescription}</p>
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
