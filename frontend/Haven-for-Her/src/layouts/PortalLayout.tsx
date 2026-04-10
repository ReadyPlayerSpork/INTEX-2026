/**
 * Shared portal shell used by Admin, Financial, Counselor, and SocialMedia layouts.
 * Provides a sidebar (desktop), mobile sheet nav, floating menu (mobile), and <Outlet />.
 */

import { useState, useCallback } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu, UserRound, ChevronDown, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
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

export interface PortalSection {
  title: string
  links: PortalLink[]
}

interface PortalLayoutProps {
  title: string
  sections: PortalSection[]
  /** Route used by the mobile FAB and logo link. Defaults to the first link. */
  homeRoute?: string
}

const navClass =
  'block rounded-xl px-3 py-2.5 text-sm font-semibold motion-safe:transition-colors motion-safe:duration-200'
const navInactive =
  'text-muted-foreground hover:bg-secondary hover:text-foreground'
const navActive = 'bg-primary/15 text-primary'

function AccordionNav({
  sections,
  openIndex,
  onToggle,
  closeMobileNav,
}: {
  sections: PortalSection[]
  openIndex: number | null
  onToggle: (idx: number) => void
  closeMobileNav?: () => void
}) {
  return (
    <>
      {sections.map((section, idx) => {
        const isOpen = openIndex === idx
        return (
          <div key={section.title} className="rounded-xl">
            <button
              type="button"
              onClick={() => onToggle(idx)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {section.title}
              <ChevronDown
                className={cn(
                  'size-4 opacity-50 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            {isOpen && (
              <div className="flex flex-col gap-0.5 pb-2 pt-1">
                {section.links.map(({ label, to, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => closeMobileNav?.()}
                    className={({ isActive }) =>
                      `${navClass} pl-6 font-medium ${isActive ? navActive : navInactive}`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

export function PortalLayout({ title, sections, homeRoute }: PortalLayoutProps) {
  const [mobileNav, setMobileNav] = useState(false)
  const [openSection, setOpenSection] = useState<number | null>(0)
  const [mobileOpenSection, setMobileOpenSection] = useState<number | null>(0)
  const home = homeRoute ?? sections[0]?.links[0]?.to ?? '/'

  const toggleSection = useCallback(
    (idx: number) => setOpenSection((prev) => (prev === idx ? null : idx)),
    [],
  )
  const toggleMobileSection = useCallback(
    (idx: number) => setMobileOpenSection((prev) => (prev === idx ? null : idx)),
    [],
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(240,221,213,0.55),_transparent_38%),linear-gradient(180deg,rgba(250,250,252,0.35),rgba(243,239,248,0.95))] text-foreground">
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
          <div className="flex size-10 shrink-0 items-center justify-center">
            <img src={logoMarkUrl} alt="H4H Logo" className="size-10 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold leading-tight text-accent">
              {title}
            </p>
            <p className="text-muted-foreground text-[11px] font-medium">Worker Portal</p>
          </div>
        </div>

        <div className="mb-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navClass} flex items-center gap-2 ${isActive ? navActive : navInactive}`
            }
          >
            <Home className="size-4" />
            Return to Home Page
          </NavLink>
        </div>

        <nav className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto pr-1" aria-label="Portal Navigation">
          <AccordionNav sections={sections} openIndex={openSection} onToggle={toggleSection} />
        </nav>

        <div className="mt-4 border-t border-border/60 p-2 pt-4">
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `${navClass} flex items-center gap-2 ${isActive ? navActive : navInactive}`
            }
          >
            <UserRound className="size-4" />
            Account
          </NavLink>
        </div>

        <p className="text-muted-foreground mt-4 px-2 text-[10px] leading-relaxed">
          Haven for Her — Protecting &amp; restoring lives.
        </p>
      </aside>

      {/* ── Main content area ───────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ── Mobile top header ───────────────────────────────────── */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-card/95 px-4 shadow-sm md:hidden">
          <div className="flex items-center gap-2.5">
            <img src={logoMarkUrl} alt="H4H Logo" className="size-8 object-contain" />
            <span className="font-heading text-sm font-semibold text-accent">{title}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMobileNav(true)}
            className="-mr-2"
          >
            <Menu className="size-6" />
          </Button>
        </header>

        <main id="portal-main" className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      {/* ── Mobile sheet nav ────────────────────────────────────── */}
      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="flex w-[min(100%,20rem)] flex-col gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="border-border/60 border-b px-5 py-4 text-left">
            <SheetTitle className="font-heading flex items-center gap-2 text-lg">
              <img src={logoMarkUrl} alt="H4H Logo" className="size-8 object-contain" />
              {title}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 min-h-0 flex-col overflow-y-auto p-3">
            <div className="mb-4 border-b border-border/60 pb-4">
              <NavLink
                to="/"
                onClick={() => setMobileNav(false)}
                className={({ isActive }) =>
                  `${navClass} flex items-center gap-2 ${isActive ? navActive : navInactive}`
                }
              >
                <Home className="size-4" />
                Return to Home Page
              </NavLink>
            </div>
            <nav className="flex flex-col gap-2" aria-label="Portal mobile navigation">
              <AccordionNav
                sections={sections}
                openIndex={mobileOpenSection}
                onToggle={toggleMobileSection}
                closeMobileNav={() => setMobileNav(false)}
              />
            </nav>
            <div className="mt-8">
              <NavLink
                to="/account"
                onClick={() => setMobileNav(false)}
                className={({ isActive }) =>
                  `${navClass} flex items-center gap-2 ${isActive ? navActive : navInactive}`
                }
              >
                <UserRound className="size-4" />
                Account
              </NavLink>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
