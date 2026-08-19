import {
  GraduationCap,
  ReceiptText,
  UserRound,
  CalendarDays,
} from "lucide-react";

interface RecentActivity {
  id: string;
  type: "student" | "teacher" | "fee";
  title: string;
  description: string;
  createdAt: string;
}

interface UpcomingItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface DashboardActivityProps {
  recentActivities: RecentActivity[];
  upcomingItems: UpcomingItem[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function getActivityIcon(type: RecentActivity["type"]) {
  if (type === "student") {
    return GraduationCap;
  }

  if (type === "teacher") {
    return UserRound;
  }

  return ReceiptText;
}

export function DashboardActivity({
  recentActivities,
  upcomingItems,
}: DashboardActivityProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Latest activity in your school.
          </p>
        </div>

        {recentActivities.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-text-muted">No recent activity.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {recentActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);

              return (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {activity.title}
                    </p>

                    <p className="truncate text-xs text-text-muted">
                      {activity.description}
                    </p>
                  </div>

                  <span className="shrink-0 text-[11px] text-text-muted">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Upcoming
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Upcoming fee due dates.
          </p>
        </div>

        {upcomingItems.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-text-muted">Nothing upcoming.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {upcomingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-sm">
                  <CalendarDays className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {item.title}
                  </p>

                  <p className="truncate text-xs text-text-muted">
                    {item.description}
                  </p>
                </div>

                <span className="shrink-0 text-xs font-medium text-primary">
                  {formatDate(item.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
