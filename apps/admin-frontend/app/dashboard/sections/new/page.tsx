import { SectionForm } from "@/components/sections/section-form";

export default function NewSectionPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Academics</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add Section
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Create a new section and assign it to a class and academic year.
        </p>
      </div>

      <div className="max-w-3xl">
        <SectionForm />
      </div>
    </div>
  );
}
