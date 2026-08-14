"use client";

import { useParams, useRouter } from "next/navigation";
import { StaffForm } from "@/components/staff/staff-form";
import { staffApi } from "@/lib/api/staff";
import { useQuery } from "@tanstack/react-query";

export default function EditStaffPage() {
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
    return <p className="text-sm text-slate-400">Loading staff...</p>;
  }

  const defaultValues = {
    firstName: staff.firstName,
    lastName: staff.lastName ?? undefined,
    email: staff.email ?? undefined,
    phone: staff.phone ?? undefined,
    designation: staff.designation,
  };

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit Staff</h1>
      <StaffForm staffId={params.id} defaultValues={defaultValues} />
    </div>
  );
}
