import { DonorSidebar } from "@/components/donor/donor-sidebar"
import { DonorHeader } from "@/components/donor/donor-header"
import { ImpactSummary } from "@/components/donor/impact-summary"
import { AllocationChart } from "@/components/donor/allocation-chart"
import { RecentActivity } from "@/components/donor/recent-activity"
import { ImpactStories } from "@/components/donor/impact-stories"
import { DonationCTA } from "@/components/donor/donation-cta"

export default function DonorDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DonorSidebar />
      <div className="pl-64">
        <DonorHeader />
        <main className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Impact</h2>
            <p className="text-muted-foreground">
              See how your generosity is making a real difference in people&apos;s lives
            </p>
          </div>

          <div className="space-y-6">
            {/* Impact Metrics */}
            <ImpactSummary />

            {/* Donation CTA */}
            <DonationCTA />

            {/* Charts and Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              <AllocationChart />
              <RecentActivity />
            </div>

            {/* Impact Stories */}
            <ImpactStories />
          </div>
        </main>
      </div>
    </div>
  )
}
