"use client";

import { useParams, useRouter } from "next/navigation";
import { ParentForm } from "@/components/parents/parent-form";
import { parentsApi } from "@/lib/api/parents";
import { useQuery } from "@tanstack/react-query";
import { CreateParentValues } from "@/lib/validations/parent";
import { PageLoader } from "@/components/common/page-loader";

export default function EditParentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: parent,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["parent", params.id],
    queryFn: () => parentsApi.get(params.id),
  });

  if (isError) {
    router.push("/dashboard/parents");
    return null;
  }

  if (isLoading || !parent) {
    return <PageLoader text="Loading parent" />
  }

  const primaryLink =
    parent.parentStudents?.find((ps) => ps.isPrimary) ??
    parent.parentStudents?.[0];

  const defaultValues = {
    firstName: parent.firstName,
    lastName: parent.lastName ?? undefined,
    email: parent.email ?? undefined,
    phone: parent.phone ?? undefined,
    occupation: parent.occupation ?? undefined,
    address: parent.address ?? undefined,
    studentId: primaryLink?.studentId,
    relationship: primaryLink?.relationship as
      | CreateParentValues["relationship"]
      | undefined,
    isPrimary: primaryLink?.isPrimary ?? false,
  };

  return (
    <div className="w-auto">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">
        Edit Parent
      </h1>
      <ParentForm parentId={params.id} defaultValues={defaultValues} />
    </div>
  );
}
