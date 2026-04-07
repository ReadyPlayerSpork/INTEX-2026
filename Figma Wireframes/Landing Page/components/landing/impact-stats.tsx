"use client"

import { Users, TrendingUp, GraduationCap, Globe } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "12,450+",
    label: "Girls Helped",
    description: "Young women supported through our programs"
  },
  {
    icon: TrendingUp,
    value: "94%",
    label: "Success Rate",
    description: "Of participants complete their education"
  },
  {
    icon: GraduationCap,
    value: "2,800+",
    label: "Scholarships",
    description: "Full scholarships awarded to date"
  },
  {
    icon: Globe,
    value: "15",
    label: "Countries",
    description: "Communities reached worldwide"
  }
]

export function ImpactStats() {
  return (
    <section className="py-20 bg-foreground">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-4 text-balance">
            Know that your donation is making a difference
          </h2>
          <p className="text-background/70 max-w-2xl mx-auto text-lg">
            We prove every project you fund with complete transparency and real results
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-full mb-4">
                <stat.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-background mb-2">
                {stat.value}
              </div>
              <div className="text-background font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-background/60 text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
