"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { announcementApi } from "@/lib/api/announcement";
import { AnnouncementTable } from "@/components/tables/announcement-table";
import { PageLoader } from "@/components/common/page-loader";
import { useDebouncedValue } from "@/hooks/use-debounzed-values";
import {
  ANNOUNCEMENT_CATEGORIES,
  AnnouncementCategory,
  CATEGORY_LABELS,
} from "@/lib/validations/announcement";

type CategoryFilter = "all" | AnnouncementCategory;

export default function AnnouncementsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const debouncedSearch = useDebouncedValue(searchInput, 250)
    .trim()
    .toLowerCase();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: announcementApi.list,
  });

  if (isLoading) {
    return <PageLoader text="Loading announcements..." />;
  }

  const isSearching = debouncedSearch.length > 0;

  const filtered = announcements
    .filter((a) => categoryFilter === "all" || a.category === categoryFilter)
    .filter((a) => {
      if (!isSearching) return true;
      return (
        a.title.toLowerCase().includes(debouncedSearch) ||
        a.content.toLowerCase().includes(debouncedSearch)
      );
    });

  const filters: { key: CategoryFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: announcements.length },
    ...ANNOUNCEMENT_CATEGORIES.map((c) => ({
      key: c as CategoryFilter,
      label: CATEGORY_LABELS[c],
      count: announcements.filter((a) => a.category === c).length,
    })),
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Administration
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Announcements
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Publish notices, holidays and exam updates. Expired announcements
            are removed automatically.
          </p>
        </div>

        <Link
          href="/dashboard/announcements/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
        >
          + New Announcement
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title or message"
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

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = categoryFilter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setCategoryFilter(f.key)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                  : "border-border bg-surface text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs text-text-muted">{f.count}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-text-primary">
              {isSearching
                ? "Matching Announcements"
                : categoryFilter === "all"
                  ? "Active Announcements"
                  : CATEGORY_LABELS[categoryFilter]}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {isSearching
                ? `Announcements matching "${searchInput}".`
                : "Only unexpired announcements are shown."}
            </p>
          </div>

          <span className="text-sm text-text-muted">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-muted">
              {isSearching
                ? `No announcements match "${searchInput}".`
                : "No announcements found."}
            </p>
          </div>
        ) : (
          <AnnouncementTable announcements={filtered} />
        )}
      </div>
    </div>
  );
}
