"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
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
  date: string;
  percentage: number | null;
}

type ChartType = "fee" | "attendance";
export type FilterOption = "week" | "month" | "year";

interface DashboardChartProps {
  feeData: FeeTrendItem[];
  attendanceData: AttendanceTrendItem[];
  allowedCharts?: ChartType[];
  filterBy: FilterOption;
  onFilterChange: (value: FilterOption) => void;
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

const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "fee", label: "Fee Collection Chart" },
  { value: "attendance", label: "Student Attendance Chart" },
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "week", label: "Filter by Week" },
  { value: "month", label: "Filter by Month" },
  { value: "year", label: "Filter by Year" },
];

function formatCurrency(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

function normalizeToFullYear(data: FeeTrendItem[]): FeeTrendItem[] {
  return MONTHS.map((month) => {
    const match = data.find((d) =>
      d.month.toLowerCase().startsWith(month.toLowerCase()),
    );
    return { month, collected: match?.collected ?? 0 };
  });
}

export function DashboardChart({
  feeData,
  attendanceData,
  allowedCharts = ["fee", "attendance"],
  filterBy,
  onFilterChange,
}: DashboardChartProps) {
  const chartOptions = CHART_OPTIONS.filter((c) =>
    allowedCharts.includes(c.value),
  );

  const [chartType, setChartType] = useState<ChartType>(
    chartOptions[0]?.value ?? "fee",
  );
  // filterBy is now controlled by the parent (page.tsx) — removed local state
  const [chartMenuOpen, setChartMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const chartMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        chartMenuRef.current &&
        !chartMenuRef.current.contains(e.target as Node)
      ) {
        setChartMenuOpen(false);
      }
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(e.target as Node)
      ) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeChartLabel = chartOptions.find(
    (c) => c.value === chartType,
  )?.label;
  const activeFilterLabel = FILTER_OPTIONS.find(
    (f) => f.value === filterBy,
  )?.label;
  const normalizedFeeData = normalizeToFullYear(feeData);

  return (
    <div className="rounded-xl border h-full border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start flex-row-reverse justify-between gap-3">
        {/* Filter by — left end */}
        <div className="relative" ref={filterMenuRef}>
          <button
            type="button"
            onClick={() => setFilterMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:border-primary/40 hover:text-text-primary"
          >
            <Filter className="h-3.5 w-3.5" />
            {activeFilterLabel}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {filterMenuOpen && (
            <div className="absolute left-0 z-10 mt-1.5 w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-md">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onFilterChange(option.value);
                    setFilterMenuOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-xs transition hover:bg-primary-soft ${
                    filterBy === option.value
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

        {/* Chart title + type switcher — right end */}
        <div className="relative text-right" ref={chartMenuRef}>
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
            <div className="absolute right-0 z-10 mt-1.5 w-52 overflow-hidden rounded-lg border border-border bg-surface shadow-md">
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
          : "Daily attendance % over the last 14 days."}
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
              data={attendanceData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
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
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
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
