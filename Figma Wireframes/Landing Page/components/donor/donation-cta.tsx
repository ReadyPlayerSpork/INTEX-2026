import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles, ArrowRight } from "lucide-react"

const suggestedAmounts = [
  { amount: 25, impact: "Provides 10 meals" },
  { amount: 50, impact: "School supplies for a child" },
  { amount: 100, impact: "Week of emergency shelter" },
  { amount: 250, impact: "Month of job training" },
]

export function DonationCTA() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Continue Making a Difference
              </h3>
            </div>
            <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
              Your support has already transformed 47 lives. Every additional donation
              helps us reach more individuals in need. Together, we can create lasting
              change in our community.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-destructive" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">23 donors</strong> gave this week
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {suggestedAmounts.map((item) => (
                <button
                  key={item.amount}
                  className="group flex flex-col items-center rounded-lg border border-border bg-card p-3 transition-all hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-lg font-bold text-foreground group-hover:text-primary">
                    ${item.amount}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {item.impact}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" size="lg">
                Donate Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                Set Up Monthly
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
