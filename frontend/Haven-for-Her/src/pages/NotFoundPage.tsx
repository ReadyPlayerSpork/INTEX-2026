import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[65vh] items-center justify-center px-5 py-16">
      <Card className="w-full max-w-xl border-primary/18 bg-primary/7 text-center">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.18em] uppercase">
            404
          </p>
          <h1 className="font-heading mt-3 text-5xl font-semibold text-accent">
            This page could not be found
          </h1>
          <p className="text-muted-foreground mt-4 leading-7 text-pretty">
            The page may have moved, or the link may be out of date. We can get
            you back to a safe starting point.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="default"
              onClick={() => navigate(-1)}
            >
              Go back
            </Button>
            <Link
              to="/"
              className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex no-underline')}
            >
              Go home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
