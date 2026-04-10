import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { motion, useReducedMotion } from 'framer-motion'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export function NotFoundPage() {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()

  return (
    <div className="flex min-h-[65vh] items-center justify-center px-5 py-16">
      <ScrollReveal direction="none">
        <Card className="w-full max-w-xl border-primary/18 bg-primary/7 text-center">
          <CardContent className="p-8">
            <motion.p
              initial={shouldReduce ? false : {
                textShadow: '-3px 0 oklch(0.528 0.094 139 / 0.7), 3px 0 oklch(0.575 0.151 23 / 0.7)',
              }}
              animate={{
                textShadow: [
                  '-3px 0 oklch(0.528 0.094 139 / 0.7), 3px 0 oklch(0.575 0.151 23 / 0.7)',
                  '2px 0 oklch(0.528 0.094 139 / 0.5), -2px 0 oklch(0.575 0.151 23 / 0.5)',
                  '-1px 0 oklch(0.528 0.094 139 / 0.3), 1px 0 oklch(0.575 0.151 23 / 0.3)',
                  '0 0 0 transparent, 0 0 0 transparent',
                ],
                x: [0, -2, 3, -1, 0],
              }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="font-heading text-8xl font-bold text-accent/20"
            >
              404
            </motion.p>
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
      </ScrollReveal>
    </div>
  )
}
