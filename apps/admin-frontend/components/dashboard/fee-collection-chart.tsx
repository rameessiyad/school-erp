"use client";

import { BarChart3 } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
} from "recharts";

interface FeeTrendItem {
  month: string;
  collected: number;
}

interface FeeCollectionChartProps {
  data: FeeTrendItem[];
}

function formatCurrency(amount: number) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }

  return `₹${amount}`;
}

export function FeeCollectionChart({ data }: FeeCollectionChartProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Fee Collection Trend
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Monthly fee collection for the academic year.
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <BarChart3 className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-6 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "var(--text-secondary)",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "var(--text-secondary)",
              }}
              tickFormatter={formatCurrency}
            />

            <Tooltip
              cursor={{
                fill: "var(--primary-soft)",
              }}
              formatter={(value) => [
                formatCurrency(Number(value)),
                "Collected",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text-primary)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              labelStyle={{
                color: "var(--text-primary)",
              }}
            />

            <Bar
              dataKey="collected"
              fill="var(--primary)"
              radius={[5, 5, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
