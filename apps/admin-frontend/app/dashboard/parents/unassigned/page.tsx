"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
import { parentsApi } from "@/lib/api/parents";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import { PageLoader } from "@/components/common/page-loader";
import { UnassignedParentsTable } from "@/components/tables/unassigned-parents-list";

export default function UnassignedParentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: allParents = [], isLoading } = useQuery({
    queryKey: ["parents"],
    queryFn: parentsApi.list,
  });

  if (isLoading) {
    return <PageLoader text="Loading parents..." />;
  }

  const unassigned = allParents.filter(
    (p) => !p.parentStudents || p.parentStudents.length === 0,
  );

  const isSearching = debouncedSearch.length > 0;

  const filteredParents = isSearching
    ? unassigned.filter((p) => {
        const fullName = `${p.firstName} ${p.lastName ?? ""}`.toLowerCase();
        return (
          fullName.includes(debouncedSearch) ||
          (p.email ?? "").toLowerCase().includes(debouncedSearch) ||
          (p.phone ?? "").toLowerCase().includes(debouncedSearch)
        );
      })
    : unassigned;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/parents"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Parents
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Unassigned Parents
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          {unassigned.length} {unassigned.length === 1 ? "parent" : "parents"}{" "}
          not yet linked to a student.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, email or phone"
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

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <UnassignedParentsTable
          parents={filteredParents}
          isSearching={isSearching}
          searchTerm={searchInput}
        />
      </div>
    </div>
  );
}
