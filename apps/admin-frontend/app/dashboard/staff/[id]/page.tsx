"use client";

import { Button } from "@/components/ui/button";
import { staffApi } from "@/lib/api/staff";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Mail,
  Pencil,
  Phone,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function StaffDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: staff,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["staff", params.id],
    queryFn: () => staffApi.get(params.id),
  });

  if (isError) {
    router.push("/dashboard/staff");
    return null;
  }

  if (isLoading || !staff) {
    return <p className="text-sm text-slate-400">Loading Staff details...</p>;
  }

  const fullName = `${staff.firstName} ${staff.lastName ?? ""}`.trim();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Staff</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Staff Details
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View this staff member&apos;s personal information and role.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/staff">
            <Button
              variant="outline"
              className="h-10 rounded-lg border-slate-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <Link href={`/dashboard/staff/${staff.id}/edit`}>
            <Button className="h-10 rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Staff
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
              {staff.firstName[0]?.toUpperCase()}
              {staff.lastName?.[0]?.toUpperCase() ?? ""}
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-900">
                {fullName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">{staff.designation}</p>
            </div>
          </div>

          <span
            className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              staff.isActive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {staff.isActive ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {staff.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Personal Information
              </h3>

              <p className="text-xs text-slate-500">
                Basic information and contact details.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Mail className="h-3.5 w-3.5" />
                Email
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {staff.email ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                Phone
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {staff.phone ?? "—"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Briefcase className="h-3.5 w-3.5" />
                Designation
              </p>

              <p className="mt-2 text-sm font-medium text-slate-800">
                {staff.designation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
