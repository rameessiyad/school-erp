"use client";

import { PageLoader } from "@/components/common/page-loader";
import { SubjectForm } from "@/components/subjects/subject-form";
import { subjectsApi } from "@/lib/api/subjects";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export default function EditSubjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: subject,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["subject", params.id],
    queryFn: () => subjectsApi.get(params.id),
  });

  if (isError) {
    router.push("/dashboard/subjects");
    return null;
  }

  if (isLoading) {
    return <PageLoader text="Loading subject..." />;
  }

  const defaultValues = subject
    ? {
        name: subject.name,
        code: subject.code ?? undefined,
      }
    : undefined;

  return (
    <div className="w-auto">
      <div className="mb-6">
        <p className="mb-1 text-sm font-medium text-primary">Academics</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Edit Subject
        </h1>
      </div>
      <SubjectForm subjectId={params.id} defaultValues={defaultValues} />
    </div>
  );
}
