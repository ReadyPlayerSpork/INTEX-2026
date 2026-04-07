import { DesignReviewChrome } from "@/features/public/DesignReviewChrome"
import type { DesignVariantId } from "@/features/public/designReview"
import { AnonymousDonateDesignVariant } from "@/features/public/donate/AnonymousDonateDesignVariants"
import { useAnonymousDonateForm } from "@/features/public/donate/useAnonymousDonateForm"

export function AnonymousDonateDesignReviewPage({
  variant,
}: {
  variant: DesignVariantId
}) {
  const donateForm = useAnonymousDonateForm()

  return (
    <DesignReviewChrome
      pageId="donate"
      variant={variant}
      title="Anonymous Donation Variants"
      description="Three public-facing donation designs using the same anonymous donation endpoint, field set, and success/error behavior."
    >
      <AnonymousDonateDesignVariant variant={variant} {...donateForm} />
    </DesignReviewChrome>
  )
}
