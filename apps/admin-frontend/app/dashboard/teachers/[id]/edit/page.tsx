"use client";

import { TeacherForm } from "@/components/teachers/teacher-form";
import { teachersApi } from "@/lib/api/teachers";
import { CreateTeacherValues } from "@/lib/validations/teacher";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

type TeacherDefaultValues = Partial<CreateTeacherValues> & {
  photoUrl?: string | null;
};

interface AllocationWithClass {
  subjectId: string;
  sectionId: string;
  academicYearId: string;
  classId?: string;
}

interface TeacherAllocationApiResponse {
  subjectId: string;
  sectionId: string;
  academicYearId: string;
  section?: {
    classId?: string;
    class?: { id: string };
  };
}

export default function EditTeacherPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: teacher,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teacher", params.id],
    queryFn: () => teachersApi.get(params.id),
  });

  if (isError) {
    router.push("/dashboard/teachers");
    return null;
  }

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading teacher...</p>;
  }

  const allocationsMeta: AllocationWithClass[] = (
    (teacher?.teacherSubjectAllocations ?? []) as TeacherAllocationApiResponse[]
  ).map((a) => ({
    subjectId: a.subjectId,
    sectionId: a.sectionId,
    academicYearId: a.academicYearId,
    classId: a.section?.classId ?? a.section?.class?.id,
  }));

  const defaultValues: TeacherDefaultValues | undefined = teacher
    ? {
        firstName: teacher.firstName,
        lastName: teacher.lastName ?? undefined,
        gender: teacher.gender ?? undefined,
        dob: teacher.dob ? teacher.dob.split("T")[0] : undefined,
        joiningDate: teacher.joiningDate
          ? teacher.joiningDate.split("T")[0]
          : undefined,
        qualification: teacher.qualification ?? undefined,
        experience: teacher.experience ?? undefined,
        employeeId: teacher.employeeId ?? undefined,
        email: teacher.email ?? undefined,
        phone: teacher.phone ?? undefined,
        photoUrl: teacher.photoUrl ?? undefined,
        allocations: allocationsMeta.map(
          ({ subjectId, sectionId, academicYearId }) => ({
            subjectId,
            sectionId,
            academicYearId,
          }),
        ),
      }
    : undefined;

  return (
    <div className="w-auto">
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">
        Edit Teacher
      </h1>
      <TeacherForm
        teacherId={params.id}
        defaultValues={defaultValues}
        initialAllocationsMeta={allocationsMeta}
      />
    </div>
  );
}
