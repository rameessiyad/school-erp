"use client";

import Link from "next/link";
import { SchoolClass } from "@/lib/validations/class";
import { useQuery } from "@tanstack/react-query";
import { classesApi } from "@/lib/api/classes";
import { ClassesRow } from "@/components/classes/classes-row-actions";

export default function ClassesPage() {
  const { data: schoolClasses = [], isLoading } = useQuery({
    queryKey: ["schoolClasses"],
    queryFn: classesApi.list,
  });

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading classes...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Classes
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage the classes available in your school.
          </p>
        </div>

        <Link
          href="/dashboard/classes/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
        >
          + Add Class
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Classes</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {schoolClasses.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Classes registered in your school
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">All Classes</h2>

            <p className="mt-1 text-xs text-slate-500">
              View all classes in your school
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {schoolClasses.length}{" "}
            {schoolClasses.length === 1 ? "class" : "classes"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Class Name
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Sections
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {schoolClasses.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="text-lg font-semibold">+</span>
                      </div>

                      <p className="font-medium text-slate-700">
                        No classes yet
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add your first class to get started.
                      </p>

                      <Link
                        href="/dashboard/classes/new"
                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Add Class →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                schoolClasses.map((c: SchoolClass) => (
                  <tr key={c.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-700">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">{c.name}</p>

                          <p className="text-xs text-slate-400">School class</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {c.sections && c.sections.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {c.sections.map((s) => (
                            <Link
                              key={s.id}
                              href={`/dashboard/sections/${s.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                              {s.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          No sections
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <ClassesRow classId={c.id} className={c.name} />
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
