"use client";

import { sectionsApi } from "@/lib/api/sections";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export default function SectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sectionDetails", params.id],
    queryFn: () => sectionsApi.getDetails(params.id),
  });

  if (isError) {
    router.push("/dashboard/sections");
    return null;
  }

  if (isLoading || !data) {
    return <p className="text-sm text-slate-400">Loading section details...</p>;
  }

  const { section, academicYear, classTeacher, students } = data;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">
          {section.class?.name ?? "Class"}
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Section {section.name}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {academicYear
            ? `Academic Year: ${academicYear.label}`
            : "No academic year configured"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Class Teacher</p>

          {classTeacher ? (
            <>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {classTeacher.firstName} {classTeacher.lastName ?? ""}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {classTeacher.email ?? classTeacher.phone ?? "No contact info"}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">
              No class teacher assigned
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Students</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {students.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Enrolled in this section for {academicYear?.label ?? "—"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Students</h2>

          <p className="mt-1 text-xs text-slate-500">
            All students enrolled in this section
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Roll No
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">Name</th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Admission No
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No students enrolled in this section yet.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr
                    key={s.enrollmentId}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4 text-slate-600">
                      {s.rollNo ?? "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-700">
                          {s.firstName.slice(0, 1).toUpperCase()}
                        </div>

                        <p className="font-medium text-slate-800">
                          {s.firstName} {s.lastName ?? ""}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {s.admissionNo}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          s.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
