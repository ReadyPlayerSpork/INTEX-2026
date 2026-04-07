import { useCallback, useEffect, useState } from 'react'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/* ---------- Types ---------- */

interface User {
  id: string
  email: string
  persona: string | null
  acquisitionSource: string | null
  roles: string[]
  createdAtUtc: string
}

interface PagedResult {
  items: User[]
  totalCount: number
}

/* ---------- Page ---------- */

export function UsersPage() {
  const [items, setItems] = useState<User[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const pageSize = 25

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (search) params.set('search', search)
      const res = await api.get<PagedResult>(`/api/admin/users?${params}`)
      setItems(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Admin users
          </p>
          <h1 className="font-heading mt-2 text-4xl font-semibold text-accent">
            Users
          </h1>
        </div>
        <a href="/admin/roles">
          <Button variant="outline">Manage Roles</Button>
        </a>
      </div>

      {error && <p className="text-destructive mb-4">{error}</p>}

      {/* Search */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="animate-pulse">Loading users...</p>
      ) : (
        <>
          <Card className="overflow-hidden border-border/70 bg-card/95">
            <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border bg-secondary/50 border-b text-left">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Roles</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-border/70 hover:bg-secondary/40 border-b transition-colors">
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <span
                              key={r}
                              className="bg-secondary text-secondary-foreground inline-block rounded-full px-3 py-1 text-xs font-semibold"
                            >
                              {r}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">{u.createdAtUtc?.split('T')[0] ?? '-'}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground px-3 py-4 text-center">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Page {page} of {totalPages} ({totalCount} users)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
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
