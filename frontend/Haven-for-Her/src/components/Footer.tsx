import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-border bg-background border-t py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-sm sm:flex-row sm:justify-between">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} Haven for Her. All rights reserved.
        </p>
        <Link
          to="/privacy"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  )
}
