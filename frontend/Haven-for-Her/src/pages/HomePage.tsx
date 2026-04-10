import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useImpactStats } from '@/features/public/home/useImpactStats'
import logoWordmarkUrl from '@/assets/LogoHavenForHerTransparentBackground.svg'

export function HomePage() {
  const { stats } = useImpactStats()

  return (
    <div className="space-y-20 pb-10 pt-6 sm:pt-8">
      <section className="px-5 pt-6 pb-16 md:px-10 md:pt-10 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <img
              src={logoWordmarkUrl}
              alt="Haven for Her"
              width={440}
              height={170}
              decoding="async"
              fetchPriority="high"
              className="mx-auto mb-2 w-full max-w-[min(100%,18rem)] object-contain sm:mb-2.5 sm:max-w-sm md:mx-0 md:mb-3 md:max-w-md lg:max-w-lg xl:max-w-xl"
            />
            <div className="flex flex-col gap-6">
              <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
                Safe homes. Steady care. Long-term hope.
              </p>
              <h1 className="font-heading text-balance text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] font-semibold text-accent">
                A softer, safer path forward for girls rebuilding their lives.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg leading-8 text-pretty">
                Haven for Her is a community of care dedicated to survivors of sexual abuse and trafficking. We provide the stability and resources needed for residents to rebuild their lives.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/donate"
                  className={cn(buttonVariants({ size: 'lg' }), 'no-underline')}
                >
                  Give with care
                </Link>
                <Link
                  to="/volunteer"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'no-underline',
                  )}
                >
                  Volunteer
                </Link>
                <Link
                  to="/impact"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'lg' }),
                    'no-underline',
                  )}
                >
                  See our impact
                </Link>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border-border/70 bg-[linear-gradient(160deg,rgba(255,251,247,0.96),rgba(240,221,213,0.72),rgba(243,239,248,0.92))]">
            <CardContent className="grid gap-5 p-8">
              <div className="rounded-2xl border border-border/60 bg-card/90 p-5">
                <p className="text-muted-foreground text-sm">What care looks like</p>
                <p className="mt-3 font-heading text-3xl font-semibold text-accent">
                  Dignity first
                </p>
                <p className="text-muted-foreground mt-3 text-sm leading-6 text-pretty">
                  Stable shelter, trusted adults, counseling access, education,
                  and reintegration planning built around each resident’s pace.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-card/85 p-5">
                  <p className="font-heading text-primary text-3xl font-semibold">
                    {stats ? stats.activeResidents : '...'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    girls currently supported
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/85 p-5">
                  <p className="font-heading text-primary text-3xl font-semibold">
                    {stats ? stats.activeSafehouses : '...'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    active safe homes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {stats && (
        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <h2 className="font-heading text-3xl font-semibold text-accent md:text-4xl">
                Our impact, held with care
              </h2>
            </div>
            
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
              <div className="flex-1 space-y-8">
                <p className="font-heading text-xl leading-relaxed sm:text-2xl sm:leading-relaxed text-muted-foreground text-pretty">
                  We have served <strong className="text-primary font-bold">{stats.totalResidentsServed}</strong> survivors on their journey to healing, with <strong className="text-primary font-bold">{stats.activeResidents}</strong> girls currently residing across our <strong className="text-primary font-bold">{stats.activeSafehouses}</strong> active safe homes.
                </p>
                <div className="h-px w-24 bg-border/80"></div>
                <p className="text-lg leading-8 text-muted-foreground text-pretty">
                  Because of our <strong className="text-primary font-bold">{stats.activePartners}</strong> active organizational partners and countless individual volunteers, we are able to provide practical support, safer conditions, and ensure our community shows up consistently for those who need it most.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-5 py-16 md:px-10 md:py-24" aria-label="Mission and ways to help">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-card/95">
            <CardContent className="flex flex-col justify-between p-6 md:p-8">
              <div>
                <h2 className="font-heading text-3xl font-semibold text-accent">
                  Our mission
                </h2>
                <p className="text-muted-foreground mt-4 leading-8 text-pretty">
                  We provide the environment and resources necessary for survivors to regain their autonomy and secure a sustainable future.
                </p>
              </div>
              <Link
                to="/impact"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'mt-6 w-fit no-underline',
                )}
              >
                See our impact
              </Link>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/7">
            <CardContent className="p-6 md:p-8">
              <h2 className="font-heading text-3xl font-semibold text-accent">
                How you can help
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Link to="/donate" className="group no-underline">
                  <h3 className="text-accent font-semibold group-hover:text-primary transition-colors duration-150">Give</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    Fund meals, counseling sessions, and day-to-day care.
                  </p>
                </Link>
                <Link to="/volunteer" className="group no-underline">
                  <h3 className="text-accent font-semibold group-hover:text-primary transition-colors duration-150">Volunteer</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    Share time, practical support, or professional skills.
                  </p>
                </Link>
                <Link to="/impact" className="group no-underline">
                  <h3 className="text-accent font-semibold group-hover:text-primary transition-colors duration-150">Advocate</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    Help more families discover safe and credible resources.
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}


