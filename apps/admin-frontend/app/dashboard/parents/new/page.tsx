import { ParentForm } from "@/components/parents/parent-form";

export default function NewParentPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Parents</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add Parent
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Add a parent or guardian and link them to a student.
        </p>
      </div>

      <div className="max-w-4xl">
        <ParentForm />
      </div>
    </div>
  );
}
