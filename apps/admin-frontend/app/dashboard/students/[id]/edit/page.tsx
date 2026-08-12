"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StudentForm } from "@/components/students/student-form";
import { studentsApi } from "@/lib/api/students";
import { optionsApi } from "@/lib/api/options";

interface Enrollment {
  sectionId: string;
  academicYearId: string;
  rollNo?: string;
  section?: { class?: { id: string } };
}

export default function EditStudentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [initialEnrollmentEnabled, setInitialEnrollmentEnabled] =
    useState(false);

  useEffect(() => {
    async function load() {
      try {
        const student = await studentsApi.get(params.id);

        let enrollment: Enrollment | null = null;
        try {
          const years = await optionsApi.academicYears();
          const activeYear = years.find((y) => y.isActive) ?? null;

          if (activeYear) {
            enrollment = await studentsApi.getEnrollment(
              params.id,
              activeYear.id,
            );
          }
        } catch {
          enrollment = null;
        }

        setDefaultValues({
          admissionNo: student.admissionNo,
          firstName: student.firstName,
          lastName: student.lastName ?? undefined,
          gender: student.gender ?? undefined,
          dob: student.dob ? student.dob.split("T")[0] : undefined,
          bloodGroup: student.bloodGroup ?? undefined,
          admissionDate: student.admissionDate
            ? student.admissionDate.split("T")[0]
            : undefined,
          ...(enrollment && {
            classId: enrollment.section?.class?.id,
            sectionId: enrollment.sectionId,
            academicYearId: enrollment.academicYearId,
            rollNo: enrollment.rollNo ?? undefined,
          }),
        });
        setInitialEnrollmentEnabled(!!enrollment);
      } catch {
        setNotFoundFlag(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-slate-400">Loading student...</p>;
  }

  if (notFoundFlag) {
    router.push("/dashboard/students");
    return null;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Edit Student
      </h1>
      <StudentForm
        studentId={params.id}
        initialEnrollmentEnabled={initialEnrollmentEnabled}
        defaultValues={defaultValues ?? undefined}
      />
    </div>
  );
}
