import { TeacherForm } from "@/components/teachers/teacher-form";

export default function NewTeacherPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

        <h1 className="mb-6 text-2xl font-semibold text-text-primary">
          Add Teacher
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a teacher profile and assign their subjects and sections.
        </p>
      </div>

      <div className="w-auto">
        <TeacherForm />
      </div>
    </div>
  );
}
