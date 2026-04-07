import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
    <header className="border-border bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="text-lg font-semibold whitespace-nowrap">
          Haven for Her
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {visibleLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? null : isAuthenticated ? (
            <>
              <span className="text-muted-foreground hidden text-sm sm:inline">
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
