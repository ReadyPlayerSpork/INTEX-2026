import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, ArrowUpRight } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "donation",
    amount: "$250",
    program: "Housing Support",
    date: "Mar 28, 2026",
    status: "completed",
    impact: "Helped provide shelter for 2 individuals",
  },
  {
    id: 2,
    type: "donation",
    amount: "$100",
    program: "Food Programs",
    date: "Mar 15, 2026",
    status: "completed",
    impact: "Provided 40 meals to families in need",
  },
  {
    id: 3,
    type: "recurring",
    amount: "$50/month",
    program: "Education Fund",
    date: "Mar 1, 2026",
    status: "active",
    impact: "Supporting literacy programs",
  },
  {
    id: 4,
    type: "donation",
    amount: "$500",
    program: "Emergency Aid",
    date: "Feb 20, 2026",
    status: "completed",
    impact: "Emergency assistance for 3 families",
  },
  {
    id: 5,
    type: "donation",
    amount: "$150",
    program: "Healthcare",
    date: "Feb 10, 2026",
    status: "completed",
    impact: "Medical supplies for clinic visits",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">
            Recent Donation Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your latest contributions and their impact
          </p>
        </div>
        <a
          href="#"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                {activity.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Clock className="h-5 w-5 text-chart-3" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">
                    {activity.amount}
                    <span className="ml-2 text-muted-foreground font-normal">
                      to {activity.program}
                    </span>
                  </p>
                  <Badge
                    variant={activity.status === "active" ? "default" : "secondary"}
                    className={
                      activity.status === "active"
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : ""
                    }
                  >
                    {activity.type === "recurring" ? "Recurring" : "One-time"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.impact}</p>
                <p className="text-xs text-muted-foreground">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
