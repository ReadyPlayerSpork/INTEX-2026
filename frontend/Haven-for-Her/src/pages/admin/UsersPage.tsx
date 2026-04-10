/**
 * pages/admin/UsersPage.tsx
 * Admin user management — create, list, manage roles, delete.
 *
 * Capabilities:
 *   ① New User button → form to create account with email/password/roles
 *   ② Searchable, paginated user table
 *   ③ "Manage" per row → inline panel:
 *       • Role pills — click to toggle on / off instantly
 *       • Delete with inline confirmation
 *
 * Safety rules (enforced on both client and server):
 *   - Cannot delete yourself
 *   - Cannot remove Admin role from yourself
 *
 * Backend endpoints used:
 *   POST   /api/admin/users                    — create
 *   GET    /api/admin/users                    — list
 *   POST   /api/admin/users/{id}/roles         — add role
 *   DELETE /api/admin/users/{id}/roles/{role}  — remove role
 *   DELETE /api/admin/users/{id}               — delete
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react'
import { adminApi } from '@/api/adminApi'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/* ── Constants ──────────────────────────────────────────────────────────── */

const ALL_ROLES = ['Admin', 'Financial', 'Counselor', 'SocialMedia', 'Employee', 'Donor', 'Survivor'] as const

const ROLE_STYLE: Record<string, string> = {
  Admin:       'bg-accent/15 text-accent border-accent/30',
  Financial:   'bg-primary/15 text-primary border-primary/30',
  Counselor:   'bg-[var(--chart-5)]/15 text-[var(--chart-5)] border-[var(--chart-5)]/30',
  SocialMedia: 'bg-[var(--chart-3)]/20 text-[var(--chart-3)] border-[var(--chart-3)]/30',
  Employee:    'bg-secondary text-secondary-foreground border-border',
  Donor:       'bg-primary/10 text-primary border-primary/20',
  Survivor:    'bg-destructive/10 text-destructive border-destructive/20',
}

/* ── Types ──────────────────────────────────────────────────────────────── */

interface User {
  id: string
  email: string
  persona: string | null
  acquisitionSource: string | null
  roles: string[]
  createdAtUtc: string
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return iso?.split('T')[0] ?? '—'
}

/* ── Create User Form ───────────────────────────────────────────────────── */

interface CreateFormProps {
  onCreated: (user: User) => void
  onClose: () => void
}

function CreateUserForm({ onCreated, onClose }: CreateFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleRole(role: string) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSaving(true)
    setError('')
    try {
      const created = await adminApi.createUser({ email: email.trim(), password, roles: selectedRoles })
      onCreated(created)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-5 rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_4px_24px_rgba(74,44,94,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading font-semibold text-lg text-card-foreground">New User</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors"
          aria-label="Cancel"
        >
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-email" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Email
            </Label>
            <Input
              id="new-email"
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Password
            </Label>
            <Input
              id="new-password"
              type="password"
              required
              placeholder="Min 14 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Initial Roles (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((role) => {
              const active = selectedRoles.includes(role)
              return (
                <button
                  type="button"
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                    'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    active
                      ? ROLE_STYLE[role]
                      : 'border-dashed border-border bg-transparent text-muted-foreground hover:border-solid hover:bg-muted',
                  )}
                >
                  {active && <span className="text-[10px]">✓</span>}
                  {role}
                </button>
              )
            })}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={saving || !email || !password}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {saving ? 'Creating…' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Manage Panel (inline row expansion) ───────────────────────────────── */

interface ManagePanelProps {
  user: User
  currentEmail: string
  onClose: () => void
  onUpdated: (updated: User) => void
  onDeleted: (userId: string) => void
}

function ManagePanel({ user, currentEmail, onClose, onUpdated, onDeleted }: ManagePanelProps) {
  const [roles, setRoles] = useState<string[]>(user.roles)
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [roleError, setRoleError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const isSelf = user.email === currentEmail

  async function toggleRole(role: string) {
    if (busy) return
    setRoleError('')
    setBusy(role)
    try {
      const hasRole = roles.includes(role)
      if (hasRole) {
        await adminApi.removeRole(user.id, role)
        const next = roles.filter((r) => r !== role)
        setRoles(next)
        onUpdated({ ...user, roles: next })
      } else {
        await adminApi.addRole(user.id, role)
        const next = [...roles, role].sort()
        setRoles(next)
        onUpdated({ ...user, roles: next })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setRoleError(msg)
    } finally {
      setBusy(null)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await adminApi.deleteUser(user.id)
      onDeleted(user.id)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setDeleteError(msg)
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <tr>
      <td colSpan={4} className="px-0 pb-1 pt-0">
        <div className="mx-3 mb-2 rounded-2xl border border-border bg-background/70 p-4 shadow-[inset_0_1px_4px_rgba(74,44,94,0.06)]">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Managing <span className="text-card-foreground">{user.email}</span>
            </p>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Role toggles */}
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Roles — click to add or remove
          </p>
          <div className="mb-1 flex flex-wrap gap-2">
            {ALL_ROLES.map((role) => {
              const active = roles.includes(role)
              const loading = busy === role
              const selfAdmin = isSelf && role === 'Admin'
              return (
                <button
                  key={role}
                  disabled={!!busy || selfAdmin}
                  onClick={() => toggleRole(role)}
                  title={selfAdmin ? 'Cannot remove Admin from yourself' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                    'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    active
                      ? ROLE_STYLE[role]
                      : 'border-dashed border-border bg-transparent text-muted-foreground hover:border-solid hover:bg-muted',
                    loading && 'animate-pulse',
                  )}
                >
                  {loading ? <span className="text-[10px]">…</span> : active ? <span className="text-[10px]">✓</span> : null}
                  {role}
                </button>
              )
            })}
          </div>
          {roleError && <p className="mt-1 text-xs text-destructive">{roleError}</p>}

          {/* Divider */}
          <div className="my-3 border-t border-border" />

          {/* Delete */}
          {isSelf ? (
            <p className="text-xs text-muted-foreground">You cannot delete your own account.</p>
          ) : !confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-1"
            >
              <Trash2 size={12} />
              Delete user
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold text-destructive">
                Permanently delete{' '}
                <span className="underline underline-offset-2">{user.email}</span>? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  disabled={deleting}
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-destructive/80 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-1"
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  disabled={deleting}
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  Cancel
                </button>
              </div>
              {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export function UsersPage() {
  const { email: currentEmailOrNull } = useAuth()
  const currentEmail = currentEmailOrNull ?? ''

  const [items, setItems] = useState<User[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const pageSize = 25

  // Close expanded panel when page or search changes
  const prevRef = useRef({ page, search })
  useEffect(() => {
    if (prevRef.current.page !== page || prevRef.current.search !== search) {
      setExpandedId(null)
      prevRef.current = { page, search }
    }
  }, [page, search])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminApi.listUsers({ page, pageSize, search: search || undefined })
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { void fetchData() }, [fetchData])

  const totalPages = Math.ceil(totalCount / pageSize)

  function handleCreated(user: User) {
    setShowCreate(false)
    // Prepend to list and bump count (avoids a full refetch)
    setItems((prev) => [user, ...prev])
    setTotalCount((c) => c + 1)
  }

  function handleUpdated(updated: User) {
    setItems((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  function handleDeleted(userId: string) {
    setItems((prev) => prev.filter((u) => u.id !== userId))
    setTotalCount((c) => c - 1)
    setExpandedId(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-[0.18em]">
            Admin Users
          </p>
          <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">Users</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowCreate((s) => !s); setExpandedId(null) }}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              showCreate
                ? 'bg-muted text-card-foreground border border-border'
                : 'bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {showCreate ? <X size={14} /> : <Plus size={14} />}
            {showCreate ? 'Cancel' : 'New User'}
          </button>
          <Link
            to="/admin/roles"
            className={cn(buttonVariants({ variant: 'outline' }), 'no-underline rounded-full')}
          >
            Manage Roles
          </Link>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateUserForm
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {/* Search */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-sm rounded-full"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <>
          <Card className="overflow-hidden border-border/70 bg-card/95">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50 text-left">
                      <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Email
                      </th>
                      <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Roles
                      </th>
                      <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Created
                      </th>
                      <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No users found.
                        </td>
                      </tr>
                    )}

                    {items.map((u) => {
                      const isExpanded = expandedId === u.id
                      return (
                        <>
                          <tr
                            key={u.id}
                            className={cn(
                              'border-b border-border/70 transition-colors',
                              isExpanded ? 'bg-secondary/30' : 'hover:bg-secondary/40',
                            )}
                          >
                            <td className="px-4 py-2.5 font-medium text-card-foreground">
                              {u.email}
                              {u.email === currentEmail && (
                                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                  you
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex flex-wrap gap-1">
                                {u.roles.length > 0 ? (
                                  u.roles.map((r) => (
                                    <span
                                      key={r}
                                      className={cn(
                                        'inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                                        ROLE_STYLE[r] ?? 'bg-secondary text-secondary-foreground border-border',
                                      )}
                                    >
                                      {r}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">No roles</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                              {formatDate(u.createdAtUtc)}
                            </td>
                            <td className="px-4 py-2.5">
                              <button
                                onClick={() => {
                                  setShowCreate(false)
                                  setExpandedId(isExpanded ? null : u.id)
                                }}
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-150',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                                  isExpanded
                                    ? 'border-accent/30 bg-accent/10 text-accent'
                                    : 'border-border bg-card text-card-foreground hover:bg-muted',
                                )}
                              >
                                {isExpanded ? (
                                  <><ChevronUp size={11} /> Close</>
                                ) : (
                                  <><ChevronDown size={11} /> Manage</>
                                )}
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <ManagePanel
                              key={`manage-${u.id}`}
                              user={u}
                              currentEmail={currentEmail}
                              onClose={() => setExpandedId(null)}
                              onUpdated={handleUpdated}
                              onDeleted={handleDeleted}
                            />
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({totalCount} users)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
