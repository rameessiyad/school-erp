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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          School Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />

            <Bar
              dataKey="count"
              name="Count"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
              barSize={55}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
