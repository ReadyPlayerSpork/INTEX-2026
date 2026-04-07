"use client"

import { Button } from "@/components/ui/button"
import { Heart, ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-card">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8">
          <Heart className="w-4 h-4" />
          <span>Empowering Girls Since 2015</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 text-balance">
          Every Girl Deserves a
          <span className="text-primary block">Chance to Shine</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Your donation provides education, mentorship, and resources to girls in underserved communities. 
          Together, we&apos;re breaking barriers and building futures.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="px-8 py-6 text-lg font-semibold">
            Donate Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold">
            See Our Impact
          </Button>
        </div>
        
        <p className="mt-6 text-sm text-muted-foreground">
          100% of your donation goes directly to our programs
        </p>
      </div>
    </section>
  )
}
