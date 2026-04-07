import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/client'

interface AssignedResident {
  residentId: number
  internalCode: string
  safehouseName: string
  riskLevel: string
  status: string
}

interface RecentSession {
  processRecordingId: number
  sessionDate: string
  residentInternalCode: string
  sessionType: string
  sessionDurationMinutes: number
}

interface CounselorDashboard {
  assignedResidents: AssignedResident[]
  recentSessions: RecentSession[]
  openRequestsCount: number
}

export function CounselorDashboardPage() {
  const [data, setData] = useState<CounselorDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<CounselorDashboard>('/api/counselor/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-muted-foreground">Unable to load dashboard.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Counselor Dashboard</h1>

      <div className="mb-8 grid grid-cols-3 gap-6">
        <div className="bg-card border-border rounded-lg border p-6 text-center">
          <p className="text-primary text-3xl font-bold">{data.assignedResidents.length}</p>
          <p className="text-muted-foreground mt-1 text-sm">Assigned Residents</p>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 text-center">
          <p className="text-primary text-3xl font-bold">{data.recentSessions.length}</p>
          <p className="text-muted-foreground mt-1 text-sm">Recent Sessions</p>
        </div>
        <div className="bg-card border-border rounded-lg border p-6 text-center">
          <p className="text-primary text-3xl font-bold">{data.openRequestsCount}</p>
          <p className="text-muted-foreground mt-1 text-sm">Open Requests</p>
        </div>
      </div>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assigned Residents</h2>
          <Link to="/counselor/sessions" className="text-primary text-sm underline">
            View sessions
          </Link>
        </div>
        {data.assignedResidents.length === 0 ? (
          <p className="text-muted-foreground text-sm">No assigned residents.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">Safehouse</th>
                  <th className="px-3 py-2 font-medium">Risk Level</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.assignedResidents.map((r) => (
                  <tr key={r.residentId} className="border-border border-b">
                    <td className="px-3 py-2">{r.internalCode}</td>
                    <td className="px-3 py-2">{r.safehouseName}</td>
                    <td className="px-3 py-2">{r.riskLevel}</td>
                    <td className="px-3 py-2">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Sessions</h2>
        {data.recentSessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent sessions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Resident</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Duration (min)</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSessions.map((s) => (
                  <tr key={s.processRecordingId} className="border-border border-b">
                    <td className="px-3 py-2">{s.sessionDate}</td>
                    <td className="px-3 py-2">{s.residentInternalCode}</td>
                    <td className="px-3 py-2">{s.sessionType}</td>
                    <td className="px-3 py-2">{s.sessionDurationMinutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
