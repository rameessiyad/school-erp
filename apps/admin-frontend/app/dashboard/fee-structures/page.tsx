"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, ChevronRight } from "lucide-react";
import { classesApi } from "@/lib/api/classes";
import { PageLoader } from "@/components/common/page-loader";

export default function FeeStructuresPage() {
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: classesApi.list,
  });

  if (isLoading) {
    return <PageLoader text="Loading classes..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Finance</p>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Fee Structures
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Select a class to view and manage its fee structures.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-16 text-center shadow-sm">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>

          <p className="font-medium text-text-primary">No classes yet</p>

          <p className="mt-1 text-sm text-text-secondary">
            Add a class first to set up its fee structures.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/fee-structures/class/${c.id}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold text-text-primary">{c.name}</p>

                  <p className="text-xs text-text-secondary">
                    {c.sections?.length ?? 0}{" "}
                    {c.sections?.length === 1 ? "section" : "sections"}
                  </p>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
