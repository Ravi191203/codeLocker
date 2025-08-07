"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [
    'hsl(var(--chart-1))', 
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
];

type LanguageChartProps = {
    data: { name: string, value: number }[];
}

export function LanguageChart({ data }: LanguageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart 
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis 
            type="category" 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tick={{ fill: 'hsl(var(--foreground))' }}
            tickLine={{ stroke: 'hsl(var(--foreground))' }}
            className="capitalize"
            width={80}
        />
        <Tooltip
            cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
            contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--foreground))"
            }}
        />
        <Bar dataKey="value" name="Snippets" barSize={20} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
