import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { caseloadApi, type CreateResidentRequest, type SafehouseOption } from '@/api/caseloadApi'

interface ResidentFormModalProps {
  initial?: Partial<CreateResidentRequest> | null
  onSubmit: (data: CreateResidentRequest) => Promise<void>
  onClose: () => void
}

const EMPTY: CreateResidentRequest = {
  caseControlNo: '',
  internalCode: '',
  safehouseId: 0,
  caseStatus: 'Active',
  sex: 'Female',
  dateOfBirth: '',
  birthStatus: 'Registered',
  placeOfBirth: '',
  religion: '',
  caseCategory: 'Abuse',
  subCatOrphaned: false,
  subCatTrafficked: false,
  subCatChildLabor: false,
  subCatPhysicalAbuse: false,
  subCatSexualAbuse: false,
  subCatOsaec: false,
  subCatCicl: false,
  subCatAtRisk: false,
  subCatStreetChild: false,
  subCatChildWithHiv: false,
  isPwd: false,
  pwdType: '',
  hasSpecialNeeds: false,
  specialNeedsDiagnosis: '',
  familyIs4ps: false,
  familySoloParent: false,
  familyIndigenous: false,
  familyParentPwd: false,
  familyInformalSettler: false,
  dateOfAdmission: '',
  ageUponAdmission: '',
  presentAge: '',
  lengthOfStay: '',
  referralSource: '',
  referringAgencyPerson: '',
  assignedSocialWorker: '',
  initialCaseAssessment: '',
  reintegrationType: '',
  reintegrationStatus: '',
  initialRiskLevel: 'Low',
  currentRiskLevel: 'Low',
  dateEnrolled: '',
  notesRestricted: '',
}

const SUB_CATEGORIES = [
  { key: 'subCatOrphaned', label: 'Orphaned' },
  { key: 'subCatTrafficked', label: 'Trafficked' },
  { key: 'subCatChildLabor', label: 'Child Labor' },
  { key: 'subCatPhysicalAbuse', label: 'Physical Abuse' },
  { key: 'subCatSexualAbuse', label: 'Sexual Abuse' },
  { key: 'subCatOsaec', label: 'OSAEC' },
  { key: 'subCatCicl', label: 'CICL' },
  { key: 'subCatAtRisk', label: 'At Risk' },
  { key: 'subCatStreetChild', label: 'Street Child' },
  { key: 'subCatChildWithHiv', label: 'Child with HIV' },
] as const

const FAMILY_FLAGS = [
  { key: 'familyIs4ps', label: '4Ps Beneficiary' },
  { key: 'familySoloParent', label: 'Solo Parent' },
  { key: 'familyIndigenous', label: 'Indigenous Group' },
  { key: 'familyParentPwd', label: 'Parent is PWD' },
  { key: 'familyInformalSettler', label: 'Informal Settler' },
] as const

export function ResidentFormModal({ initial, onSubmit, onClose }: ResidentFormModalProps) {
  const [form, setForm] = useState<CreateResidentRequest>({ ...EMPTY, ...initial })
  const [safehouses, setSafehouses] = useState<SafehouseOption[]>([])
  const [submitting, setSubmitting] = useState(false)

  const fetchSafehouses = useCallback(async () => {
    try {
      const res = await caseloadApi.getSafehouses()
      setSafehouses(res.items)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { void fetchSafehouses() }, [fetchSafehouses])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value
    setForm((prev) => ({ ...prev, [target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const submissionData = { ...form, safehouseId: Number(form.safehouseId) };
      // Backend expects string? fields to be null or empty, but dateOfBirth must be a valid date.
      if (!submissionData.dateOfBirth) submissionData.dateOfBirth = new Date().toISOString().split('T')[0];
      if (!submissionData.dateOfAdmission) submissionData.dateOfAdmission = new Date().toISOString().split('T')[0];
      if (!submissionData.dateEnrolled) submissionData.dateEnrolled = new Date().toISOString().split('T')[0];
      await onSubmit(submissionData)
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 py-8" onClick={onClose}>
      <div className="bg-card mx-4 w-full max-w-4xl rounded-2xl p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-heading text-xl font-semibold text-plum">
          {initial ? 'Edit Resident' : 'New Resident'}
        </h2>
        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
          {/* Basic Info */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Basic Information</legend>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <label className="block"><span className="text-sm font-medium">Case Control No</span><input name="caseControlNo" required value={form.caseControlNo} onChange={handleChange} className={inputCls} /></label>
              <label className="block"><span className="text-sm font-medium">Internal Code</span><input name="internalCode" required value={form.internalCode} onChange={handleChange} className={inputCls} /></label>
              <label className="block">
                <span className="text-sm font-medium">Safehouse</span>
                <select name="safehouseId" required value={form.safehouseId} onChange={handleChange} className={inputCls}>
                  <option value={0}>Select...</option>
                  {safehouses.map((s) => <option key={s.safehouseId} value={s.safehouseId}>{s.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Sex</span>
                <select name="sex" required value={form.sex} onChange={handleChange} className={inputCls}>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block"><span className="text-sm font-medium">Date of Birth</span><input name="dateOfBirth" type="date" required value={form.dateOfBirth?.split('T')[0]} onChange={handleChange} className={inputCls} /></label>
              <label className="block">
                <span className="text-sm font-medium">Birth Status</span>
                <select name="birthStatus" required value={form.birthStatus} onChange={handleChange} className={inputCls}>
                  <option value="Registered">Registered</option>
                  <option value="Late Registration">Late Registration</option>
                  <option value="Unregistered">Unregistered</option>
                </select>
              </label>
              <label className="block"><span className="text-sm font-medium">Place of Birth</span><input name="placeOfBirth" required value={form.placeOfBirth} onChange={handleChange} className={inputCls} /></label>
              <label className="block"><span className="text-sm font-medium">Religion</span><input name="religion" required value={form.religion} onChange={handleChange} className={inputCls} /></label>
              <label className="block">
                <span className="text-sm font-medium">Case Status</span>
                <select name="caseStatus" value={form.caseStatus} onChange={handleChange} className={inputCls}>
                  <option value="Active">Active</option><option value="Discharged">Discharged</option><option value="Transferred">Transferred</option><option value="Pending">Pending</option>
                </select>
              </label>
            </div>
          </fieldset>

          {/* Case Classification */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Case Classification</legend>
            <label className="mb-3 block">
              <span className="text-sm font-medium">Case Category</span>
              <select name="caseCategory" required value={form.caseCategory} onChange={handleChange} className={inputCls}>
                <option value="Abuse">Abuse</option>
                <option value="Exploitation">Exploitation</option>
                <option value="Neglect">Neglect</option>
                <option value="At Risk">At Risk</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {SUB_CATEGORIES.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input name={key} type="checkbox" checked={form[key] as boolean} onChange={handleChange} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Disability / Special Needs */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Disability & Special Needs</legend>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2"><input name="isPwd" type="checkbox" checked={form.isPwd} onChange={handleChange} /><span className="text-sm">Person with Disability (PWD)</span></label>
              {form.isPwd && <label className="block"><span className="text-sm font-medium">PWD Type</span><input name="pwdType" value={form.pwdType ?? ''} onChange={handleChange} className={inputCls} /></label>}
              <label className="flex items-center gap-2"><input name="hasSpecialNeeds" type="checkbox" checked={form.hasSpecialNeeds} onChange={handleChange} /><span className="text-sm">Has Special Needs</span></label>
              {form.hasSpecialNeeds && <label className="block"><span className="text-sm font-medium">Diagnosis</span><input name="specialNeedsDiagnosis" value={form.specialNeedsDiagnosis ?? ''} onChange={handleChange} className={inputCls} /></label>}
            </div>
          </fieldset>

          {/* Family Socio-demographic Profile */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Family Socio-Demographic Profile</legend>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {FAMILY_FLAGS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input name={key} type="checkbox" checked={form[key] as boolean} onChange={handleChange} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Admission & Referral */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Admission & Referral</legend>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <label className="block"><span className="text-sm font-medium">Date of Admission</span><input name="dateOfAdmission" type="date" required value={form.dateOfAdmission?.split('T')[0]} onChange={handleChange} className={inputCls} /></label>
              <label className="block"><span className="text-sm font-medium">Age Upon Admission</span><input name="ageUponAdmission" value={form.ageUponAdmission ?? ''} onChange={handleChange} className={inputCls} /></label>
              <label className="block"><span className="text-sm font-medium">Referral Source</span><input name="referralSource" required value={form.referralSource} onChange={handleChange} className={inputCls} /></label>
              <label className="block"><span className="text-sm font-medium">Referring Agency/Person</span><input name="referringAgencyPerson" value={form.referringAgencyPerson ?? ''} onChange={handleChange} className={inputCls} /></label>
              <label className="block"><span className="text-sm font-medium">Assigned Social Worker</span><input name="assignedSocialWorker" required value={form.assignedSocialWorker} onChange={handleChange} className={inputCls} /></label>
              <label className="block"><span className="text-sm font-medium">Date Enrolled</span><input name="dateEnrolled" type="date" required value={form.dateEnrolled?.split('T')[0]} onChange={handleChange} className={inputCls} /></label>
            </div>
          </fieldset>

          {/* Risk Assessment */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Risk Assessment & Reintegration</legend>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium">Initial Risk Level</span>
                <select name="initialRiskLevel" value={form.initialRiskLevel} onChange={handleChange} className={inputCls}>
                  <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Current Risk Level</span>
                <select name="currentRiskLevel" value={form.currentRiskLevel} onChange={handleChange} className={inputCls}>
                  <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Reintegration Type</span>
                <select name="reintegrationType" value={form.reintegrationType ?? ''} onChange={handleChange} className={inputCls}>
                  <option value="">Select...</option>
                  <option value="Family Reintegration">Family Reintegration</option>
                  <option value="Independent Living">Independent Living</option>
                  <option value="Foster Care">Foster Care</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Reintegration Status</span>
                <select name="reintegrationStatus" value={form.reintegrationStatus ?? ''} onChange={handleChange} className={inputCls}>
                  <option value="">Select...</option>
                  <option value="Planned">Planned</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </label>
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium">Restricted Notes</span>
            <textarea name="notesRestricted" rows={2} value={form.notesRestricted ?? ''} onChange={handleChange} className={inputCls} />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : initial ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

