import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useImpactStats } from '@/features/public/home/useImpactStats'

export function HomePage() {
  const { stats } = useImpactStats()

  return (
    <div>
      {/* Hero section */}
      <section className="bg-primary/5 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Haven for Her
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Providing safe homes and holistic support for girls who are survivors
            of sexual abuse and trafficking in the Philippines.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/donate">
              <Button size="lg">Donate</Button>
            </Link>
            <Link to="/volunteer">
              <Button variant="outline" size="lg">
                Volunteer
              </Button>
            </Link>
            <Link to="/impact">
              <Button variant="ghost" size="lg">
                See our impact
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact stats */}
      {stats && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold">Our Impact</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
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

      {/* Mission section */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground">
            We operate safe homes where survivors receive trauma-informed care,
            counseling, education, and support for reintegration. Every child
            deserves safety, dignity, and a future filled with hope.
          </p>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card border-border rounded-lg border p-6 text-center">
      <p className="text-primary text-3xl font-bold">{value}</p>
      <p className="text-muted-foreground mt-1 text-sm">{label}</p>
    </div>
  )
}
