import * as React from "react"

import { cn } from "@/lib/utils"

type InputFeedback = "none" | "subtle"

function Input({
  className,
  type,
  feedback = "subtle",
  ...props
}: React.ComponentProps<"input"> & { feedback?: InputFeedback }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        feedback !== "none" && "motion-safe-base motion-focus-ring",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        feedback !== "none" &&
          "focus-visible:shadow-[0_0_0_4px_rgb(var(--color-focus-ring)/0.15)]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
