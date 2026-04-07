import { Menu, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { PRIMARY_NAV, type NavItem, sheetLinkClassName } from '@/components/nav-config'

export interface NavbarOverlaysProps {
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  isAuthenticated: boolean
  isLoading: boolean
  accountItems: NavItem[]
  email: string | null | undefined
  onLogout: () => void | Promise<void>
}

const sectionHeadingClass =
  'text-muted-foreground px-4 pb-2 text-xs font-semibold tracking-wide uppercase'

export function NavbarOverlays({
  mobileOpen,
  onMobileOpenChange,
  isAuthenticated,
  isLoading,
  accountItems,
  email,
  onLogout,
}: NavbarOverlaysProps) {
  const navigate = useNavigate()

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="min-h-11 min-w-11 shrink-0 md:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-haspopup="dialog"
          {...(mobileOpen ? { 'aria-controls': 'mobile-navigation-sheet' } : {})}
          onClick={() => onMobileOpenChange(true)}
        >
          <Menu data-icon="inline-start" />
        </Button>
        <SheetContent
          id="mobile-navigation-sheet"
          side="left"
          className="flex w-[min(100%,22rem)] flex-col gap-0 p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-border/60 border-b px-6 py-5 text-left">
            <SheetTitle className="font-heading text-lg">Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Primary navigation, account links, and sign-in options.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
            <section aria-labelledby="nav-explore-heading" className="flex flex-col gap-1">
              <h2 id="nav-explore-heading" className={sectionHeadingClass}>
                Explore
              </h2>
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={sheetLinkClassName}
                  onClick={() => onMobileOpenChange(false)}
                >
                  {item.label}
                </Link>
              ))}
            </section>

            {isAuthenticated ? (
              <>
                <Separator className="bg-border/60" />
                <section aria-labelledby="nav-account-heading" className="flex flex-col gap-1">
                  <h2 id="nav-account-heading" className={sectionHeadingClass}>
                    Account
                  </h2>
                  {email ? (
                    <p className="text-muted-foreground max-w-full px-4 pb-2 text-sm break-words">
                      {email}
                    </p>
                  ) : null}
                  {accountItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={sheetLinkClassName}
                      onClick={() => onMobileOpenChange(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 min-h-11 w-full justify-center"
                    onClick={() => void onLogout()}
                  >
                    Log out
                  </Button>
                </section>
              </>
            ) : (
              <div className="mt-auto flex flex-col gap-2 border-border/60 border-t pt-5">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full"
                  onClick={() => {
                    onMobileOpenChange(false)
                    navigate('/login')
                  }}
                >
                  Log in
                </Button>
                <Button
                  type="button"
                  className="min-h-11 w-full"
                  onClick={() => {
                    onMobileOpenChange(false)
                    navigate('/register')
                  }}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {isLoading ? null : isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            render={
              <Button
                variant="outline"
                size="sm"
                className="hidden min-h-10 gap-2 md:inline-flex"
                aria-label="Account menu"
                aria-haspopup="menu"
              />
            }
          >
            <UserRound data-icon="inline-start" />
            <span>Account</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            {email ? (
              <>
                <DropdownMenuLabel className="max-w-56 truncate font-normal">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            ) : null}
            {accountItems.length > 0 ? (
              <DropdownMenuGroup>
                {accountItems.map((item) => (
                  <DropdownMenuItem
                    key={item.to}
                    onClick={() => navigate(item.to)}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ) : null}
            {accountItems.length > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem variant="destructive" onClick={() => void onLogout()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="ghost" size="sm" className="min-h-10" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button size="sm" className="min-h-10" onClick={() => navigate('/register')}>
            Sign up
          </Button>
        </div>
      )}

      {!isLoading && !isAuthenticated ? (
        <div className="flex items-center gap-1.5 sm:hidden">
          <Button variant="ghost" size="sm" className="min-h-10" onClick={() => navigate('/login')}>
            Log in
          </Button>
          <Button size="sm" className="min-h-10" onClick={() => navigate('/register')}>
            Sign up
          </Button>
        </div>
      ) : null}
    </>
  )
}
