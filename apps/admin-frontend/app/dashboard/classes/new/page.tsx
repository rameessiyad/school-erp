import { ClassForm } from "@/components/classes/class-form";

export default function NewClassPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add Class
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a new class for your school.
        </p>
      </div>

      <div className="max-w-3xl">
        <ClassForm />
      </div>
    </div>
  );
}
