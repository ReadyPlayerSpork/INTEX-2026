import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Quote } from "lucide-react"

const stories = [
  {
    id: 1,
    name: "Maria S.",
    program: "Housing Support",
    quote:
      "Thanks to the housing program, my children and I finally have a safe place to call home. We are forever grateful.",
    outcome: "Now employed and self-sufficient",
    image: "/placeholder-avatar-1.jpg",
  },
  {
    id: 2,
    name: "James T.",
    program: "Education Fund",
    quote:
      "The education support helped me complete my GED. I never thought I could do it, but your support made it possible.",
    outcome: "Enrolled in community college",
    image: "/placeholder-avatar-2.jpg",
  },
  {
    id: 3,
    name: "The Rodriguez Family",
    program: "Food Programs",
    quote:
      "During our hardest times, knowing we had food on the table gave us hope. Thank you for caring about families like ours.",
    outcome: "Back on their feet after job loss",
    image: "/placeholder-avatar-3.jpg",
  },
]

export function ImpactStories() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">
            Stories of Impact
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real stories from people your donations have helped
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          Read more stories
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-muted/30 to-transparent p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" />
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {story.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{story.name}</p>
                  <p className="text-xs text-primary">{story.program}</p>
                </div>
              </div>
              <blockquote className="mb-4 text-sm leading-relaxed text-muted-foreground italic">
                &ldquo;{story.quote}&rdquo;
              </blockquote>
              <div className="rounded-lg bg-primary/5 px-3 py-2">
                <p className="text-xs font-medium text-primary">
                  Outcome: {story.outcome}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
