import { Navigate, useParams } from "react-router-dom"

import { isDesignVariantId } from "@/features/public/designReview"
import { HomeDesignReviewPage } from "@/features/public/home/HomeDesignReviewPage"

export function DesignReviewHomePage() {
  const { variant } = useParams()

  if (!isDesignVariantId(variant)) {
    return <Navigate to="/design-review" replace />
  }

  return <HomeDesignReviewPage variant={variant} />
}
