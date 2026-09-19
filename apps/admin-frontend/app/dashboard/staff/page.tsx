"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { staffApi } from "@/lib/api/staff";
import { StaffTable } from "@/components/tables/staff-table";
import { PageLoader } from "@/components/common/page-loader";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";

type StatusFilter = "all" | "active" | "inactive";

export default function StaffPage() {
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: staffApi.list,
  });

  if (isLoading) {
    return <PageLoader text="Loading staff..." />;
  }

  const isSearching = debouncedSearch.length > 0;

  const filteredStaff = staff
    .filter((s) => {
      if (statusFilter === "active") return s.isActive;
      if (statusFilter === "inactive") return !s.isActive;
      return true;
    })
    .filter((s) => {
      if (!isSearching) return true;
      const fullName = `${s.firstName} ${s.lastName ?? ""}`.toLowerCase();
      return (
        fullName.includes(debouncedSearch) ||
        s.email?.toLowerCase().includes(debouncedSearch) ||
        s.designation?.name.toLowerCase().includes(debouncedSearch)
      );
    });

  const statCards: {
    key: StatusFilter;
    label: string;
    value: number;
  }[] = [
    { key: "all", label: "Total Staff", value: staff.length },
    {
      key: "active",
      label: "Active Staff",
      value: staff.filter((s) => s.isActive).length,
    },
    {
      key: "inactive",
      label: "Inactive Staff",
      value: staff.filter((s) => !s.isActive).length,
    },
  ];

  const headerLabel =
    statusFilter === "active"
      ? "Active Staff"
      : statusFilter === "inactive"
        ? "Inactive Staff"
        : "All Staff";

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Administration
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Staff
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Manage your school&apos;s administrative and support staff.
          </p>
        </div>

        <Link
          href="/dashboard/staff/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
        >
          + Add Staff
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email or designation"
          className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-10 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => {
          const isActive = statusFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setStatusFilter(card.key)}
              className={`rounded-xl border p-5 text-left shadow-sm transition ${
                isActive
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-surface hover:bg-surface-secondary"
              }`}
            >
              <p className="text-sm font-medium text-text-secondary">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
                {card.value}
              </p>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-text-primary">
              {isSearching ? "Matching Staff" : headerLabel}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {isSearching
                ? `Staff whose name, email or designation match "${searchInput}".`
                : statusFilter === "all"
                  ? "View and manage staff members"
                  : `Showing only ${statusFilter} staff.`}
            </p>
          </div>

          <span className="text-sm text-text-muted">
            {filteredStaff.length}{" "}
            {filteredStaff.length === 1 ? "member" : "members"}
          </span>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-muted">
              {isSearching
                ? `No staff match "${searchInput}".`
                : `No ${statusFilter} staff found.`}
            </p>
          </div>
        ) : (
          <StaffTable staff={filteredStaff} />
        )}
      </div>
    </div>
  );
}
