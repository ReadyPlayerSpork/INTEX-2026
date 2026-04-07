import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

/**
 * Role-to-nav-link mapping. Each entry is only rendered if the current user
 * has the required role (or if roles is empty → always shown when authed).
 */
interface NavItem {
  label: string
  to: string
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  // Public-authenticated (any logged-in user)
  { label: 'Home', to: '/', roles: [] },
  { label: 'Donate', to: '/donate', roles: [] },
  { label: 'Volunteer', to: '/volunteer', roles: [] },
  { label: 'Resources', to: '/resources', roles: [] },
  { label: 'Impact', to: '/impact', roles: [] },

  // Role-gated
  { label: 'Donor Dashboard', to: '/donor/dashboard', roles: ['Donor'] },
  { label: 'My Resources', to: '/survivor/resources', roles: ['Survivor'] },
  { label: 'Financial', to: '/financial/dashboard', roles: ['Financial'] },
  { label: 'Counselor', to: '/counselor/dashboard', roles: ['Counselor'] },
  { label: 'Social Media', to: '/social/dashboard', roles: ['SocialMedia'] },
  { label: 'Admin', to: '/admin/dashboard', roles: ['Admin'] },
]

export function Navbar() {
  const { isAuthenticated, isLoading, hasRole, logout, email } = useAuth()
  const navigate = useNavigate()

  const visibleLinks = NAV_ITEMS.filter(
    (item) =>
      item.roles.length === 0 ||
      (isAuthenticated && hasRole(...item.roles)),
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex max-w-7xl items-center gap-4 rounded-full border border-border/70 bg-card/95 px-4 py-3 shadow-[0_16px_35px_-26px_rgba(74,44,94,0.4)] backdrop-blur">
        <Link to="/" className="min-w-0 whitespace-nowrap">
          <span className="font-heading text-xl font-semibold text-accent">
            Haven for Her
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {visibleLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full px-3 py-2 text-sm font-medium transition-[background-color,color]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? null : isAuthenticated ? (
            <>
              <span className="text-muted-foreground hidden max-w-48 truncate text-sm sm:inline">
                {email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
