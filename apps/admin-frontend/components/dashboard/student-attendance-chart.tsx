"use client";

import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AttendanceTrendItem {
  date: string;
  percentage: number | null;
}

interface StudentAttendanceChartProps {
  data: AttendanceTrendItem[];
}

export function StudentAttendanceChart({ data }: StudentAttendanceChartProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Student Attendance Trend
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Daily attendance % over the last 14 days.
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-soft text-success">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-6 h-55 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              dataKey="date"
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
              domain={[0, 100]}
              tick={{
                fontSize: 11,
                fill: "var(--text-secondary)",
              }}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip
              formatter={(value) => [
                value === null ? "Not marked" : `${value}%`,
                "Attendance",
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

            <Line
              type="monotone"
              dataKey="percentage"
              stroke="var(--success)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--success)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
