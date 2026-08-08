import { cookies } from "next/headers";
import Link from "next/link";
import { Subject } from "@/lib/validations/subject";

async function getSubjects(): Promise<Subject[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subject`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];

  return res.json();
}

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Subjects
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage the subjects offered by your school.
          </p>
        </div>

        <Link
          href="/dashboard/subjects/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
        >
          + Add Subject
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Subjects</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {subjects.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Subjects currently available
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            With Subject Codes
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {subjects.filter((s) => s.code).length}
          </p>

          <p className="mt-1 text-xs text-blue-600">
            Subjects with assigned codes
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">All Subjects</h2>

            <p className="mt-1 text-xs text-slate-500">
              View all subjects configured for your school
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Subject
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">Code</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="text-lg font-semibold">+</span>
                      </div>

                      <p className="font-medium text-slate-700">
                        No subjects yet
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add your first subject to get started.
                      </p>

                      <Link
                        href="/dashboard/subjects/new"
                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Add Subject →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                subjects.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700">
                          {s.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">{s.name}</p>

                          <p className="text-xs text-slate-400">
                            Academic subject
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {s.code ? (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase text-slate-600">
                          {s.code}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
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
