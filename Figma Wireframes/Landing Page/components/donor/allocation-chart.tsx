"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const allocationData = [
  { name: "Housing Support", value: 4500, color: "var(--color-primary)" },
  { name: "Food Programs", value: 3200, color: "var(--color-chart-2)" },
  { name: "Education", value: 2100, color: "var(--color-chart-3)" },
  { name: "Healthcare", value: 1650, color: "var(--color-chart-4)" },
  { name: "Emergency Aid", value: 1000, color: "var(--color-chart-5)" },
]

export function AllocationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Where Your Donations Go
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Allocation of your total contributions
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "var(--color-foreground)" }}
                labelStyle={{ color: "var(--color-foreground)", fontWeight: 600 }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-3">
          {allocationData.slice(0, 3).map((item) => (
            <div key={item.name} className="text-center">
              <p className="text-lg font-semibold text-foreground">
                ${item.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{item.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
