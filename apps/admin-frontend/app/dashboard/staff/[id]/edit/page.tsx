"use client";

import { useParams, useRouter } from "next/navigation";
import { StaffForm } from "@/components/staff/staff-form";
import { staffApi } from "@/lib/api/staff";
import { PageLoader } from "@/components/common/page-loader";
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
    return <PageLoader text="Loading staff..." />;
  }

  const defaultValues = {
    firstName: staff.firstName,
    lastName: staff.lastName ?? undefined,
    email: staff.email ?? undefined,
    phone: staff.phone ?? undefined,
    designation: staff.designation,
  };

  return (
    <div className="w-auto space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Administration</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Edit Staff
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Update this staff member&apos;s details.
        </p>
      </div>

      <StaffForm
        staffId={params.id}
        defaultValues={defaultValues}
        photoUrl={staff.photoUrl}
      />
    </div>
  );
}
