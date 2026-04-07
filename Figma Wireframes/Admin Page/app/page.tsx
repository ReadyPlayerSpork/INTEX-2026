import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { AlertsSection } from "@/components/dashboard/alerts-section"
import { ResidentsTable } from "@/components/dashboard/residents-table"
import { DonationsChart } from "@/components/dashboard/donations-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Overview
              </h2>
              <p className="text-sm text-muted-foreground">
                Monitor your facility at a glance
              </p>
            </div>
            <QuickActions />
          </div>

          <div className="space-y-6">
            <MetricsCards />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DonationsChart />
              </div>
              <div>
                <AlertsSection />
              </div>
            </div>

            <ResidentsTable />
          </div>
        </main>
      </div>
    </div>
  )
}
