"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote: "Because of this program, I was the first in my family to graduate high school. Now I'm studying to become a doctor.",
    name: "Amara K.",
    age: 19,
    location: "Kenya",
    outcome: "Medical School Student"
  },
  {
    quote: "They didn't just give me books—they gave me belief in myself. The mentorship changed everything for me.",
    name: "Maria S.",
    age: 17,
    location: "Guatemala",
    outcome: "Scholarship Recipient"
  },
  {
    quote: "I now run my own small business and support my younger sisters through school. This foundation made it possible.",
    name: "Priya M.",
    age: 24,
    location: "India",
    outcome: "Entrepreneur"
  }
]

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Stories of Transformation
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Real voices from the young women whose lives have been changed by donors like you
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border relative overflow-hidden">
              <CardContent className="p-8">
                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                <blockquote className="text-foreground leading-relaxed mb-6 text-lg">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}, {testimonial.age}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
                    {testimonial.outcome}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
