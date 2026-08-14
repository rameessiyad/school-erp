"use client";

import { ClassForm } from "@/components/classes/class-form";
import { classesApi } from "@/lib/api/classes";
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

  if (isError) {
    router.push("/dashboard/classes");
    return null;
  }

  if (isLoading || !schoolClass) {
    return <p className="text-sm text-slate-400">Loading class...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Edit Class
        </h1>
      </div>

      <ClassForm
        classId={params.id}
        defaultValues={{ name: schoolClass.name }}
      />
    </div>
  );
}
