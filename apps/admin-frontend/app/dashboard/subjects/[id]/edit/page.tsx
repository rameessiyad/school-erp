"use client";

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
    return <p className="text-sm text-slate-400">Loading subject...</p>;
  }

  const defaultValues = subject
    ? {
        name: subject.name,
        code: subject.code,
      }
    : undefined;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Edit Subject
      </h1>
      <SubjectForm subjectId={params.id} defaultValues={defaultValues} />
    </div>
  );
}
