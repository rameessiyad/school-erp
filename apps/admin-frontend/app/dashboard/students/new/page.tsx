import { StudentForm } from "@/components/students/student-form";

export default function NewStudentPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Students</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add Student
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Add a new student and optionally enroll them into a class.
        </p>
      </div>

      <div className="max-w-4xl">
        <StudentForm />
      </div>
    </div>
  );
}
