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
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {monthLabel}
          </p>
          <p className="text-xs text-text-muted">{weekday}</p>
        </div>

        <p className="text-3xl font-bold tracking-tight text-primary">
          {todayDate}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1.5 text-center">
        {WEEKDAYS.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="text-[11px] font-medium text-text-muted"
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
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-text-secondary"
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
