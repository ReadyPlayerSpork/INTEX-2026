import { CrisisHotlines } from '@/features/resources/CrisisHotlines'
import { SafehouseList } from '@/features/resources/SafehouseList'

export function ResourcesPage() {
  return (
    <div className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            Resources and support
          </p>
          <h1 className="font-heading mt-3 text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold text-accent">
            Immediate help and nearby safe options
          </h1>
          <p className="text-muted-foreground mt-4 leading-8 text-pretty">
            This page is designed to help people find trustworthy support
            quickly, whether they need emergency contact information or a view
            of currently active safe homes.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="font-heading mb-4 text-2xl font-semibold text-accent">
            Crisis Hotlines
          </h2>
          <CrisisHotlines />
        </section>

        <section>
          <h2 className="font-heading mb-4 text-2xl font-semibold text-accent">
            Active Safe Homes
          </h2>
          <SafehouseList />
        </section>
      </div>
    </div>
  )
}

