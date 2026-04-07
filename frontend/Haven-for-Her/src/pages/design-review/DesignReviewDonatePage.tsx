import { Navigate, useParams } from "react-router-dom"

import { isDesignVariantId } from "@/features/public/designReview"
import { AnonymousDonateDesignReviewPage } from "@/features/public/donate/AnonymousDonateDesignReviewPage"

export function DesignReviewDonatePage() {
  const { variant } = useParams()

  if (!isDesignVariantId(variant)) {
    return <Navigate to="/design-review" replace />
  }

  return <AnonymousDonateDesignReviewPage variant={variant} />
}
