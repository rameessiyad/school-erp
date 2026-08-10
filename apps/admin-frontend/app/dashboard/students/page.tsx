import { cookies } from "next/headers";
import Link from "next/link";
import { Student } from "@/lib/validations/student";
import { StudentRowActions } from "@/components/students/student-row-actions";

async function getStudents(): Promise<Student[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Students</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Students
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage student profiles and enrollment information.
          </p>
        </div>

        <Link
          href="/dashboard/students/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
        >
          + Add Student
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Students</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {students.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Students registered in your school
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Students</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {students.filter((s) => s.isActive).length}
          </p>

          <p className="mt-1 text-xs text-blue-600">
            Currently active students
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">All Students</h2>

            <p className="mt-1 text-xs text-slate-500">
              View all students registered in your school
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {students.length} {students.length === 1 ? "student" : "students"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Admission No.
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Student
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Gender
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Blood Group
                </th>

                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3.5 font-medium text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <span className="text-lg font-semibold">+</span>
                      </div>

                      <p className="font-medium text-slate-700">
                        No students yet
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Add your first student to get started.
                      </p>

                      <Link
                        href="/dashboard/students/new"
                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Add Student →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {s.admissionNo}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700">
                          {s.firstName.slice(0, 1).toUpperCase()}
                          {s.lastName?.slice(0, 1).toUpperCase() ?? ""}
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">
                            {s.firstName} {s.lastName ?? ""}
                          </p>

                          <p className="text-xs text-slate-400">Student</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {s.gender ?? "—"}
                    </td>

                    <td className="px-6 py-4">
                      {s.bloodGroup ? (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {s.bloodGroup}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          s.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StudentRowActions
                        studentId={s.id}
                        studentName={`${s.firstName} ${s.lastName ?? ""}`}
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
