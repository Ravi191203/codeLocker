
"use client"

import { useMemo } from "react"
import { type Snippet } from "@/lib/data"
import { addDays, format, startOfYear, getDay, endOfYear } from "date-fns"
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
    const endDate = endOfYear(today)
    const days = []
    
    // Add offset for the first day of the year
    const startDayOfWeek = getDay(startDate)
    for(let i = 0; i < startDayOfWeek; i++) {
        days.push({ date: null, count: 0, key: `empty-${i}` });
    }

    let currentDate = startDate;
    while(currentDate <= endDate) {
      const dateKey = format(currentDate, "yyyy-MM-dd")
      days.push({
        date: dateKey,
        count: counts[dateKey] || 0,
        key: dateKey
      })
      currentDate = addDays(currentDate, 1);
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
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const months = useMemo(() => {
    const monthLabels: { name: string; startColumn: number }[] = []
    let lastMonth = -1
    const startDate = startOfYear(new Date())
    const startDayOfWeek = getDay(startDate)

    for (let i = 0; i < 366; i++) { // Use 366 for leap years
        const currentDate = addDays(startDate, i)
        if (currentDate.getFullYear() !== startDate.getFullYear()) break;
        
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
      <div className="flex flex-col items-center gap-3">
        <div className="grid grid-flow-col grid-rows-7 gap-1 self-start">
          {activityData.map((day, index) =>
            day.date ? (
              <Tooltip key={day.key}>
                <TooltipTrigger asChild>
                  <div
                    className={`w-3.5 h-3.5 rounded-sm sm:w-4 sm:h-4`}
                    style={{ backgroundColor: format(new Date(day.date), "yyyy-MM-dd") > format(new Date(), "yyyy-MM-dd") ? 'transparent' : getColor(day.count)}}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{day.count} snippets on {format(new Date(day.date), "MMMM d, yyyy")}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={day.key} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )
          )}
        </div>
         <div className="w-full flex justify-between text-xs text-muted-foreground px-1">
            {months.map(month => (
                <div key={month.name}>{month.name}</div>
            ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
