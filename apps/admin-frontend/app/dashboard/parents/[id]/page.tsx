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

  if (isError) {
    router.push("/dashboard/parents");
    return null;
  }

  if (isLoading || !parent) {
    return <p className="text-sm text-slate-400">Loading parent...</p>;
  }

  const fullName = `${parent.firstName} ${parent.lastName ?? ""}`.trim();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Parents</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Parent Details
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View the parent&apos;s personal information and student relation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/parents">
            <Button
              variant="outline"
              className="h-10 rounded-lg border-slate-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <Link href={`/dashboard/parents/${parent.id}/edit`}>
            <Button className="h-10 rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Parent
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
            {parent.firstName[0]?.toUpperCase()}
            {parent.lastName?.[0]?.toUpperCase() ?? ""}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900">{fullName}</h2>
          </div>
        </div>

        <div className="border-b border-slate-100 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <UserRound className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Personal Information
              </h3>

              <p className="text-xs text-slate-500">
                Basic information about the parent.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Mail className="h-3.5 w-3.5" />
                Email
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {parent.email ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {parent.phone ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Briefcase className="h-3.5 w-3.5" />
                Occupation
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {parent.occupation ?? "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <UserRound className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">Linked Students</h3>

              <p className="text-xs text-slate-500">
                Students this parent is connected to, and the relationship.
              </p>
            </div>
          </div>

          {!parent.parentStudents || parent.parentStudents.length === 0 ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm text-slate-500">No students linked yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {parent.parentStudents.map((ps) => (
                <div
                  key={ps.student.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {ps.student.firstName} {ps.student.lastName ?? ""}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {ps.relationship}
                    </p>
                  </div>

                  {ps.isPrimary && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
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
