import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { counselorApi, type SessionDetailDto, type UpdateSessionRequest } from '@/api/counselorApi'
import { Button } from '@/components/ui/button'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<SessionDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<UpdateSessionRequest | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchSession = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await counselorApi.getSession(Number(id))
      setSession(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { void fetchSession() }, [fetchSession])

  function startEdit() {
    if (!session) return
    setForm({
      residentId: session.residentId,
      sessionDate: session.sessionDate,
      sessionType: session.sessionType,
      sessionDurationMinutes: session.sessionDurationMinutes,
      emotionalStateObserved: session.emotionalStateObserved,
      emotionalStateEnd: session.emotionalStateEnd,
      sessionNarrative: session.sessionNarrative,
      interventionsApplied: session.interventionsApplied,
      followUpActions: session.followUpActions,
      progressNoted: session.progressNoted,
      concernsFlagged: session.concernsFlagged,
      referralMade: session.referralMade,
      socialWorker: session.socialWorker,
    })
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !session) return
    setSubmitting(true)
    try {
      await counselorApi.updateSession(session.recordingId, form)
      setEditing(false)
      void fetchSession()
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    if (!form) return
    const target = e.target
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value
    setForm((prev) => prev ? { ...prev, [target.name]: value } : prev)
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-12"><p className="text-muted-foreground animate-pulse">Loading...</p></div>
  }

  if (!session) {
    return <div className="mx-auto max-w-4xl px-4 py-12"><p className="text-muted-foreground">Session not found.</p></div>
  }

  const inputCls = 'border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm'

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-2 flex items-center gap-2 text-sm text-soft-purple/70">
        <Link to="/counselor/sessions" className="hover:text-plum underline">Sessions</Link>
        <span>/</span>
        <span>Session #{session.recordingId}</span>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-plum">Session #{session.recordingId}</h1>
          <p className="text-sm text-soft-purple">
            Resident {session.residentCode} &middot; {session.sessionDate} &middot; {session.sessionType} &middot; {session.sessionDurationMinutes} min
          </p>
        </div>
        {!editing && <Button size="sm" onClick={startEdit}>Edit Session</Button>}
      </div>

      {editing && form ? (
        <form onSubmit={handleSave} className="space-y-4 rounded-2xl bg-cream p-6">
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-sm font-medium">Session Date</span><input name="sessionDate" type="date" value={form.sessionDate} onChange={handleChange} className={inputCls} /></label>
            <label className="block">
              <span className="text-sm font-medium">Session Type</span>
              <select name="sessionType" value={form.sessionType} onChange={handleChange} className={inputCls}>
                <option value="Individual">Individual</option><option value="Group">Group</option>
              </select>
            </label>
            <label className="block"><span className="text-sm font-medium">Duration (min)</span><input name="sessionDurationMinutes" type="number" value={form.sessionDurationMinutes} onChange={handleChange} className={inputCls} /></label>
            <label className="block"><span className="text-sm font-medium">Emotional State (start)</span><input name="emotionalStateObserved" value={form.emotionalStateObserved} onChange={handleChange} className={inputCls} /></label>
            <label className="block"><span className="text-sm font-medium">Emotional State (end)</span><input name="emotionalStateEnd" value={form.emotionalStateEnd} onChange={handleChange} className={inputCls} /></label>
          </div>
          <label className="block"><span className="text-sm font-medium">Session Narrative</span><textarea name="sessionNarrative" rows={5} value={form.sessionNarrative} onChange={handleChange} className={inputCls} /></label>
          <label className="block"><span className="text-sm font-medium">Interventions Applied</span><textarea name="interventionsApplied" rows={3} value={form.interventionsApplied} onChange={handleChange} className={inputCls} /></label>
          <label className="block"><span className="text-sm font-medium">Follow-Up Actions</span><textarea name="followUpActions" rows={3} value={form.followUpActions} onChange={handleChange} className={inputCls} /></label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2"><input name="progressNoted" type="checkbox" checked={form.progressNoted} onChange={handleChange} /><span className="text-sm">Progress Noted</span></label>
            <label className="flex items-center gap-2"><input name="concernsFlagged" type="checkbox" checked={form.concernsFlagged} onChange={handleChange} /><span className="text-sm">Concerns Flagged</span></label>
            <label className="flex items-center gap-2"><input name="referralMade" type="checkbox" checked={form.referralMade} onChange={handleChange} /><span className="text-sm">Referral Made</span></label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Emotional Journey */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-cream p-5">
              <p className="text-xs font-medium uppercase text-soft-purple/70">Emotional State (Start)</p>
              <p className="mt-1 text-lg font-medium text-plum">{session.emotionalStateObserved}</p>
            </div>
            <div className="rounded-2xl bg-cream p-5">
              <p className="text-xs font-medium uppercase text-soft-purple/70">Emotional State (End)</p>
              <p className="mt-1 text-lg font-medium text-plum">{session.emotionalStateEnd}</p>
            </div>
          </div>

          {/* Flags */}
          <div className="flex gap-3">
            {session.progressNoted && <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage">Progress Noted</span>}
            {session.concernsFlagged && <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">Concerns Flagged</span>}
            {session.referralMade && <span className="rounded-full bg-plum/10 px-3 py-1 text-xs font-medium text-plum">Referral Made</span>}
          </div>

          {/* Narrative */}
          <div className="rounded-2xl bg-cream p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Session Narrative</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-soft-purple">{session.sessionNarrative}</p>
          </div>

          {/* Interventions */}
          <div className="rounded-2xl bg-cream p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Interventions Applied</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-soft-purple">{session.interventionsApplied}</p>
          </div>

          {/* Follow-Up */}
          <div className="rounded-2xl bg-cream p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase text-soft-purple/70">Follow-Up Actions</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-soft-purple">{session.followUpActions}</p>
          </div>
        </div>
      )}
    </div>
  )
}
