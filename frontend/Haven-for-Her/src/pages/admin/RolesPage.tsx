import { useCallback, useEffect, useState } from 'react'
import { adminApi, type UserDto } from '@/api/adminApi'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const ALL_ROLES = [
  'Admin',
  'Financial',
  'Counselor',
  'SocialMedia',
  'Employee',
  'Donor',
  'Survivor',
]

export function RolesPage() {
  const { email: currentEmail } = useAuth()
  const [users, setUsers] = useState<UserDto[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const pageSize = 25

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.listUsers({ search, page, pageSize })
      setUsers(res.items)
      setTotalCount(res.totalCount)
    } catch (err) {
      console.error('Failed to load users', err)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const toggleRole = async (user: UserDto, role: string) => {
    const key = `${user.id}-${role}`
    setActionLoading(key)
    try {
      if (user.roles.includes(role)) {
        await adminApi.removeRole(user.id, role)
      } else {
        await adminApi.addRole(user.id, role)
      }
      await fetchUsers()
    } catch (err) {
      console.error('Role change failed', err)
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Role Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="border-input bg-background w-full max-w-sm rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Loading users...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <th className="px-3 py-2 font-medium">Email</th>
                  {ALL_ROLES.map((role) => (
                    <th key={role} className="px-3 py-2 text-center font-medium">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.email === currentEmail
                  return (
                    <tr
                      key={user.id}
                      className="border-border hover:bg-muted/50 border-b"
                    >
                      <td className="px-3 py-2">
                        {user.email}
                        {isSelf && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            (you)
                          </span>
                        )}
                      </td>
                      {ALL_ROLES.map((role) => {
                        const hasRole = user.roles.includes(role)
                        const isLoading =
                          actionLoading === `${user.id}-${role}`
                        // Prevent removing Admin from yourself
                        const disabled =
                          isLoading ||
                          (isSelf && role === 'Admin' && hasRole)

                        return (
                          <td key={role} className="px-3 py-2 text-center">
                            <Button
                              variant={hasRole ? 'default' : 'outline'}
                              size="xs"
                              disabled={disabled}
                              onClick={() => toggleRole(user, role)}
                            >
                              {isLoading ? '...' : hasRole ? 'Yes' : '-'}
                            </Button>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

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
