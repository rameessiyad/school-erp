import { Wallet } from "lucide-react";

interface FeeOverviewProps {
  collected: number;
  pending: number;
  percentage: number;
}

function formatCurrency(amount: number) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

export function FeeOverview({
  collected,
  pending,
  percentage,
}: FeeOverviewProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Wallet className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Fee Overview
          </h2>

          <p className="text-xs text-text-muted">Current academic year</p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-xs font-medium text-text-muted">Collected</p>

          <p className="mt-1 text-2xl font-bold text-text-primary">
            {formatCurrency(collected)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-text-muted">Pending</p>

          <p className="mt-1 text-2xl font-bold text-text-primary">
            {formatCurrency(pending)}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">
            Collection progress
          </span>

          <span className="text-sm font-semibold text-primary">
            {percentage}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-surface-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${Math.min(Math.max(percentage, 0), 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
