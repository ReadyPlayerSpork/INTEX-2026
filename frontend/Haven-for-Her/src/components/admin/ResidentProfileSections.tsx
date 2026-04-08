interface ResidentData {
  // Sub-categories
  subCatOrphaned?: boolean
  subCatTrafficked?: boolean
  subCatChildLabor?: boolean
  subCatPhysicalAbuse?: boolean
  subCatSexualAbuse?: boolean
  subCatOsaec?: boolean
  subCatCicl?: boolean
  subCatAtRisk?: boolean
  subCatStreetChild?: boolean
  subCatChildWithHiv?: boolean
  // Disability
  isPwd?: boolean
  pwdType?: string | null
  hasSpecialNeeds?: boolean
  specialNeedsDiagnosis?: string | null
  // Family
  familyIs4ps?: boolean
  familySoloParent?: boolean
  familyIndigenous?: boolean
  familyParentPwd?: boolean
  familyInformalSettler?: boolean
  // Referral
  referralSource?: string | null
  referringAgencyPerson?: string | null
  dateColbRegistered?: string | null
  dateColbObtained?: string | null
  initialCaseAssessment?: string | null
  dateCaseStudyPrepared?: string | null
  // Reintegration
  reintegrationType?: string | null
  reintegrationStatus?: string | null
  dateEnrolled?: string | null
  dateClosed?: string | null
  // Demographics
  birthStatus?: string | null
  placeOfBirth?: string | null
  religion?: string | null
  ageUponAdmission?: string | null
  presentAge?: string | null
}

function Flag({ label, value }: { label: string; value?: boolean }) {
  if (!value) return null
  return (
    <span className="inline-block rounded-full bg-plum/10 px-2.5 py-0.5 text-xs font-medium text-plum">
      {label}
    </span>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-soft-purple/70">{label}</p>
      <p className="text-sm text-plum">{value || '-'}</p>
    </div>
  )
}

export function SubCategorySection({ data }: { data: ResidentData }) {
  const cats = [
    { label: 'Orphaned', value: data.subCatOrphaned },
    { label: 'Trafficked', value: data.subCatTrafficked },
    { label: 'Child Labor', value: data.subCatChildLabor },
    { label: 'Physical Abuse', value: data.subCatPhysicalAbuse },
    { label: 'Sexual Abuse', value: data.subCatSexualAbuse },
    { label: 'OSAEC', value: data.subCatOsaec },
    { label: 'CICL', value: data.subCatCicl },
    { label: 'At Risk', value: data.subCatAtRisk },
    { label: 'Street Child', value: data.subCatStreetChild },
    { label: 'Child with HIV', value: data.subCatChildWithHiv },
  ]
  const active = cats.filter((c) => c.value)

  return (
    <div className="rounded-2xl bg-cream p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Case Sub-Categories</h3>
      {active.length === 0 ? (
        <p className="text-sm text-soft-purple/60">None flagged</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {active.map((c) => <Flag key={c.label} label={c.label} value={c.value} />)}
        </div>
      )}
    </div>
  )
}

export function DisabilitySection({ data }: { data: ResidentData }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Disability & Special Needs</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="PWD" value={data.isPwd ? `Yes${data.pwdType ? ` (${data.pwdType})` : ''}` : 'No'} />
        <Field label="Special Needs" value={data.hasSpecialNeeds ? `Yes${data.specialNeedsDiagnosis ? ` - ${data.specialNeedsDiagnosis}` : ''}` : 'No'} />
      </div>
    </div>
  )
}

export function FamilyProfileSection({ data }: { data: ResidentData }) {
  const flags = [
    { label: '4Ps Beneficiary', value: data.familyIs4ps },
    { label: 'Solo Parent', value: data.familySoloParent },
    { label: 'Indigenous Group', value: data.familyIndigenous },
    { label: 'Parent is PWD', value: data.familyParentPwd },
    { label: 'Informal Settler', value: data.familyInformalSettler },
  ]
  const active = flags.filter((f) => f.value)

  return (
    <div className="rounded-2xl bg-cream p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Family Socio-Demographic Profile</h3>
      {active.length === 0 ? (
        <p className="text-sm text-soft-purple/60">No flags</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {active.map((f) => <Flag key={f.label} label={f.label} value={f.value} />)}
        </div>
      )}
    </div>
  )
}

export function ReferralSection({ data }: { data: ResidentData }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Referral & Assessment</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Referral Source" value={data.referralSource} />
        <Field label="Referring Agency/Person" value={data.referringAgencyPerson} />
        <Field label="COLB Registered" value={data.dateColbRegistered} />
        <Field label="COLB Obtained" value={data.dateColbObtained} />
        <Field label="Initial Assessment" value={data.initialCaseAssessment} />
        <Field label="Case Study Prepared" value={data.dateCaseStudyPrepared} />
      </div>
    </div>
  )
}

export function ReintegrationSection({ data }: { data: ResidentData }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Reintegration</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" value={data.reintegrationType} />
        <Field label="Status" value={data.reintegrationStatus} />
        <Field label="Date Enrolled" value={data.dateEnrolled} />
        <Field label="Date Closed" value={data.dateClosed} />
      </div>
    </div>
  )
}

export function DemographicsSection({ data }: { data: ResidentData }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Additional Demographics</h3>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Birth Status" value={data.birthStatus} />
        <Field label="Place of Birth" value={data.placeOfBirth} />
        <Field label="Religion" value={data.religion} />
        <Field label="Age Upon Admission" value={data.ageUponAdmission} />
        <Field label="Present Age" value={data.presentAge} />
      </div>
    </div>
  )
}
