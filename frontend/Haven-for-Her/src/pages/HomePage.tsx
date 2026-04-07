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
                Haven for Her supports survivors of sexual abuse and trafficking
                with trauma-informed care, safe housing, education, counseling,
                and a community that believes healing should feel possible.
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
                  <p className="text-primary text-3xl font-extrabold">
                    {stats ? stats.activeResidents : '...'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    girls currently supported
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/85 p-5">
                  <p className="text-primary text-3xl font-extrabold">
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
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-semibold text-accent">
                  Our impact, held with care
                </h2>
                <p className="text-muted-foreground mt-2 max-w-2xl text-pretty">
                  Every number below represents practical support, safer
                  conditions, and people showing up consistently.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Residents served" value={stats.totalResidentsServed} />
              <StatCard label="Active residents" value={stats.activeResidents} />
              <StatCard label="Total donations" value={stats.totalDonations} />
              <StatCard label="Active safe homes" value={stats.activeSafehouses} />
              <StatCard label="Active partners" value={stats.activePartners} />
              <StatCard
                label="Total donated (PHP)"
                value={stats.totalDonationValuePhp.toLocaleString()}
              />
            </div>
          </div>
        </section>
      )}

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-card/95">
            <CardContent className="p-8">
              <h2 className="font-heading text-3xl font-semibold text-accent">
                Our mission
              </h2>
              <p className="text-muted-foreground mt-4 leading-8 text-pretty">
                We create safe spaces where survivors can begin again with
                trauma-informed counseling, education support, health services,
                and reintegration planning rooted in dignity.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/7">
            <CardContent className="p-8">
              <h2 className="font-heading text-3xl font-semibold text-accent">
                How you can help
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-accent font-semibold">Give</p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    Fund meals, counseling sessions, and day-to-day care.
                  </p>
                </div>
                <div>
                  <p className="text-accent font-semibold">Volunteer</p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    Share time, practical support, or professional skills.
                  </p>
                </div>
                <div>
                  <p className="text-accent font-semibold">Advocate</p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    Help more families discover safe and credible resources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="h-full border-border/70 bg-card/95">
      <CardContent className="p-6 text-center">
        <p className="text-primary text-3xl font-extrabold">{value}</p>
        <p className="text-muted-foreground mt-2 text-sm">{label}</p>
      </CardContent>
    </Card>
  )
}
