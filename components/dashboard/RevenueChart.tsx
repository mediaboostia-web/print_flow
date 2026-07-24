'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type ChartFilter = 'revenue' | 'orders' | 'bat';

interface ChartPoint {
  label: string;
  revenue: number;
  orders: number;
  bat: number;
}

interface RevenueChartProps {
  chartData: ChartPoint[];
  chartFilter: ChartFilter;
  hideFigures: boolean;
  chartMetricLabel: string;
  displayValue: (val: string) => string;
  formatChartValue: (v: number) => string;
}

export default function RevenueChart({
  chartData,
  chartFilter,
  hideFigures,
  chartMetricLabel,
  displayValue,
  formatChartValue,
}: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00B060" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#00B060" stopOpacity="0" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-slate-100 dark:stroke-slate-800/50" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: 'currentColor' }}
          className="text-text-secondary"
          padding={{ left: 12, right: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={44}
          tick={{ fontSize: 9, fill: 'currentColor' }}
          className="text-text-secondary"
          tickFormatter={(v: number) => (hideFigures ? '••' : chartFilter === 'bat' ? `${v}%` : chartFilter === 'revenue' ? `${Math.round(v / 1000)}k` : `${v}`)}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            const value = payload[0].value as number;
            return (
              <div className="rounded-xl bg-slate-900 dark:bg-slate-800 px-3.5 py-2.5 shadow-premium-lg">
                <p className="text-[9px] font-medium text-slate-400">{label} — {chartMetricLabel}</p>
                <p className="text-[11px] font-bold text-white">{displayValue(formatChartValue(value))}</p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey={chartFilter}
          stroke="#00B060"
          strokeWidth={3}
          fill="url(#chartGradient)"
          activeDot={{ r: 6, fill: '#00B060', stroke: '#FFFFFF', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
