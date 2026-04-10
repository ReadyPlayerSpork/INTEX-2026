import { useLayoutEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CrisisHotlines } from '@/features/resources/CrisisHotlines'
import { SafehouseList } from '@/features/resources/SafehouseList'
import { useAuth } from '@/hooks/useAuth'
import womanWearingGlasses from '@/assets/Woman Wearing Glasses.jpg'

export function ResourcesPage() {
  const location = useLocation()
  const { isAuthenticated, hasRole, isLoading: authLoading } = useAuth()
  const safeHomesSectionRef = useRef<HTMLElement>(null)

  const isSurvivor =
    !authLoading && isAuthenticated && hasRole('Survivor')
  const counselingHref = isSurvivor
    ? '/survivor/counseling'
    : `/login?returnUrl=${encodeURIComponent('/survivor/counseling')}`

  useLayoutEffect(() => {
    if (location.hash === '#safe-homes' && safeHomesSectionRef.current) {
      safeHomesSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [location.hash])

  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-10 lg:grid-cols-[1.5fr_0.5fr] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
              Resources and support
            </p>
            <h1 className="font-heading mt-3 text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
              Immediate help and nearby safe options
            </h1>
            <p className="text-muted-foreground mt-4 leading-8 text-pretty">
              This page is designed to help people find trustworthy support
              quickly, whether you need emergency contact information or a view
              of currently active safe homes. Requesting counseling uses your
              account so we can follow up safely; browsing safe homes does not
              require signing in.
            </p>
          </div>
          <img
            src={womanWearingGlasses}
            alt="Woman wearing glasses looking thoughtfully"
            className="hidden lg:block rounded-3xl object-cover aspect-[3/4] w-full shadow-xl border border-border/50 brightness-105 contrast-105"
          />
        </div>

        <section className="mb-12">
          <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="font-heading text-2xl font-semibold text-accent">
              Crisis Hotlines
            </h2>
            <span className="flex h-6 items-center rounded-full bg-red-100 px-2.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">Emergency</span>
          </div>
          <CrisisHotlines />
        </section>

        <section className="mb-12">
          <h2 className="font-heading mb-4 text-2xl font-semibold text-accent">
            Survivor services
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl text-sm leading-relaxed">
            If you are looking for counseling or housing support, start here.
            You can review safe homes without an account. Submitting a
            counseling request requires a short sign-in so we can coordinate
            with you.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
                <div className="bg-card border-border flex flex-col rounded-xl border p-6 shadow-sm">
                  <h3 className="mb-2 font-semibold">Request counseling</h3>
                  <p className="text-muted-foreground flex-1 text-sm">
                    Apply for a counseling appointment with a trained counselor.
                    Sign in (or create an account) to submit a request securely.
                  </p>
                  <Link
                    to={counselingHref}
                    className="text-primary mt-3 text-sm font-medium underline hover:text-primary/80 transition-colors"
                  >
                    {isSurvivor ? 'Apply now' : 'Sign in to apply'}
                  </Link>
                </div>
                <div className="bg-card border-border flex flex-col rounded-xl border p-6 shadow-sm">
                  <h3 className="mb-2 font-semibold">Find a safe home</h3>
                  <p className="text-muted-foreground flex-1 text-sm">
                    Browse active safe homes by region. No account required.
                  </p>
                  <a
                    href="#safe-homes"
                    className="text-primary mt-3 text-sm font-medium underline hover:text-primary/80 transition-colors"
                  >
                    View active safe homes
                  </a>
                </div>
              </div>
        </section>

        <section ref={safeHomesSectionRef} id="safe-homes" className="scroll-mt-24">
          <h2 className="font-heading mb-4 text-2xl font-semibold text-accent">
            Active Safe Homes
          </h2>
          <SafehouseList />
        </section>
      </div>
    </div>
  )
}
