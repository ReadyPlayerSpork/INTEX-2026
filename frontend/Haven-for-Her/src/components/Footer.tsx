import { Link } from 'react-router-dom'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export function Footer() {
  return (
    <footer className="bg-accent text-accent-foreground mt-20 py-10">
      <ScrollReveal distance={16}>
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="font-heading text-2xl font-semibold">Haven for Her</p>
            <p className="max-w-xl text-sm leading-6 text-accent-foreground/80">
              A calm, trustworthy space for support, giving, and advocacy. We
              build safe pathways toward healing, dignity, and long-term care.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-accent-foreground/70">
              &copy; {new Date().getFullYear()} Haven for Her. All rights reserved.
            </p>
            <Link
              to="/privacy"
              className="inline-flex text-accent-foreground underline-offset-4 transition-colors hover:text-accent-foreground/80 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  )
}
