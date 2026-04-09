import { lazy, startTransition, Suspense, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  filterVisibleAccountItems,
  navLinkClassName,
  PRIMARY_NAV,
} from '@/components/nav-config'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import logoMarkUrl from '@/assets/LogoH4HTransparentBackground.svg'

const NavbarOverlays = lazy(() =>
  import('@/components/NavbarOverlays').then((m) => ({ default: m.NavbarOverlays })),
)

function NavbarOverlaysFallback({
  isLoading,
  isAuthenticated,
}: {
  isLoading: boolean
  isAuthenticated: boolean
}) {
  return (
    <div className="flex flex-1 items-center justify-end gap-2 md:flex-initial">
      <div
        className="size-11 shrink-0 rounded-full border border-border/40 bg-secondary/30 md:hidden"
        aria-hidden
      />
      {isLoading ? null : isAuthenticated ? (
        <div
          className="hidden h-10 min-w-[7.5rem] rounded-full bg-secondary/30 md:block"
          aria-hidden
        />
      ) : (
        <>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="h-9 w-16 rounded-full bg-secondary/30" aria-hidden />
            <div className="h-9 w-20 rounded-full bg-secondary/30" aria-hidden />
          </div>
          <div className="flex gap-1.5 sm:hidden">
            <div className="h-9 w-14 rounded-full bg-secondary/30" aria-hidden />
            <div className="h-9 w-16 rounded-full bg-secondary/30" aria-hidden />
          </div>
        </>
      )}
    </div>
  )
}

export function Navbar() {
  const { isAuthenticated, isLoading, hasRole, logout, email } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const accountItems = filterVisibleAccountItems(isAuthenticated, hasRole)

  useEffect(() => {
    startTransition(() => {
      setMobileOpen(false)
    })
  }, [location.pathname])

  const handleLogout = async () => {
    setMobileOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex max-w-7xl items-center gap-3 rounded-full border border-border/70 bg-card/95 px-3 py-3 shadow-[0_16px_35px_-26px_rgba(74,44,94,0.4)] backdrop-blur sm:gap-4 sm:px-4">
        <Link
          to="/"
          className="focus-visible:border-ring inline-flex min-w-0 shrink-0 items-center rounded-md outline-none focus-visible:ring-4 focus-visible:ring-ring/20 motion-safe:transition-[box-shadow,border-color]"
        >
          <img
            src={logoMarkUrl}
            alt="Haven for Her"
            width={96}
            height={96}
            decoding="async"
            className="size-11 object-contain sm:size-12 md:size-[3.25rem]"
          />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 flex-wrap items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {PRIMARY_NAV.map((item) => (
            <Link key={item.to} to={item.to} className={navLinkClassName}>
              {item.label}
            </Link>
          ))}
        </nav>

        {!isLoading && isAuthenticated && accountItems.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'hidden min-h-10 gap-1 md:inline-flex',
              )}
              aria-label="Tools and portals"
              aria-haspopup="menu"
            >
              Tools
              <ChevronDown className="size-4 opacity-70" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              {accountItems.map((item) => (
                <DropdownMenuItem
                  key={item.to}
                  onClick={() => navigate(item.to)}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <Suspense
          fallback={
            <NavbarOverlaysFallback
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
            />
          }
        >
          <NavbarOverlays
            mobileOpen={mobileOpen}
            onMobileOpenChange={setMobileOpen}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            accountItems={accountItems}
            email={email}
            onLogout={handleLogout}
          />
        </Suspense>
      </div>
    </header>
  )
}
