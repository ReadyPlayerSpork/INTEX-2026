import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock } from "lucide-react"

const alerts = [
  {
    type: "high-risk",
    title: "John Martinez - High Risk",
    description: "Blood pressure elevated for 3 consecutive days",
    time: "2 hours ago",
  },
  {
    type: "missing-update",
    title: "Missing Update - Room 204",
    description: "Daily check-in not completed for Maria Santos",
    time: "5 hours ago",
  },
  {
    type: "high-risk",
    title: "Robert Chen - Critical",
    description: "Medication review overdue by 7 days",
    time: "1 day ago",
  },
]

export function AlertsSection() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Active Alerts
          <Badge variant="destructive" className="ml-2">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-3"
          >
            <div
              className={`mt-0.5 rounded-full p-1.5 ${
                alert.type === "high-risk"
                  ? "bg-destructive/20 text-destructive"
                  : "bg-warning/20 text-warning"
              }`}
            >
              {alert.type === "high-risk" ? (
                <AlertTriangle className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground">
                {alert.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {alert.description}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {alert.time}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
