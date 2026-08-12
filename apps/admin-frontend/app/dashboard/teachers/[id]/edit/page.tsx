"use client";

import { TeacherForm } from "@/components/teachers/teacher-form";
import { teachersApi } from "@/lib/api/teachers";
import { CreateTeacherValues } from "@/lib/validations/teacher";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [defaultValues, setDefaultValues] =
    useState<TeacherDefaultValues | null>(null);
  const [allocationsMeta, setAllocationsMeta] = useState<AllocationWithClass[]>(
    [],
  );

  useEffect(() => {
    async function load() {
      try {
        const teacher = await teachersApi.get(params.id);

        const allocations = (
          (teacher.teacherSubjectAllocations ??
            []) as TeacherAllocationApiResponse[]
        ).map((a) => ({
          subjectId: a.subjectId,
          sectionId: a.sectionId,
          academicYearId: a.academicYearId,
          classId: a.section?.classId ?? a.section?.class?.id,
        }));

        setDefaultValues({
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
          allocations: allocations.map(
            ({
              subjectId,
              sectionId,
              academicYearId,
            }: AllocationWithClass) => ({
              subjectId,
              sectionId,
              academicYearId,
            }),
          ),
        });

        setAllocationsMeta(allocations);
      } catch (error) {
        setNotFoundFlag(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading teacher...</p>;
  }

  if (notFoundFlag) {
    router.push("/dashboard/teachers");
    return null;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Edit Teacher
      </h1>
      <TeacherForm
        teacherId={params.id}
        defaultValues={defaultValues ?? undefined}
        initialAllocationsMeta={allocationsMeta}
      />
    </div>
  );
}
