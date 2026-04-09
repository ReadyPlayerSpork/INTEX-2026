/**
 * Resident caseload preview — search + risk/status filters (client-side on API slice).
 */

import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'

export interface CaseloadRow {
  residentId: number
  caseControlNo: string
  safehouseName: string
  caseStatus: string
  currentRiskLevel: string
  assignedSocialWorker: string
  dateOfAdmission: string
  lastSessionDate: string | null
  flaggedConcerns: boolean
}

interface CaseloadPreviewTableProps {
  rows: CaseloadRow[]
}

const RISKS = ['All risks', 'Low', 'Medium', 'High', 'Critical'] as const
const STATUSES = ['All status', 'Active', 'Closed'] as const

function formatAdmit(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export const CaseloadPreviewTable = memo(function CaseloadPreviewTable({ rows }: CaseloadPreviewTableProps) {
  const [q, setQ] = useState('')
  const [risk, setRisk] = useState<string>('All risks')
  const [status, setStatus] = useState<string>('All status')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (risk !== 'All risks' && r.currentRiskLevel !== risk) return false
      if (status !== 'All status' && r.caseStatus !== status) return false
      if (!term) return true
      const hay = [
        r.caseControlNo,
        r.assignedSocialWorker,
        r.safehouseName,
        String(r.residentId),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(term)
    })
  }, [rows, q, risk, status])

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-bloom">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-base font-semibold text-card-foreground">
            Resident caseload
          </h2>
          <p className="text-muted-foreground text-xs">
            Showing {filtered.length} of {rows.length} active (preview)
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            placeholder="Search by case #, worker, home…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 min-w-[min(100%,14rem)] rounded-xl bg-background/80 sm:min-w-[16rem]"
          />
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="border-input bg-background text-foreground h-10 rounded-xl border px-3 text-sm font-medium"
            aria-label="Filter by risk"
          >
            {RISKS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border-input bg-background text-foreground h-10 rounded-xl border px-3 text-sm font-medium"
            aria-label="Filter by status"
          >
            {STATUSES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[400px] rounded-xl border border-border/60">
        <table className="w-full min-w-[640px] text-left text-sm" aria-label="Resident caseload preview">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-border text-muted-foreground border-b text-xs font-bold uppercase tracking-wide">
              <th scope="col" className="px-3 py-2.5">Case #</th>
              <th scope="col" className="px-3 py-2.5">Safehouse</th>
              <th scope="col" className="px-3 py-2.5">Status</th>
              <th scope="col" className="px-3 py-2.5">Risk</th>
              <th scope="col" className="px-3 py-2.5">Social worker</th>
              <th scope="col" className="px-3 py-2.5">Admitted</th>
              <th scope="col" className="px-3 py-2.5">Last session</th>
              <th scope="col" className="px-3 py-2.5">Flags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No matching residents.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr
                key={r.residentId}
                className="border-border/60 hover:bg-secondary/40 border-b last:border-0"
              >
                <td className="px-3 py-2.5">
                  <Link
                    to={`/admin/caseload/${r.residentId}`}
                    className="text-primary font-semibold hover:underline"
                  >
                    {r.caseControlNo}
                  </Link>
                </td>
                <td className="text-card-foreground px-3 py-2.5">{r.safehouseName}</td>
                <td className="text-muted-foreground px-3 py-2.5">{r.caseStatus}</td>
                <td className="px-3 py-2.5">
                  <span
                    className={
                      r.currentRiskLevel === 'Critical'
                        ? 'text-destructive font-semibold'
                        : r.currentRiskLevel === 'High'
                          ? 'text-accent font-semibold'
                          : 'text-card-foreground'
                    }
                  >
                    {r.currentRiskLevel}
                  </span>
                </td>
                <td className="text-muted-foreground px-3 py-2.5">{r.assignedSocialWorker}</td>
                <td className="text-muted-foreground px-3 py-2.5 tabular-nums">
                  {formatAdmit(r.dateOfAdmission)}
                </td>
                <td className="text-muted-foreground px-3 py-2.5 tabular-nums">
                  {r.lastSessionDate
                    ? formatAdmit(r.lastSessionDate)
                    : '—'}
                </td>
                <td className="px-3 py-2.5">
                  {r.flaggedConcerns ? (
                    <span className="bg-accent/15 text-accent inline-flex rounded-full px-2 py-0.5 text-xs font-bold">
                      Flagged
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground mt-3 text-center text-xs">
        <Link to="/admin/caseload" className="text-primary font-semibold hover:underline">
          Open full caseload →
        </Link>
      </p>
    </div>
  )
})
