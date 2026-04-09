import { Link } from 'react-router-dom'
import { CrisisHotlines } from '@/features/resources/CrisisHotlines'

export function MyResourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">My Resources</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        You are not alone. Below are resources available to you as part of the
        Haven for Her community.
      </p>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Survivor Services</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ResourceCard
            title="Request Counseling"
            description="Apply for a counseling appointment with a trained counselor."
            linkTo="/survivor/counseling"
            linkLabel="Apply now"
          />
          <ResourceCard
            title="Find a Safe Home"
            description="Browse active safe homes near you, sorted by region."
            linkTo="/survivor/find-home"
            linkLabel="Search homes"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">Emergency & Legal Contacts</h2>
        <CrisisHotlines />
      </section>
    </div>
  )
}

function ResourceCard({
  title,
  description,
  linkTo,
  linkLabel,
}: {
  title: string
  description: string
  linkTo?: string
  linkLabel?: string
}) {
  return (
    <div className="bg-card border-border flex flex-col rounded-lg border p-6">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-muted-foreground flex-1 text-sm">{description}</p>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-primary mt-3 text-sm font-medium underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
