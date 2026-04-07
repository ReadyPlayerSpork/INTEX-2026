import { Button } from "@/components/ui/button"
import { UserPlus, HandHeart, ClipboardList } from "lucide-react"

const actions = [
  {
    label: "Add Resident",
    icon: UserPlus,
    variant: "default" as const,
  },
  {
    label: "Add Donation",
    icon: HandHeart,
    variant: "outline" as const,
  },
  {
    label: "Log Session",
    icon: ClipboardList,
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button key={action.label} variant={action.variant} className="gap-2">
          <action.icon className="h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  )
}
