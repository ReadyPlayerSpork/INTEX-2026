import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(240,221,213,0.6),_transparent_34%),linear-gradient(180deg,rgba(250,250,252,0.28),rgba(243,239,248,0.92))] text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
