import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-background ring-offset-background placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-24 w-full rounded-lg border px-3 py-2 text-sm transition-[color,box-shadow,border-color] outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/18 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
