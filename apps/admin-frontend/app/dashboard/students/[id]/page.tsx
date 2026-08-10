import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentDetail {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string | null;
  gender: string | null;
  dob: string | null;
  bloodGroup: string | null;
  admissionDate: string | null;
  isActive: boolean;
}

async function getStudent(id: string): Promise<StudentDetail | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);

  if (!student) notFound();

  const fullName = `${student.firstName} ${student.lastName ?? ""}`.trim();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Students</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Student Details
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View the student&apos;s admission and personal information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/students">
            <Button
              variant="outline"
              className="h-10 rounded-lg border-slate-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <Link href={`/dashboard/students/${id}/edit`}>
            <Button className="h-10 rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
            {student.firstName[0]?.toUpperCase()}
            {student.lastName?.[0]?.toUpperCase() ?? ""}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900">{fullName}</h2>

            <p className="mt-1 text-sm text-slate-500">
              Admission No.{" "}
              <span className="font-medium text-slate-700">
                {student.admissionNo}
              </span>
            </p>
          </div>

          <span
            className={`sm:ml-auto inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
              student.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`mr-2 h-1.5 w-1.5 rounded-full ${
                student.isActive ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {student.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Personal Information */}
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
                Basic information about the student.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-400">Gender</p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {student.gender ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Date of Birth
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {student.dob ? new Date(student.dob).toLocaleDateString() : "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-400">Blood Group</p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {student.bloodGroup ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Admission Date
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {student.admissionDate
                  ? new Date(student.admissionDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
