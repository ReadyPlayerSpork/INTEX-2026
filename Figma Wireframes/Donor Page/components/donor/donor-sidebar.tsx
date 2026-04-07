"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Heart,
  History,
  BookOpen,
  Settings,
  Gift,
} from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "My Impact", href: "/donor", active: true },
  { icon: History, label: "Donation History", href: "#" },
  { icon: BookOpen, label: "Impact Stories", href: "#" },
  { icon: Gift, label: "Give Again", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
]

export function DonorSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            CareConnect
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                item.active
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
            <p className="text-xs font-medium text-sidebar-foreground">
              Your generosity matters
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Every donation creates lasting change
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
