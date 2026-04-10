import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface GuestOnlyRouteProps {
  redirectPath?: string
}

/** Redirects authenticated users (e.g. away from /login to /account). */
export function GuestOnlyRoute({
  redirectPath = '/account',
}: GuestOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-muted-foreground animate-pulse text-sm">Loading…</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}
