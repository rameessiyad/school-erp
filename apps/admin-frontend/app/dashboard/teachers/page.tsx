import { cookies } from "next/headers";
import Link from "next/link";
import { Teacher } from "@/lib/validations/teacher";

async function getTeachers(): Promise<Teacher[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Teachers
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage teachers and their academic information.
          </p>
        </div>

        <Link
          href="/dashboard/teachers/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
        >
          + Add Teacher
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Teachers</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {teachers.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Teachers registered in your school
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Teachers</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {teachers.filter((t) => t.isActive).length}
          </p>

          <p className="mt-1 text-xs text-blue-600">
            Currently active teachers
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">All Teachers</h2>

            <p className="mt-1 text-xs text-slate-500">
              View all teachers registered in your school
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {teachers.length} {teachers.length === 1 ? "teacher" : "teachers"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Teacher
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Email
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Employee ID
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Qualification
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="text-lg font-semibold">+</span>
                      </div>

                      <p className="font-medium text-slate-700">
                        No teachers yet
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add your first teacher to get started.
                      </p>

                      <Link
                        href="/dashboard/teachers/new"
                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Add Teacher →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700">
                          {t.firstName.slice(0, 1).toUpperCase()}
                          {t.lastName?.slice(0, 1).toUpperCase() ?? ""}
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">
                            {t.firstName} {t.lastName ?? ""}
                          </p>

                          <p className="text-xs text-slate-400">Teacher</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">{t.email}</td>

                    <td className="px-6 py-4">
                      {t.employeeId ? (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {t.employeeId}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {t.qualification ?? "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          t.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t.isActive ? "Active" : "Inactive"}
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
