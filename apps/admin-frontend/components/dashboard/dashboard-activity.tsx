import {
  GraduationCap,
  ReceiptText,
  UserRound,
  CalendarDays,
  FileText,
} from "lucide-react";

interface RecentActivity {
  id: string;
  type: "student" | "teacher" | "fee";
  title: string;
  description: string;
  createdAt: string;
}

interface UpcomingFeeItem {
  id: string;
  title: string;
  studentCount: number;
  pendingAmount: number;
  date: string;
}

interface UpcomingExamItem {
  id: string;
  title: string;
  examTypeName: string;
  date: string;
}

interface DashboardActivityProps {
  recentActivities: RecentActivity[];
  upcomingFees: UpcomingFeeItem[];
  upcomingExams: UpcomingExamItem[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatCurrency(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getActivityIcon(type: RecentActivity["type"]) {
  if (type === "student") return GraduationCap;
  if (type === "teacher") return UserRound;
  return ReceiptText;
}

export function DashboardActivity({
  recentActivities,
  upcomingFees,
  upcomingExams,
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

      {/* Upcoming — Fees + Exams stacked in one card */}
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Upcoming Tuition Fee Dues
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Grouped by term — not per student.
            </p>
          </div>

          {upcomingFees.length === 0 ? (
            <div className="flex h-24 items-center justify-center">
              <p className="text-sm text-text-muted">No upcoming dues.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {upcomingFees.map((item) => (
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
                      {item.studentCount} student
                      {item.studentCount === 1 ? "" : "s"} ·{" "}
                      {formatCurrency(item.pendingAmount)} pending
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

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Upcoming Examinations
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Scheduled exams for this academic year.
            </p>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="flex h-24 items-center justify-center">
              <p className="text-sm text-text-muted">No upcoming exams.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary shadow-sm">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {exam.title}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {exam.examTypeName}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-primary">
                    {formatDate(exam.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
