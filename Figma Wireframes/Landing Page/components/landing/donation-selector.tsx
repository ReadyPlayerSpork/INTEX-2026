"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Check } from "lucide-react"

const donationAmounts = [
  { value: 10, impact: "Provides school supplies for 1 girl" },
  { value: 25, impact: "Funds 1 week of nutritious meals" },
  { value: 50, impact: "Covers 1 month of tutoring" },
  { value: 100, impact: "Sponsors a girl for 1 month" },
  { value: 250, impact: "Funds a full semester of education" },
]

export function DonationSelector() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setIsCustom(false)
    setCustomAmount("")
  }

  const handleCustomInput = (value: string) => {
    setCustomAmount(value)
    setIsCustom(true)
    setSelectedAmount(null)
  }

  const currentAmount = isCustom ? (parseInt(customAmount) || 0) : (selectedAmount || 0)

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Make a Difference Today
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose an amount that works for you. Every contribution, big or small, changes lives.
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardContent className="p-8">
            {/* Amount Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {donationAmounts.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAmountSelect(option.value)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    selectedAmount === option.value && !isCustom
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {selectedAmount === option.value && !isCustom && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="text-2xl font-bold text-foreground">${option.value}</div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Or enter a custom amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => handleCustomInput(e.target.value)}
                  className="pl-8 h-12 text-lg"
                />
              </div>
            </div>

            {/* Impact Message */}
            {currentAmount > 0 && (
              <div className="mb-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <p className="text-foreground">
                    <span className="font-semibold">${currentAmount}</span> will{" "}
                    {donationAmounts.find(d => d.value === currentAmount)?.impact || 
                      `support our programs and help girls reach their potential`}
                  </p>
                </div>
              </div>
            )}

            {/* Donation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1 h-14 text-lg font-semibold">
                <Heart className="mr-2 w-5 h-5" />
                Donate ${currentAmount || "—"} Once
              </Button>
              <Button variant="outline" size="lg" className="flex-1 h-14 text-lg font-semibold">
                Donate ${currentAmount || "—"} Monthly
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Tax-deductible</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
