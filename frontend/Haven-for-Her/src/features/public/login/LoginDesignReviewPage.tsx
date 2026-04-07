import { DesignReviewChrome } from "@/features/public/DesignReviewChrome"
import type { DesignVariantId } from "@/features/public/designReview"
import { LoginDesignVariant } from "@/features/public/login/LoginDesignVariants"
import { useLoginForm } from "@/features/public/login/useLoginForm"

export function LoginDesignReviewPage({ variant }: { variant: DesignVariantId }) {
  const loginForm = useLoginForm()

  return (
    <DesignReviewChrome
      pageId="login"
      variant={variant}
      title="Login Page Variants"
      description="Three sign-in directions that preserve the same auth flow, Google sign-in link, and error handling."
    >
      <LoginDesignVariant variant={variant} {...loginForm} />
    </DesignReviewChrome>
  )
}
