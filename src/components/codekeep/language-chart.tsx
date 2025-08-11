
"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis, LabelList } from "recharts"
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
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Show top 10 languages
    }, [data]);

    const chartConfig = useMemo(() => {
        const config: ChartConfig = {};
        chartData.forEach((item, index) => {
            config[item.language] = {
                label: item.language,
                color: `hsl(var(--chart-${(index % 5) + 1}))`,
            };
        });
        return config;
    }, [chartData]);


  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
            data={chartData}
            layout="vertical"
            margin={{
                right: 20,
                left: 10,
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
                width={80}
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="count" radius={4}>
                 <LabelList 
                    dataKey="count" 
                    position="right" 
                    offset={8}
                    className="fill-foreground font-semibold"
                    fontSize={12}
                />
                {chartData.map((entry) => (
                    <Bar key={entry.language} dataKey="count" fill={chartConfig[entry.language]?.color} />
                ))}
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
