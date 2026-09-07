"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, Pencil } from "lucide-react";
import { examApi } from "@/lib/api/exam";
import { ExamStatusBadge } from "@/components/exams/exam-status-badge";
import { PageLoader } from "@/components/common/page-loader";
import { Button } from "@/components/ui/button";

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: exam,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["exam", params.id],
    queryFn: () => examApi.get(params.id),
  });

  if (isError) {
    router.push("/dashboard/exams");
    return null;
  }

  if (isLoading || !exam) {
    return <PageLoader text="Loading exam..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/exams"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Exams
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              {exam.name}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {exam.academicYear?.label ?? "No academic year"}
            </p>
          </div>

          <Link href={`/dashboard/exams/${exam.id}/edit`}>
            <Button className="h-11 rounded-lg bg-primary px-5 font-medium text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Exam
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">Type</p>
          <p className="mt-2 text-lg font-semibold capitalize text-text-primary">
            {exam.examType.toLowerCase()}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">Status</p>
          <div className="mt-2">
            <ExamStatusBadge status={exam.status} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">Start Date</p>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            {new Date(exam.startDate).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-medium text-text-secondary">End Date</p>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            {new Date(exam.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
            <CalendarClock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Academic Year
            </p>
            <p className="text-xs text-text-muted">
              {exam.academicYear?.label ?? "Not assigned"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
