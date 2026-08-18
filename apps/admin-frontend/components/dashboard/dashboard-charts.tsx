"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardChartsProps {
  studentCount: number;
  teacherCount: number;
  parentCount: number;
}

export function DashboardCharts({
  studentCount,
  teacherCount,
  parentCount,
}: DashboardChartsProps) {
  const data = [
    {
      name: "Students",
      count: studentCount,
    },
    {
      name: "Teachers",
      count: teacherCount,
    },
    {
      name: "Parents",
      count: parentCount,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-text-primary">
          School Overview
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Overview of students, teachers and parents.
        </p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
            />

            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
            />

            <Tooltip
              cursor={{ fill: "var(--primary-soft)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text-primary)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: "var(--text-primary)" }}
              itemStyle={{ color: "var(--text-secondary)" }}
            />

            <Bar
              dataKey="count"
              name="Count"
              fill="var(--primary)"
              radius={[6, 6, 0, 0]}
              barSize={55}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
