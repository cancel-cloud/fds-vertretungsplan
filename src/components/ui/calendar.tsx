"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { de } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { format } from "date-fns/format"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={de}
      navLayout="after"
      className={cn("p-3 w-fit", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",

        /* Caption: month label left, nav right */
        month_caption: "flex flex-col items-center gap-2",
        caption_label: "text-base font-semibold",

        /* Navigation buttons below month name */
        nav: "flex items-center justify-center gap-2",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-9 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-accent"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-9 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-accent"
        ),

        /* Calendar grid */
        month_grid: "border-collapse space-x-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",

        /* Day cells */
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
        ),

        /* Modifiers */
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        day_today: "bg-accent text-accent-foreground font-semibold rounded-md border-2 border-primary",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",

        /* User overrides */
        ...classNames,
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground font-semibold rounded-md border-2 border-primary hover:bg-accent hover:text-accent-foreground",
      }}
      components={{
        Chevron: ({ orientation, className, ...p }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-5", className)} {...p} />
          ) : (
            <ChevronRight className={cn("size-5", className)} {...p} />
          ),
      }}
      formatters={{
        formatCaption: (date, options) => {
          return format(date, "MMMM yyyy", { locale: options?.locale })
        }
      }}
      {...props}
    />
  )
}

export { Calendar }