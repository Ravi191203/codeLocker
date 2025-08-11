"use client"

import { useMemo } from "react"
import { type Snippet } from "@/lib/data"
import { addDays, format, startOfYear, getDay } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ActivityCalendarProps {
  data: Snippet[]
}

export function ActivityCalendar({ data }: ActivityCalendarProps) {
  const activityData = useMemo(() => {
    const counts: { [key: string]: number } = {}
    data.forEach(snippet => {
      const dateKey = format(new Date(snippet.createdAt), "yyyy-MM-dd")
      counts[dateKey] = (counts[dateKey] || 0) + 1
    })

    const today = new Date()
    const startDate = startOfYear(today)
    const days = []
    
    // Add offset for the first day of the year
    const startDayOfWeek = getDay(startDate)
    for(let i = 0; i < startDayOfWeek; i++) {
        days.push({ date: null, count: 0 });
    }

    for (let i = 0; i < 365; i++) {
      const currentDate = addDays(startDate, i)
      if (currentDate > today) break

      const dateKey = format(currentDate, "yyyy-MM-dd")
      days.push({
        date: dateKey,
        count: counts[dateKey] || 0,
      })
    }
    return days
  }, [data])

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/50"
    if (count <= 1) return "bg-accent/40"
    if (count <= 3) return "bg-accent/60"
    if (count <= 5) return "bg-accent/80"
    return "bg-accent"
  }
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const months = useMemo(() => {
    const monthLabels: { name: string; startColumn: number }[] = []
    let lastMonth = -1
    const today = new Date()
    const startDate = startOfYear(today)
    const startDayOfWeek = getDay(startDate)

    for (let i = 0; i < 365; i++) {
        const currentDate = addDays(startDate, i)
        if (currentDate > today) break
        const month = currentDate.getMonth()
        if (month !== lastMonth) {
            const week = Math.floor((i + startDayOfWeek) / 7)
            monthLabels.push({
                name: format(currentDate, 'MMM'),
                startColumn: week
            })
            lastMonth = month
        }
    }
    return monthLabels
  }, [])

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        <div className="grid grid-flow-col grid-rows-7 grid-cols-[repeat(53,16px)] gap-1">
          {activityData.map((day, index) =>
            day.date ? (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`w-4 h-4 rounded-sm ${getColor(day.count)}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{day.count} snippets on {format(new Date(day.date), "MMMM d, yyyy")}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={index} className="w-4 h-4" />
            )
          )}
        </div>
         <div className="flex justify-between text-xs text-muted-foreground ml-3">
          {months.map((month, index) => (
            <div key={index} style={{ gridColumnStart: month.startColumn + 1 }}>
              {month.name}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}