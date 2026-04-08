/**
 * Shared portal shell used by Admin, Financial, Counselor, and SocialMedia layouts.
 * Provides a sidebar (desktop), mobile sheet nav, header with avatar, and <Outlet />.
 */

import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Bell, LayoutDashboard, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import logoMarkUrl from '@/assets/LogoH4HTransparentBackground.svg'

export interface PortalLink {
  label: string
  to: string
  end?: boolean
}

interface PortalLayoutProps {
  title: string
  subtitle: string
  links: PortalLink[]
  /** Route used by the mobile FAB and logo link. Defaults to the first link. */
  homeRoute?: string
}

const navClass =
  'block rounded-xl px-3 py-2.5 text-sm font-semibold motion-safe:transition-colors motion-safe:duration-200'
const navInactive =
  'text-muted-foreground hover:bg-secondary hover:text-foreground'
const navActive = 'bg-primary/15 text-primary'

export function PortalLayout({ title, subtitle, links, homeRoute }: PortalLayoutProps) {
  const { email } = useAuth()
  const initial = email?.trim().charAt(0).toUpperCase() ?? 'U'
  const [mobileNav, setMobileNav] = useState(false)
  const home = homeRoute ?? links[0]?.to ?? '/'

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(240,221,213,0.55),_transparent_38%),linear-gradient(180deg,rgba(250,250,252,0.35),rgba(243,239,248,0.95))] text-foreground">
      {/* Skip link */}
      <a
        href="#portal-main"
        className="bg-primary text-primary-foreground sr-only z-[100] rounded-full px-4 py-2.5 text-sm font-semibold focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:inline-block focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
      >
        Skip to content
      </a>

      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="sticky top-0 hidden h-screen w-[min(100%,15.5rem)] shrink-0 flex-col border-r border-border/70 bg-card/90 px-3 py-6 shadow-[4px_0_24px_-18px_rgba(74,44,94,0.25)] backdrop-blur md:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/20">
            <span className="font-heading text-lg font-bold text-primary">H</span>
          </div>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold leading-tight text-accent">
              {title}
            </p>
            <p className="text-muted-foreground text-[11px] font-medium">{subtitle}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5" aria-label={subtitle}>
          {links.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${navClass} ${isActive ? navActive : navInactive}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <p className="text-muted-foreground mt-6 border-t border-border/60 px-2 pt-4 text-[10px] leading-relaxed">
          Haven for Her — Protecting &amp; restoring lives.
        </p>
      </aside>

      {/* ── Main content area ───────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-card/85 px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 md:hidden">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="min-h-11 min-w-11 shrink-0"
                aria-label={`Open ${subtitle.toLowerCase()} menu`}
                onClick={() => setMobileNav(true)}
              >
                <Menu className="size-5" />
              </Button>
              <img src={logoMarkUrl} alt="" className="size-9 shrink-0" width={36} height={36} />
              <span className="font-heading truncate text-sm font-semibold text-accent">
                {subtitle}
              </span>
            </div>
            <div className="hidden min-w-0 md:block" />
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/80 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-safe:transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-[18px]" />
              </button>
              <div
                className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-primary/10 font-heading text-sm font-bold text-primary"
                title={email ?? subtitle}
              >
                {initial}
              </div>
            </div>
          </div>
        </header>

        <main id="portal-main" className="flex-1 px-4 py-6 md:px-8 md:py-8" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* ── Mobile FAB ──────────────────────────────────────────── */}
      <NavLink
        to={home}
        className="border-border/70 bg-card/95 text-muted-foreground hover:text-foreground fixed bottom-4 right-4 z-40 flex size-12 items-center justify-center rounded-full border shadow-lg md:hidden"
        aria-label="Dashboard"
      >
        <LayoutDashboard className="size-5" />
      </NavLink>

      {/* ── Mobile sheet nav ────────────────────────────────────── */}
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="flex w-[min(100%,20rem)] flex-col gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="border-border/60 border-b px-5 py-4 text-left">
            <SheetTitle className="font-heading text-lg">{subtitle} menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-0.5 overflow-y-auto p-3" aria-label={`${subtitle} mobile`}>
            {links.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileNav(false)}
                className={({ isActive }) =>
                  `${navClass} ${isActive ? navActive : navInactive}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
