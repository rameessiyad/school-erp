import { ClassForm } from "@/components/classes/class-form";

export default function NewClassPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Academics</p>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Add Class
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Create a new class for your school.
        </p>
      </div>

      <div className="w-auto">
        <ClassForm />
      </div>
    </div>
  );
}
