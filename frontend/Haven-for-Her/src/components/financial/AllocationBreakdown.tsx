import type { AllocationSummary, ProgramAreaSummary } from '@/api/financialApi'

interface AllocationBreakdownProps {
  bySafehouse: AllocationSummary[]
  byProgramArea: ProgramAreaSummary[]
}

export function AllocationBreakdown({ bySafehouse, byProgramArea }: AllocationBreakdownProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-cream p-6">
        <h3 className="mb-4 font-heading text-lg font-semibold text-plum">By Safehouse</h3>
        {bySafehouse.length === 0 ? (
          <p className="text-sm text-soft-purple/70">No allocations found.</p>
        ) : (
          <div className="space-y-3">
            {bySafehouse.map((s) => {
              const maxTotal = Math.max(...bySafehouse.map((x) => x.total), 1)
              const pct = (s.total / maxTotal) * 100
              return (
                <div key={s.safehouseId}>
                  <div className="flex justify-between text-sm">
                    <span className="text-soft-purple">{s.safehouseName}</span>
                    <span className="font-medium text-plum">{s.total.toLocaleString()} ({s.count})</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-blush">
                    <div className="h-full rounded-full bg-sage transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-cream p-6">
        <h3 className="mb-4 font-heading text-lg font-semibold text-plum">By Program Area</h3>
        {byProgramArea.length === 0 ? (
          <p className="text-sm text-soft-purple/70">No allocations found.</p>
        ) : (
          <div className="space-y-3">
            {byProgramArea.map((p) => {
              const maxTotal = Math.max(...byProgramArea.map((x) => x.total), 1)
              const pct = (p.total / maxTotal) * 100
              return (
                <div key={p.programArea}>
                  <div className="flex justify-between text-sm">
                    <span className="text-soft-purple">{p.programArea}</span>
                    <span className="font-medium text-plum">{p.total.toLocaleString()} ({p.count})</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-blush">
                    <div className="h-full rounded-full bg-plum/50 transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
