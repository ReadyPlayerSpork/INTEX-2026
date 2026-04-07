import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Users, Folder, TrendingUp } from "lucide-react"

const metrics = [
  {
    label: "Total Donated",
    value: "$12,450",
    subtext: "Since Jan 2023",
    icon: DollarSign,
    trend: "+$2,150 this year",
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Lives Impacted",
    value: "47",
    subtext: "Individuals helped",
    icon: Users,
    trend: "+12 this quarter",
    color: "bg-chart-3/20 text-chart-3",
  },
  {
    label: "Programs Supported",
    value: "5",
    subtext: "Active programs",
    icon: Folder,
    trend: "Housing, Food, Education",
    color: "bg-chart-2/20 text-chart-2",
  },
  {
    label: "Impact Score",
    value: "92",
    subtext: "Out of 100",
    icon: TrendingUp,
    trend: "Top 10% of donors",
    color: "bg-chart-4/20 text-chart-4",
  },
]

export function ImpactSummary() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
                <p className="text-xs text-muted-foreground">{metric.subtext}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${metric.color}`}>
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-primary font-medium">{metric.trend}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
