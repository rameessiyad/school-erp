"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { parentsApi } from "@/lib/api/parents";
import { ParentRowActions } from "@/components/parents/parent-row-actions";

export default function ParentsPage() {
  const { data: parents = [], isLoading } = useQuery({
    queryKey: ["parents"],
    queryFn: parentsApi.list,
  });

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading parents...</p>;
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">People</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Parents
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage parents and their linked students.
          </p>
        </div>

        <Link
          href="/dashboard/parents/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Parent
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Parents</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {parents.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Linked Parents</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {
              parents.filter(
                (p) => p.parentStudents && p.parentStudents.length > 0,
              ).length
            }
          </p>
        </div>
      </div>

      {/* Parents Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Parent Directory
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            A list of parents registered in the school.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Linked Student(s)</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {parents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-medium text-slate-700">
                        No parents added yet
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add your first parent to get started.
                      </p>

                      <Link
                        href="/dashboard/parents/new"
                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Add Parent →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                parents.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                          {p.firstName?.[0]?.toUpperCase() ?? "P"}
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            {p.firstName} {p.lastName ?? ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">{p.email}</td>

                    <td className="px-6 py-4 text-slate-600">
                      {p.phone ?? "—"}
                    </td>

                    <td className="px-6 py-4">
                      {p.parentStudents?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {p.parentStudents.map((ps) => (
                            <span
                              key={ps.student.id}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                            >
                              {ps.student.firstName} {ps.student.lastName ?? ""}{" "}
                              <span className="text-blue-500">
                                ({ps.relationship}
                                {ps.isPrimary ? ", primary" : ""})
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <ParentRowActions
                        parentId={p.id}
                        parentName={`${p.firstName} ${p.lastName ?? ""}`}
                      />
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
