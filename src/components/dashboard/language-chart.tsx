"use client"

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

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

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 rounded-md bg-background/80 border border-border shadow-lg">
          <p className="font-semibold text-foreground capitalize">{data.name}</p>
          <p className="text-muted-foreground">{`Snippets: ${data.value}`}</p>
        </div>
      );
    }
  
    return null;
  };

export function LanguageChart({ data }: LanguageChartProps) {
  // recharts treemap needs `children` field for hierarchy, so we map `value` to `size`.
  const treemapData = data.map(item => ({...item, size: item.value}));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <Treemap
        data={treemapData}
        dataKey="size"
        ratio={4 / 3}
        stroke="hsl(var(--card))"
        fill="hsl(var(--muted))"
        content={<CustomizedContent colors={COLORS} />}
      >
         <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}

const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, rank, name, value } = props;
    const isLeaf = depth === 1;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: props.colors[index % props.colors.length],
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {isLeaf && (width > 50 && height > 25) ? (
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
            className="capitalize font-medium"
          >
            {name}
          </text>
        ) : null}
        {isLeaf && (width > 80 && height > 40) ? (
             <text
             x={x + 4}
             y={y + 18}
             fill="#fff"
             fontSize={12}
             fillOpacity={0.7}
           >
             {value} snippets
           </text>
        ): null}
      </g>
    );
};