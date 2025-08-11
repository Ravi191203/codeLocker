"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { type Snippet } from "@/lib/data"

interface LanguageChartProps {
    data: Snippet[];
}

export function LanguageChart({ data }: LanguageChartProps) {
    const chartData = useMemo(() => {
        const languageCounts = data.reduce((acc, snippet) => {
            acc[snippet.language] = (acc[snippet.language] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(languageCounts)
            .map(([language, count]) => ({ language, count }))
            .sort((a, b) => b.count - a.count);
    }, [data]);

  const chartConfig = {
    count: {
      label: "Snippets",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
            data={chartData}
            layout="vertical"
            margin={{
                right: 20,
                left: 20,
                top: 20,
                bottom: 20
            }}
        >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <YAxis
                dataKey="language"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                className="capitalize"
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
