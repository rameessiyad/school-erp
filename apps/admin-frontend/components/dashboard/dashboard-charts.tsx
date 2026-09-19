"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface FeeTrendItem {
  month: string;
  collected: number;
}

interface AttendanceTrendItem {
  month: string;
  percentage: number | null;
}

type ChartType = "fee" | "attendance";

interface DashboardChartProps {
  feeData: FeeTrendItem[];
  attendanceData: AttendanceTrendItem[];
  allowedCharts?: ChartType[];
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FEE_Y_TICKS = [30000, 60000, 90000, 120000];
const ATTENDANCE_Y_TICKS = [0, 25, 50, 75, 100];

const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "fee", label: "Fee Collection Chart" },
  { value: "attendance", label: "Student Attendance Chart" },
];

function formatCurrency(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

function normalizeFeeToFullYear(data: FeeTrendItem[]): FeeTrendItem[] {
  return MONTHS.map((month) => {
    const match = data.find((d) =>
      d.month.toLowerCase().startsWith(month.toLowerCase()),
    );
    return { month, collected: match?.collected ?? 0 };
  });
}

function normalizeAttendanceToFullYear(
  data: AttendanceTrendItem[],
): AttendanceTrendItem[] {
  return MONTHS.map((month) => {
    const match = data.find((d) =>
      d?.month?.toLowerCase().startsWith(month.toLowerCase()),
    );
    return { month, percentage: match?.percentage ?? null };
  });
}

export function DashboardChart({
  feeData,
  attendanceData,
  allowedCharts = ["fee", "attendance"],
}: DashboardChartProps) {
  const chartOptions = CHART_OPTIONS.filter((c) =>
    allowedCharts.includes(c.value),
  );

  const [chartType, setChartType] = useState<ChartType>(
    chartOptions[0]?.value ?? "fee",
  );
  const [chartMenuOpen, setChartMenuOpen] = useState(false);
  const chartMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        chartMenuRef.current &&
        !chartMenuRef.current.contains(e.target as Node)
      ) {
        setChartMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeChartLabel = chartOptions.find(
    (c) => c.value === chartType,
  )?.label;
  const normalizedFeeData = normalizeFeeToFullYear(feeData);
  const normalizedAttendanceData =
    normalizeAttendanceToFullYear(attendanceData);

  return (
    <div className="rounded-xl border h-full border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="relative" ref={chartMenuRef}>
          <button
            type="button"
            onClick={() => setChartMenuOpen((v) => !v)}
            className="flex items-center gap-1.5"
          >
            <h2 className="text-base font-semibold text-text-primary">
              {activeChartLabel}
            </h2>
            <ChevronDown className="h-4 w-4 text-text-secondary cursor-pointer" />
          </button>

          {chartMenuOpen && (
            <div className="absolute left-0 z-10 mt-1.5 w-52 overflow-hidden rounded-lg border border-border bg-surface shadow-md">
              {chartOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setChartType(option.value);
                    setChartMenuOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left cursor-pointer text-sm transition hover:bg-primary-soft ${
                    chartType === option.value
                      ? "font-medium text-primary"
                      : "text-text-secondary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-1 text-sm text-text-secondary">
        {chartType === "fee"
          ? "Monthly fee collection for the academic year."
          : "Monthly attendance % for the academic year."}
      </p>

      <div className="mt-6 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "fee" ? (
            <BarChart
              data={normalizedFeeData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
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
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 120000]}
                ticks={FEE_Y_TICKS}
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                cursor={{ fill: "var(--primary-soft)" }}
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
                labelStyle={{ color: "var(--text-primary)" }}
              />
              <Bar
                dataKey="collected"
                fill="var(--primary)"
                radius={[5, 5, 0, 0]}
                barSize={30}
              />
            </BarChart>
          ) : (
            <LineChart
              data={normalizedAttendanceData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                ticks={ATTENDANCE_Y_TICKS}
                width={35}
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
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
                labelStyle={{ color: "var(--text-primary)" }}
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
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
