import { SafehouseList } from '@/features/resources/SafehouseList'

export function FindHomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Find a Safe Home</h1>
      <p className="text-muted-foreground mb-8">
        Browse active safe homes by region. All information shown is limited to
        help you find the nearest available home.
      </p>

      <SafehouseList showFilter={true} />
    </div>
  )
}

