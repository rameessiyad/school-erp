import { cookies } from "next/headers";
import Link from "next/link";
import { Staff } from "@/lib/validations/staff";

async function getStaff(): Promise<Staff[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];

  return res.json();
}

export default async function StaffPage() {
  const staff = await getStaff();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">
            Administration
          </p>
          ```
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Staff
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your school&apos;s administrative and support staff.
          </p>
        </div>

        <Link
          href="/dashboard/staff/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
        >
          + Add Staff
        </Link>
      </div>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Staff</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {staff.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Registered staff members
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Staff</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {staff.filter((s) => s.isActive).length}
          </p>

          <p className="mt-1 text-xs text-emerald-600">Currently active</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Inactive Staff</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {staff.filter((s) => !s.isActive).length}
          </p>

          <p className="mt-1 text-xs text-slate-400">Currently inactive</p>
        </div>
      </div>
      {/* Staff Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">All Staff</h2>

            <p className="mt-1 text-xs text-slate-500">
              View and manage staff members
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {staff.length} {staff.length === 1 ? "member" : "members"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Staff Member
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Email
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Phone
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Designation
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="text-lg font-semibold">+</span>
                      </div>

                      <p className="font-medium text-slate-700">
                        No staff members yet
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add your first staff member to get started.
                      </p>

                      <Link
                        href="/dashboard/staff/new"
                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Add Staff →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                staff.map((s) => {
                  const initials =
                    `${s.firstName?.[0] ?? ""}${s.lastName?.[0] ?? ""}`.toUpperCase();

                  return (
                    <tr key={s.id} className="transition hover:bg-slate-50/70">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                            {initials}
                          </div>

                          <div>
                            <p className="font-medium text-slate-800">
                              {s.firstName} {s.lastName ?? ""}
                            </p>

                            <p className="text-xs text-slate-400">
                              Staff member
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-600">{s.email}</td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-slate-600">
                        {s.phone ?? "—"}
                      </td>

                      {/* Designation */}
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                          {s.designation.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                            s.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              s.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />

                          {s.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      ```
    </div>
  );
}
