"use client";

import { ClassForm } from "@/components/classes/class-form";
import { classesApi } from "@/lib/api/classes";
import { optionsApi } from "@/lib/api/options";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export default function EditClassPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: schoolClass,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["schoolClass", params.id],
    queryFn: () => classesApi.get(params.id),
  });

  const { data: years } = useQuery({
    queryKey: ["academicYears"],
    queryFn: () => optionsApi.academicYears(),
  });

  const activeYear = years?.find((y) => y.isActive) ?? null;

  if (isError) {
    router.push("/dashboard/classes");
    return null;
  }

  if (isLoading || !schoolClass) {
    return <p className="text-sm text-text-muted">Loading class...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Academics</p>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Edit Class
        </h1>
      </div>

      <ClassForm
        classId={params.id}
        defaultValues={{ name: schoolClass.name }}
        initialSections={schoolClass.sections ?? []}
        activeAcademicYearId={activeYear?.id}
      />
    </div>
  );
}
