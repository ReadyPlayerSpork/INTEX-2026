import { DesignReviewChrome } from "@/features/public/DesignReviewChrome"
import type { DesignVariantId } from "@/features/public/designReview"
import { HomeDesignVariant } from "@/features/public/home/HomeDesignVariants"
import { useImpactStats } from "@/features/public/home/useImpactStats"

export function HomeDesignReviewPage({ variant }: { variant: DesignVariantId }) {
  const { stats, isLoading } = useImpactStats()

  return (
    <DesignReviewChrome
      pageId="home"
      variant={variant}
      title="Landing Page Variants"
      description="Three public-facing visual directions for the homepage, all using the same impact data and primary calls to action."
    >
      <HomeDesignVariant variant={variant} stats={stats} isLoading={isLoading} />
    </DesignReviewChrome>
  )
}
