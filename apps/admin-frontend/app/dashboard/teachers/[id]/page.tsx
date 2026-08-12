"use client";

import { useParams, useRouter } from "next/navigation";
import { teachersApi } from "@/lib/api/teachers";
import { ArrowLeft, BookOpen, Pencil, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: teacher,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teacher", params.id],
    queryFn: () => teachersApi.get(params.id),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading Teacher...</p>;
  }

  if (isError || !teacher) {
    router.push("/dashboard/teachers");
    return null;
  }

  const fullName = `${teacher.firstName} ${teacher.lastName ?? ""}`.trim();
  const allocations = teacher.teacherSubjectAllocations ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Teachers</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Teacher Details
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View the teacher&apos;s admission and personal information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/teachers">
            <Button
              variant="outline"
              className="h-10 rounded-lg border-slate-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
            <Button className="h-10 rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700">
              <Pencil className="mr-2 h-4 w-4" />
              Edit teacher
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
            {teacher.photoUrl ? (
              <Image
                src={teacher.photoUrl}
                alt={`${teacher.firstName} ${teacher.lastName ?? ""}`}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700">
                {teacher.firstName.slice(0, 1).toUpperCase()}
                {teacher.lastName?.slice(0, 1).toUpperCase() ?? ""}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900">{fullName}</h2>
          </div>

          <span
            className={`sm:ml-auto inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
              teacher.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`mr-2 h-1.5 w-1.5 rounded-full ${
                teacher.isActive ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {teacher.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <UserRound className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Personal Information
              </h3>

              <p className="text-xs text-slate-500">
                Basic information about the teacher.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-400">Gender</p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {teacher.gender ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Date of Birth
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {teacher.dob ? new Date(teacher.dob).toLocaleDateString() : "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-400">Joining Date</p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {teacher.joiningDate
                  ? new Date(teacher.joiningDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* NEW: Subject Allocations section */}
        <div className="border-t border-slate-100 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Subject Allocations
              </h3>

              <p className="text-xs text-slate-500">
                Subjects, sections, and academic years assigned to this teacher.
              </p>
            </div>
          </div>

          {allocations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-5 py-8 text-center">
              <p className="text-sm font-medium text-slate-600">
                No allocations assigned
              </p>

              <p className="mt-1 text-xs text-slate-400">
                This teacher has no subject allocations yet.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      Subject
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      Class
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      Section
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      Academic Year
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocations.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {a.subject.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.section.class.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.section.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.academicYear.label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
