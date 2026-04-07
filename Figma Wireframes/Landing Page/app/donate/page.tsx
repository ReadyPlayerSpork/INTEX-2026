import { LandingHeader } from "@/components/landing/landing-header"
import { HeroSection } from "@/components/landing/hero-section"
import { ImpactStats } from "@/components/landing/impact-stats"
import { DonationUsage } from "@/components/landing/donation-usage"
import { Testimonials } from "@/components/landing/testimonials"
import { DonationSelector } from "@/components/landing/donation-selector"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="pt-16">
        <HeroSection />
        <ImpactStats />
        <DonationUsage />
        <Testimonials />
        <DonationSelector />
      </main>
      <LandingFooter />
    </div>
  )
}
