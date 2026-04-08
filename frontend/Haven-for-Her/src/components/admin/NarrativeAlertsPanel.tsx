/**
 * Mockup-style narrative alert cards (data from /api/admin/dashboard).
 */

import { Link } from 'react-router-dom'
import { AlertTriangle, Flag, CalendarX, ShieldAlert, ClipboardCheck } from 'lucide-react'

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return 'recently'
  const sec = Math.round((Date.now() - t) / 1000)
  if (sec < 45) return 'just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} minute${min !== 1 ? 's' : ''} ago`
  const hr = Math.round(min / 60)
  if (hr < 36) return `${hr} hour${hr !== 1 ? 's' : ''} ago`
  const days = Math.round(hr / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

interface Escalating {
  residentId: number
  caseControlNo: string
  currentRiskLevel: string
  initialRiskLevel: string
  safehouse: string
  referenceAt: string
}

interface Concern {
  recordingId: number
  residentId: number
  sessionDate: string
  caseControlNo: string
  referenceAt: string
}

interface Missed {
  residentId: number
  caseControlNo: string
  safehouse: string
  referenceAt: string
}

interface Incident {
  incidentId: number
  residentId: number
  caseControlNo: string
  safehouseName: string
  severity: string
  referenceAt: string
}

interface FollowUp {
  residentId: number
  caseControlNo: string
  reintegrationStatus: string
  referenceAt: string
}

export interface NarrativeAlertsPanelProps {
  escalatingRisk: Escalating[]
  recentConcerns: Concern[]
  missedSessions: Missed[]
  unresolvedIncidents: Incident[]
  followUpNeeded: FollowUp[]
  maxItems?: number
}

function Card({
  icon: Icon,
  tone,
  title,
  body,
  when,
  to,
}: {
  icon: React.ElementType
  tone: 'red' | 'plum' | 'amber' | 'sage'
  title: string
  body: string
  when: string
  to: string
}) {
  const border =
    tone === 'red'
      ? 'border-destructive/25 bg-destructive/[0.04]'
      : tone === 'amber'
        ? 'border-[var(--chart-3)]/30 bg-[var(--chart-3)]/[0.06]'
        : tone === 'sage'
          ? 'border-primary/25 bg-primary/[0.06]'
          : 'border-accent/25 bg-accent/[0.05]'
  const iconBg =
    tone === 'red'
      ? 'bg-destructive/15 text-destructive'
      : tone === 'amber'
        ? 'bg-[var(--chart-3)]/15 text-[var(--chart-3)]'
        : tone === 'sage'
          ? 'bg-primary/15 text-primary'
          : 'bg-accent/15 text-accent'

  return (
    <Link
      to={to}
      className={`block rounded-xl border p-3 motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-md ${border}`}
    >
      <div className="flex gap-2.5">
        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-card-foreground text-xs font-bold">{title}</p>
          <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">{body}</p>
          <p className="text-muted-foreground mt-1.5 text-[10px] font-medium">{when}</p>
        </div>
      </div>
    </Link>
  )
}

export function NarrativeAlertsPanel({
  escalatingRisk,
  recentConcerns,
  missedSessions,
  unresolvedIncidents,
  followUpNeeded,
  maxItems = 6,
}: NarrativeAlertsPanelProps) {
  type Kind =
    | { k: 'e'; t: string; d: Escalating }
    | { k: 'c'; t: string; d: Concern }
    | { k: 'm'; t: string; d: Missed }
    | { k: 'i'; t: string; d: Incident }
    | { k: 'f'; t: string; d: FollowUp }

  const pool: Kind[] = [
    ...escalatingRisk.map((d) => ({ k: 'e' as const, t: d.referenceAt, d })),
    ...recentConcerns.map((d) => ({ k: 'c' as const, t: d.referenceAt, d })),
    ...missedSessions.map((d) => ({ k: 'm' as const, t: d.referenceAt, d })),
    ...unresolvedIncidents.map((d) => ({ k: 'i' as const, t: d.referenceAt, d })),
    ...followUpNeeded.map((d) => ({ k: 'f' as const, t: d.referenceAt, d })),
  ]

  pool.sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime())
  const picked = pool.slice(0, maxItems)

  if (picked.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-[0_4px_24px_rgba(74,44,94,0.03)]">
        <p className="text-card-foreground text-sm font-semibold">No priority alerts</p>
        <p className="text-muted-foreground mt-1 text-xs">Caseload is clear for surfaced items.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_4px_24px_rgba(74,44,94,0.03)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-heading text-base font-semibold text-card-foreground">Active alerts</h3>
        <Link
          to="/admin/caseload"
          className="text-primary text-xs font-semibold hover:underline"
        >
          View caseload →
        </Link>
      </div>
      <ul className="space-y-2">
        {picked.map((item, idx) => {
          if (item.k === 'e') {
            const d = item.d
            return (
              <li key={`e-${d.residentId}-${idx}`}>
                <Card
                  icon={AlertTriangle}
                  tone="red"
                  title={`Escalating risk — ${d.caseControlNo}`}
                  body={`Current risk (${d.currentRiskLevel}) is higher than initial (${d.initialRiskLevel}) at ${d.safehouse}. Immediate review recommended.`}
                  when={relativeTime(d.referenceAt)}
                  to={`/admin/caseload/${d.residentId}`}
                />
              </li>
            )
          }
          if (item.k === 'c') {
            const d = item.d
            return (
              <li key={`c-${d.recordingId}-${idx}`}>
                <Card
                  icon={Flag}
                  tone="plum"
                  title={`Flagged session — ${d.caseControlNo}`}
                  body="Most recent process recording marked concerns flagged. Follow-up action pending."
                  when={relativeTime(d.referenceAt)}
                  to={`/admin/caseload/${d.residentId}`}
                />
              </li>
            )
          }
          if (item.k === 'm') {
            const d = item.d
            return (
              <li key={`m-${d.residentId}-${idx}`}>
                <Card
                  icon={CalendarX}
                  tone="amber"
                  title={`Missed session — ${d.caseControlNo}`}
                  body={`No process recording in the last 30 days for a resident at ${d.safehouse}. Counselor follow-up may be needed.`}
                  when={relativeTime(d.referenceAt)}
                  to={`/admin/caseload/${d.residentId}`}
                />
              </li>
            )
          }
          if (item.k === 'i') {
            const d = item.d
            return (
              <li key={`i-${d.incidentId}-${idx}`}>
                <Card
                  icon={ShieldAlert}
                  tone="red"
                  title={`Unresolved incident — ${d.safehouseName}`}
                  body={`Case ${d.caseControlNo}: ${d.severity} severity incident still open. Review and document response.`}
                  when={relativeTime(d.referenceAt)}
                  to="/admin/incidents"
                />
              </li>
            )
          }
          const d = item.d
          return (
            <li key={`f-${d.residentId}-${idx}`}>
              <Card
                icon={ClipboardCheck}
                tone="sage"
                title={`Follow-up needed — ${d.caseControlNo}`}
                body={`Reintegration status “${d.reintegrationStatus}” with no recent home visit on record. Schedule check-in.`}
                when={relativeTime(d.referenceAt)}
                to={`/admin/caseload/${d.residentId}`}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
