import { Link } from "react-router-dom"
import { Eye, LayoutTemplate, Waypoints } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { designReviewPages, designVariants } from "@/features/public/designReview"

export function DesignReviewIndexPage() {
  return (
    <div className="bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,rgba(24,24,27,0.95),rgba(63,63,70,0.94),rgba(161,98,7,0.88))] text-white shadow-xl">
          <CardContent className="grid gap-8 px-8 py-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <Badge className="bg-white/15 text-white">Internal review only</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Design Lab for Public Page Variants
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                  Compare nine design directions across the landing page, anonymous
                  donation flow, and login page without switching branches or rewriting
                  the production routes.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: LayoutTemplate,
                  title: "27 review routes",
                  body: "Three pages with nine visual directions each.",
                },
                {
                  icon: Waypoints,
                  title: "Shared behavior",
                  body: "Each variant uses the same data fetches and form flows.",
                },
                {
                  icon: Eye,
                  title: "Fast comparison",
                  body: "Move between variants in one running app session.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <item.icon className="size-5" />
                  <h2 className="mt-4 font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/75">{item.body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-3">
          {designReviewPages.map((page) => (
            <Card key={page.id} className="shadow-sm">
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {page.label}
                </Badge>
                <CardTitle className="text-2xl">{page.label}</CardTitle>
                <CardDescription className="text-sm leading-6">
                  {page.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-muted/40 p-4 text-sm leading-6">
                  Production route:{" "}
                  <Link to={page.productionRoute} className="font-medium underline underline-offset-4">
                    {page.productionRoute}
                  </Link>
                </div>
                <p className="text-muted-foreground text-sm">
                  9 options: mission-first, youthful, institutional, sanctuary,
                  beacon, bloom, chronicle, radiant, and refuge.
                </p>
                <div className="grid gap-3">
                  {designVariants.map((variant) => (
                    <div
                      key={`${page.id}-${variant.id}`}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{variant.label}</p>
                        <p className="text-muted-foreground text-sm">{variant.shortDescription}</p>
                      </div>
                      <Link to={`${page.routePrefix}/${variant.id}`}>
                        <Button size="sm" variant="outline">
                          Open
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
