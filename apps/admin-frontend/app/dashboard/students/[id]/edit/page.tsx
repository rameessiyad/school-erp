import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { StudentForm } from "@/components/students/student-form";

async function getStudent(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

async function getActiveAcademicYear() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/academic-year`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const years = await res.json();
  return years.find((y: { isActive: boolean }) => y.isActive) ?? null;
}

async function getEnrollment(studentId: string, academicYearId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/student/${studentId}/enrollment?academicYearId=${academicYearId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!res.ok) return null; // no enrollment for this year — that's fine
  return res.json();
}

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);

  if (!student) notFound();

  const activeYear = await getActiveAcademicYear();
  const enrollment = activeYear ? await getEnrollment(id, activeYear.id) : null;

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">
        Edit Student
      </h1>
      <StudentForm
        studentId={id}
        initialEnrollmentEnabled={!!enrollment}
        defaultValues={{
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
        }}
      />
    </div>
  );
}
