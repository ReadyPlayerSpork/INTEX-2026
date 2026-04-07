"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Utensils, Home, Stethoscope, Briefcase } from "lucide-react"

const usageItems = [
  {
    icon: BookOpen,
    title: "Education",
    percentage: 40,
    description: "School supplies, tuition, and learning materials"
  },
  {
    icon: Utensils,
    title: "Nutrition",
    percentage: 20,
    description: "Daily meals and nutrition programs"
  },
  {
    icon: Home,
    title: "Safe Housing",
    percentage: 15,
    description: "Shelter and safe living environments"
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    percentage: 15,
    description: "Medical care and mental health support"
  },
  {
    icon: Briefcase,
    title: "Career Training",
    percentage: 10,
    description: "Vocational skills and job placement"
  }
]

export function DonationUsage() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Where Your Donation Goes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Every dollar is carefully allocated to maximize impact in the lives of young women
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usageItems.map((item, index) => (
            <Card key={index} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <span className="text-primary font-bold">{item.percentage}%</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
            <span className="w-2 h-2 bg-primary rounded-full" />
            0% of donations go to administrative costs
          </div>
        </div>
      </div>
    </section>
  )
}
