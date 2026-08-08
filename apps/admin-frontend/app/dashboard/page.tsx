import {
  Users,
  GraduationCap,
  UserRound,
  Wallet,
  ArrowUpRight,
  Clock3,
} from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: "1,248",
    description: "Currently enrolled",
    icon: GraduationCap,
  },
  {
    title: "Teachers",
    value: "68",
    description: "Active teachers",
    icon: UserRound,
  },
  {
    title: "Parents",
    value: "1,102",
    description: "Registered parents",
    icon: Users,
  },
  {
    title: "Fees Collected",
    value: "₹8.42L",
    description: "This academic year",
    icon: Wallet,
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Overview</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back. Here&apos;s what&apos;s happening in your school.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
          <Clock3 className="h-4 w-4" />
          Academic Year 2026–27
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                View details
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Recent Activity</h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest updates from your school
              </p>
            </div>

            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <GraduationCap className="h-4 w-4" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  New student added
                </p>
                <p className="text-xs text-slate-500">
                  A new student was enrolled in Class 10-A
                </p>
              </div>

              <span className="text-xs text-slate-400">10 min ago</span>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Wallet className="h-4 w-4" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  Fee payment received
                </p>
                <p className="text-xs text-slate-500">
                  ₹12,500 fee payment recorded
                </p>
              </div>

              <span className="text-xs text-slate-400">1 hr ago</span>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <UserRound className="h-4 w-4" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  Teacher added
                </p>
                <p className="text-xs text-slate-500">
                  A new teacher joined the school
                </p>
              </div>

              <span className="text-xs text-slate-400">3 hrs ago</span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>

            <p className="mt-1 text-xs text-slate-500">
              Common administrative tasks
            </p>
          </div>

          <div className="space-y-2 p-4">
            <a
              href="/dashboard/students"
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Manage Students
                </span>
              </div>

              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </a>

            <a
              href="/dashboard/teachers"
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Manage Teachers
                </span>
              </div>

              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </a>

            <a
              href="/dashboard/fee-structures"
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50"
            >
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Fee Structure
                </span>
              </div>

              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
