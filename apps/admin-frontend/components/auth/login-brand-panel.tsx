import { BarChart3, CheckCircle2, Users, Wallet } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Student records",
  },
  {
    icon: BarChart3,
    title: "Real-time insights",
  },
  {
    icon: Wallet,
    title: "Fee tracking",
  },
];

export function LoginBrandPanel() {
  return (
    <div className="relative hidden h-screen overflow-hidden bg-primary px-10 py-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-secondary/25 blur-3xl" />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Center glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 flex h-full flex-col justify-center">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl">
            Run your school,
            <br />
            <span className="text-primary-foreground/80">
              not your spreadsheets.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-6 text-primary-foreground/70 xl:text-base">
            One connected platform for admissions, attendance, academics,
            students, and fees — designed for modern school administration.
          </p>

          {/* Dashboard Preview */}
          <div className="relative mt-8 max-w-[470px]">
            {/* Floating status */}
            <div className="absolute -right-3 -top-5 z-20 hidden items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 shadow-xl backdrop-blur-xl xl:flex">
              <CheckCircle2 className="h-4 w-4" />

              <span className="text-xs font-medium">Everything in sync</span>
            </div>

            {/* Dashboard */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.095] p-4 shadow-2xl shadow-black/10 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-primary-foreground/50">
                    School overview
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    Academic dashboard
                  </p>
                </div>

                <div className="flex gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-white/10 bg-black/5 p-3">
                  <p className="text-[10px] text-primary-foreground/50">
                    Students
                  </p>

                  <p className="mt-1 text-lg font-semibold">1,248</p>

                  <p className="mt-0.5 text-[10px] text-primary-foreground/50">
                    +8.2% this year
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/5 p-3">
                  <p className="text-[10px] text-primary-foreground/50">
                    Attendance
                  </p>

                  <p className="mt-1 text-lg font-semibold">94.8%</p>

                  <p className="mt-0.5 text-[10px] text-primary-foreground/50">
                    This month
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/5 p-3">
                  <p className="text-[10px] text-primary-foreground/50">Fees</p>

                  <p className="mt-1 text-lg font-semibold">86%</p>

                  <p className="mt-0.5 text-[10px] text-primary-foreground/50">
                    Collected
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="mt-3 rounded-xl border border-white/10 bg-black/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-primary-foreground/50">
                    Attendance overview
                  </p>

                  <p className="text-[10px] font-medium">Last 6 months</p>
                </div>

                <div className="mt-4 flex h-16 items-end gap-2">
                  {[42, 58, 48, 72, 64, 84, 76, 92, 86, 96].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-sm bg-white/20 transition-all duration-500 hover:bg-white/35"
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {features.map(({ icon: Icon, title }) => (
              <div
                key={title}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-primary-foreground/70" />

                <span className="text-[11px] font-medium text-primary-foreground/75">
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-xs text-primary-foreground/45">
          Trusted by schools to manage day-to-day operations.
        </p>

        <div className="hidden items-center gap-1.5 text-[10px] text-primary-foreground/40 xl:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          Secure platform
        </div>
      </div>
    </div>
  );
}
