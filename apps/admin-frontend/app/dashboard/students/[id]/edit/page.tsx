"use client";

import { useParams, useRouter } from "next/navigation";
import { StudentForm } from "@/components/students/student-form";
import { studentsApi } from "@/lib/api/students";
import { optionsApi } from "@/lib/api/options";
import { useQuery } from "@tanstack/react-query";


export default function EditStudentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: student,
    isLoading: studentLoading,
    isError,
  } = useQuery({
    queryKey: ["student", params.id],
    queryFn: () => studentsApi.get(params.id),
  });

  const { data: years } = useQuery({
    queryKey: ["academicYears"],
    queryFn: () => optionsApi.academicYears(),
    enabled: !!student,
  });

  const activeYear = years?.find((y) => y.isActive) ?? null;

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ["enrollment", params.id, activeYear?.id],
    queryFn: () => studentsApi.getEnrollment(params.id, activeYear!.id),
    enabled: !!activeYear,
    retry: false,
  });

  if (isError) {
    router.push("/dashboard/students");
    return null;
  }

  if (studentLoading || (activeYear && enrollmentLoading)) {
    return <p className="text-sm text-slate-400">Loading student...</p>;
  }

  const defaultValues = student
    ? {
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
      }
    : undefined;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Edit Student
      </h1>
      <StudentForm
        studentId={params.id}
        initialEnrollmentEnabled={!!enrollment}
        defaultValues={defaultValues}
      />
    </div>
  );
}
