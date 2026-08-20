import { StaffForm } from "@/components/staff/staff-form";

export default function NewStaffPage() {
  return (
    <div className="w-auto space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Administration</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Add Staff
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Create a new staff account for your school.
        </p>
      </div>
      <StaffForm />
    </div>
  );
}
