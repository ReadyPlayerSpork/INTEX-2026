import { Card, CardContent } from "@/components/ui/card"
import { Users, AlertTriangle, Heart, Calendar } from "lucide-react"

const metrics = [
  {
    title: "Active Residents",
    value: "128",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "High Risk Cases",
    value: "8",
    change: "-2",
    changeType: "positive" as const,
    icon: AlertTriangle,
  },
  {
    title: "Donations this Month",
    value: "$24,580",
    change: "+18%",
    changeType: "positive" as const,
    icon: Heart,
  },
  {
    title: "Upcoming Visits",
    value: "23",
    change: "Next 7 days",
    changeType: "neutral" as const,
    icon: Calendar,
  },
]

export function MetricsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="mt-2 text-2xl font-semibold text-card-foreground">
                  {metric.value}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    metric.changeType === "positive"
                      ? "text-success"
                      : metric.changeType === "negative"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {metric.change}
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-2.5">
                <metric.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
