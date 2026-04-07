import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  /** Roles that are allowed to access this route. If empty, any authenticated user can access. */
  allowedRoles?: string[]
  /** Where to redirect if not authenticated. Defaults to /login */
  loginPath?: string
}

/**
 * Wraps child routes so only authenticated (and optionally role-gated) users
 * can access them.
 *
 * Usage in route config:
 * ```tsx
 * <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
 *   <Route path="/admin/dashboard" element={<AdminDashboard />} />
 * </Route>
 * ```
 */
export function ProtectedRoute({
  allowedRoles = [],
  loginPath = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />
  }

  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return <ForbiddenPage />
  }

  return <Outlet />
}

function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-muted-foreground">
        You do not have permission to access this page.
      </p>
    </div>
  )
}
