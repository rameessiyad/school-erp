import { SubjectForm } from "@/components/subjects/subject-form";

export default function NewSubjectPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add Subject
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a new subject for your school.
        </p>
      </div>

      <div className="max-w-3xl">
        <SubjectForm />
      </div>
    </div>
  );
}
