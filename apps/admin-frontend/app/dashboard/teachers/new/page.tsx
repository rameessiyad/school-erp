import { TeacherForm } from "@/components/teachers/teacher-form";

export default function NewTeacherPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add Teacher
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a teacher profile and assign their subjects and sections.
        </p>
      </div>

      <div className="max-w-4xl">
        <TeacherForm />
      </div>
    </div>
  );
}
