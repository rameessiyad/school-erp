"use client";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  const monthLabel = today.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const weekday = today.toLocaleDateString("en-IN", { weekday: "long" });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{monthLabel}</p>
          <p className="text-xs text-slate-400">{weekday}</p>
        </div>

        <p className="text-3xl font-bold tracking-tight text-blue-600">
          {todayDate}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1.5 text-center">
        {WEEKDAYS.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="text-[11px] font-medium text-slate-400"
          >
            {d}
          </span>
        ))}

        {cells.map((day, i) =>
          day === null ? (
            <span key={`empty-${i}`} />
          ) : (
            <span
              key={day}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                day === todayDate
                  ? "bg-blue-600 font-semibold text-white"
                  : "text-slate-600"
              }`}
            >
              {day}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
