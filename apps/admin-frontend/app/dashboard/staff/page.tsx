"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { staffApi } from "@/lib/api/staff";
import { StaffTable } from "@/components/tables/staff-table";
import { PageLoader } from "@/components/common/page-loader";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";

export default function StaffPage() {
  const [searchInput, setSearchInput] = useState("");
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

  const filteredStaff = isSearching
    ? staff.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName ?? ""}`.toLowerCase();
        return (
          fullName.includes(debouncedSearch) ||
          s.email?.toLowerCase().includes(debouncedSearch) ||
          s.designation.toLowerCase().includes(debouncedSearch)
        );
      })
    : staff;

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

      {!isSearching && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-text-secondary">
              Total Staff
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {staff.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-text-secondary">
              Active Staff
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {staff.filter((s) => s.isActive).length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-text-secondary">
              Inactive Staff
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
              {staff.filter((s) => !s.isActive).length}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-text-primary">
              {isSearching ? "Matching Staff" : "All Staff"}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {isSearching
                ? `Staff whose name, email or designation match "${searchInput}".`
                : "View and manage staff members"}
            </p>
          </div>

          <span className="text-sm text-text-muted">
            {filteredStaff.length}{" "}
            {filteredStaff.length === 1 ? "member" : "members"}
          </span>
        </div>

        {isSearching && filteredStaff.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-muted">
              No staff match &quot;{searchInput}&quot;.
            </p>
          </div>
        ) : (
          <StaffTable staff={filteredStaff} />
        )}
      </div>
    </div>
  );
}
