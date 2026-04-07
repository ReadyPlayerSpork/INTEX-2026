import { Navigate, useParams } from "react-router-dom"

import { isDesignVariantId } from "@/features/public/designReview"
import { LoginDesignReviewPage } from "@/features/public/login/LoginDesignReviewPage"

export function DesignReviewLoginPage() {
  const { variant } = useParams()

  if (!isDesignVariantId(variant)) {
    return <Navigate to="/design-review" replace />
  }

  return <LoginDesignReviewPage variant={variant} />
}
