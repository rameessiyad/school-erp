// components/ui/date-picker.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";

interface DatePickerProps {
  value?: string; // "yyyy-MM-dd"
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/* -------------------------------------------------------------------------- */
/* Themed Year Dropdown (replaces native <select>)                            */
/* -------------------------------------------------------------------------- */

function YearDropdown({
  value,
  years,
  onSelect,
}: {
  value: number;
  years: number[];
  onSelect: (year: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center" });
    }
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-text-primary transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {value}
        <ChevronLeft className="h-3 w-3 -rotate-90 text-text-muted" />
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute left-0 top-full z-50 mt-1 max-h-52 w-20 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg scrollbar-thin"
        >
          {years.map((y) => {
            const isActive = y === value;
            return (
              <button
                key={y}
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => {
                  onSelect(y);
                  setOpen(false);
                }}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-text-primary hover:bg-primary-soft"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main DatePicker                                                            */
/* -------------------------------------------------------------------------- */

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate = new Date(new Date().getFullYear() - 100, 0, 1),
  maxDate = new Date(),
  disabled = false,
  className = "",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

  const [viewYear, setViewYear] = useState(
    selectedDate ? selectedDate.getFullYear() : maxDate.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate ? selectedDate.getMonth() : maxDate.getMonth(),
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function openCalendar() {
    if (disabled) return;
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
    setOpen((prev) => !prev);
  }

  function goPrevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function goNextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  function isDisabled(date: Date) {
    return date < minDate || date > maxDate;
  }

  function selectDay(day: number) {
    const picked = new Date(viewYear, viewMonth, day);
    if (isDisabled(picked)) return;
    onChange(format(picked, "yyyy-MM-dd"));
    setOpen(false);
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const years: number[] = [];
  for (let y = maxDate.getFullYear(); y >= minDate.getFullYear(); y--)
    years.push(y);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={openCalendar}
        className={`h-11 w-full flex items-center justify-between rounded-lg border border-border bg-surface px-3 text-sm font-normal shadow-none transition hover:bg-surface-secondary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 ${
          selectedDate ? "text-text-primary" : "text-text-muted"
        }`}
      >
        {selectedDate ? format(selectedDate, "dd MMM yyyy") : placeholder}
        <CalendarIcon className="h-4 w-4 text-text-muted" />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="rounded-md border border-border bg-surface px-1.5 py-1 text-xs font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>

              <YearDropdown
                value={viewYear}
                years={years}
                onSelect={setViewYear}
              />
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="flex h-7 items-center justify-center text-[11px] font-medium text-text-muted"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;

              const cellDate = new Date(viewYear, viewMonth, day);
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === day;
              const isToday =
                new Date().toDateString() === cellDate.toDateString();
              const disabledDay = isDisabled(cellDate);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => selectDay(day)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition
                    ${isSelected ? "bg-primary text-primary-foreground" : "text-text-primary hover:bg-primary-soft"}
                    ${!isSelected && isToday ? "border border-primary/40" : ""}
                    ${disabledDay ? "cursor-not-allowed opacity-30 hover:bg-transparent" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
