"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 w-fit", className)}
      classNames={{
        /* Container */
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",

        /* Caption */
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",

        /* Navigation */
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),

        /* Grid */
        month_grid: "border-collapse space-x-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",

        /* Zelle (vormals `cell`) */
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.range_end)]:rounded-r-md [&:has(>.range_start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),

        /* Button (vormals `day`) */
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),

        /* Modifiers */
        range_start:
          "range_start aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_end:
          "range_end aria-selected:bg-primary aria-selected:text-primary-foreground",
        selected:
          "selected bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "today bg-accent text-accent-foreground",
        outside:
          "outside text-muted-foreground aria-selected:text-muted-foreground",
        disabled: "disabled text-muted-foreground opacity-50",
        range_middle:
          "range_middle aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "hidden invisible",

        /* ggf. zusätzliche Overrides */
        ...classNames,
      }}
      components={{
        /* Icon-API jetzt über „Chevron“ */
        Chevron: ({ orientation, className, ...props }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", className)} {...props} />
          ) : (
            <ChevronRight className={cn("size-4", className)} {...props} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }