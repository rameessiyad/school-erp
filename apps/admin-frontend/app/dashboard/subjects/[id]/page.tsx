"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Pencil, Users } from "lucide-react";

import { subjectsApi } from "@/lib/api/subjects";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/page-loader";
import { SubjectAllocationsTable } from "@/components/tables/subject-allocation-table";

export default function SubjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: subject,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subject", params.id, "details"],
    queryFn: () => subjectsApi.getDetails(params.id),
  });

  if (isLoading) {
    return <PageLoader text="Loading subject details..." />;
  }

  if (isError || !subject) {
    router.push("/dashboard/subjects");
    return null;
  }

  const allocations = subject.teacherAllocations ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Academics</p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Subject Details
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            View which classes and teachers are assigned to this subject.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/subjects">
            <Button
              variant="outline"
              className="h-10 rounded-lg border-border bg-surface px-4 text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <Link href={`/dashboard/subjects/${subject.id}/edit`}>
            <Button className="h-10 rounded-lg bg-primary px-5 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Subject
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex items-center gap-5 border-b border-border p-6 lg:px-8">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <BookOpen className="h-7 w-7" />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-text-primary">
              {subject.name}
            </h2>

            {subject.code && (
              <p className="mt-1 text-sm text-text-muted">
                Code:{" "}
                <span className="font-medium text-text-secondary">
                  {subject.code}
                </span>
              </p>
            )}
          </div>
        </div>

        <section className="p-6 lg:px-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
              <Users className="h-4 w-4 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold text-text-primary">
                Classes & Teachers
              </h3>

              <p className="text-xs text-text-muted">
                Every class, section, and teacher assigned to teach this
                subject.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <SubjectAllocationsTable allocations={allocations} />
          </div>
        </section>
      </div>
    </div>
  );
}
