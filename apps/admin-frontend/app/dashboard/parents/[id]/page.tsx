"use client";

import { Button } from "@/components/ui/button";
import { parentsApi } from "@/lib/api/parents";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  Pencil,
  Star,
  UserRound,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ParentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: parent,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["parent", params.id],
    queryFn: () => parentsApi.get(params.id),
  });

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading Parent...</p>;
  }

  if (isError || !parent) {
    router.push("/dashboard/parents");
    return null;
  }

  const fullName = `${parent.firstName} ${parent.lastName ?? ""}`.trim();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Parents</p>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Parent Details
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            View the parent&apos;s personal information and student relation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/parents">
            <Button variant="outline" className="h-10 rounded-lg border-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <Link href={`/dashboard/parents/${parent.id}/edit`}>
            <Button className="h-10 rounded-lg bg-primary px-5 text-primary-foreground hover:bg-primary-hover">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Parent
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-bold text-primary">
            {parent.firstName[0]?.toUpperCase()}
            {parent.lastName?.[0]?.toUpperCase() ?? ""}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-text-primary">
              {fullName}
            </h2>
          </div>
        </div>

        <div className="border-b border-border p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
              <UserRound className="h-4 w-4 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold text-text-primary">
                Personal Information
              </h3>

              <p className="text-xs text-text-secondary">
                Basic information about the parent.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <Mail className="h-3.5 w-3.5" />
                Email
              </p>

              <p className="mt-2 text-sm font-medium text-text-primary">
                {parent.email ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </p>

              <p className="mt-2 text-sm font-medium text-text-primary">
                {parent.phone ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <Briefcase className="h-3.5 w-3.5" />
                Occupation
              </p>

              <p className="mt-2 text-sm font-medium text-text-primary">
                {parent.occupation ?? "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold text-text-primary">
                Linked Students
              </h3>

              <p className="text-xs text-text-secondary">
                Students this parent is connected to, and the relationship.
              </p>
            </div>
          </div>

          {!parent.parentStudents || parent.parentStudents.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface-secondary/50 p-4">
              <p className="text-sm text-text-secondary">
                No students linked yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {parent.parentStudents.map((ps) => (
                <div
                  key={ps.student.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary/50 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {ps.student.firstName} {ps.student.lastName ?? ""}
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      {ps.relationship}
                    </p>
                  </div>

                  {ps.isPrimary && (
                    <span className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
                      <Star className="h-3 w-3 fill-success text-success" />
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
