import { StaffForm } from "@/components/staff/staff-form";

export default function NewStaffPage() {
  return (
    <div className="max-w-3xl space-y-8">
      {" "}
      <div>
        {" "}
        <p className="mb-1 text-sm font-medium text-blue-600">
          {" "}
          Administration{" "}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Add Staff
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a new staff account for your school.
        </p>
      </div>
      <StaffForm />
    </div>
  );
}
