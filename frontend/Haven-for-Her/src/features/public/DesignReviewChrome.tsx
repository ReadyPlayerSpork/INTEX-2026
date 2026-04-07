import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  designReviewPages,
  designVariants,
  getDesignVariantMeta,
  type DesignReviewPageId,
  type DesignVariantId,
} from "@/features/public/designReview"
import { cn } from "@/lib/utils"

interface DesignReviewChromeProps {
  pageId: DesignReviewPageId
  variant: DesignVariantId
  title: string
  description: string
  children: ReactNode
}

export function DesignReviewChrome({
  pageId,
  variant,
  title,
  description,
  children,
}: DesignReviewChromeProps) {
  const variantMeta = getDesignVariantMeta(variant)

  return (
    <div className="bg-muted/30">
      <section className="border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                Design Review
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="text-muted-foreground max-w-3xl text-sm leading-6">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{variantMeta.label}</Badge>
              <span className="text-muted-foreground text-sm">
                {variantMeta.shortDescription}
              </span>
              <Link to="/design-review">
                <Button variant="outline" size="sm">
                  Review Index
                </Button>
              </Link>
            </div>
          </div>

          <Card className="rounded-2xl border-dashed">
            <CardHeader className="gap-4">
              <CardTitle className="text-base">Compare Variants</CardTitle>
              <div className="flex flex-wrap gap-2">
                {designReviewPages.map((page) => (
                  <Link key={page.id} to={`${page.routePrefix}/${variant}`}>
                    <Button
                      variant={page.id === pageId ? "default" : "outline"}
                      size="sm"
                    >
                      {page.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex flex-wrap gap-2">
                {designVariants.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`${
                      designReviewPages.find((page) => page.id === pageId)?.routePrefix ??
                      "/design-review"
                    }/${entry.id}`}
                  >
                    <Button
                      variant={entry.id === variant ? "default" : "ghost"}
                      size="sm"
                      className={cn(entry.id === variant && "shadow-sm")}
                    >
                      {entry.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="pb-16">{children}</div>
    </div>
  )
}
