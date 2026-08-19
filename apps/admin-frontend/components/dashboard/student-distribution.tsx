import { GraduationCap } from "lucide-react";

interface StudentDistributionItem {
  className: string;
  count: number;
}

interface StudentDistributionProps {
  data: StudentDistributionItem[];
}

export function StudentDistribution({ data }: StudentDistributionProps) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <GraduationCap className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Student Distribution
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Number of enrolled students in each class.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-text-muted">
            No student enrollment data available.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map((item) => {
            const percentage = (item.count / maxCount) * 100;

            return (
              <div key={item.className}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">
                    {item.className}
                  </span>

                  <span className="text-xs font-semibold text-text-primary">
                    {item.count}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
