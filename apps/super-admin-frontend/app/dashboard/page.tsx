"use client";

import Link from "next/link";
import { GraduationCap, School, Users, XCircle } from "lucide-react";
import { useSchools } from "@/hooks/use-schools";
import { PageLoader } from "@/components/ui/page-loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-text-primary">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: schools, isLoading, isError } = useSchools();

  if (isLoading) {
    return <PageLoader text="Loading dashboard" />;
  }

  if (isError || !schools) {
    return <p className="text-sm text-error">Failed to load dashboard data.</p>;
  }

  const active = schools.filter((s) => s.status === "ACTIVE").length;
  const inactive = schools.length - active;
  const totalStudents = schools.reduce((sum, s) => sum + s._count.students, 0);
  const totalTeachers = schools.reduce((sum, s) => sum + s._count.teachers, 0);
  const recent = schools.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Platform overview across all schools
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Schools" value={schools.length} icon={School} />
        <StatCard label="Inactive Schools" value={inactive} icon={XCircle} />
        <StatCard
          label="Total Students"
          value={totalStudents}
          icon={GraduationCap}
        />
        <StatCard label="Total Teachers" value={totalTeachers} icon={Users} />
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Recent Schools
            </h2>
            <p className="text-xs text-text-secondary">
              {active} active · {inactive} inactive
            </p>
          </div>
          <Link
            href="/dashboard/schools"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            View all
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-text-secondary"
                >
                  No schools yet
                </TableCell>
              </TableRow>
            ) : (
              recent.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium text-text-primary">
                    {school.name}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {school.subdomain}.skoladeck.com
                  </TableCell>
                  <TableCell>{school._count.students}</TableCell>
                  <TableCell>{school.allowedModules.length}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        school.status === "ACTIVE"
                          ? "bg-success-soft text-success"
                          : "bg-error-soft text-error"
                      }`}
                    >
                      {school.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {new Date(school.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
