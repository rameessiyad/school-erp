import { cookies } from "next/headers";
import Link from "next/link";
import { Section } from "@/lib/validations/section";

async function getSections(): Promise<Section[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/section`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function SectionsPage() {
  const sections = await getSections();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Sections
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage sections and their academic year assignments.
          </p>
        </div>

        <Link
          href="/dashboard/sections/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
        >
          + Add Section
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Sections</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {sections.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Sections registered in your school
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">All Sections</h2>

            <p className="mt-1 text-xs text-slate-500">
              View sections, classes, and academic years
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {sections.length} {sections.length === 1 ? "section" : "sections"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Section
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Class
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Academic Year
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sections.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="text-lg font-semibold">+</span>
                      </div>

                      <p className="font-medium text-slate-700">
                        No sections yet
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add your first section to get started.
                      </p>

                      <Link
                        href="/dashboard/sections/new"
                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Add Section →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                sections.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-700">
                          {s.name.slice(0, 1).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">{s.name}</p>

                          <p className="text-xs text-slate-400">Section</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {s.class?.name ? (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {s.class.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {s.academicYear?.label ? (
                        <span className="text-slate-600">
                          {s.academicYear.label}
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
