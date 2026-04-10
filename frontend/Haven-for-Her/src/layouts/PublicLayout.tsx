import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { AmbientBackground } from '@/components/ui/ambient-background'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col text-foreground relative isolate">
      <AmbientBackground />
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground shadow-md sr-only z-[100] rounded-full px-4 py-2.5 text-sm font-semibold focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:inline-block focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
