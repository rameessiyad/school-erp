"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye } from "lucide-react";
import { feeApi } from "@/lib/api/fee";
import { sectionsApi } from "@/lib/api/sections";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { feeStatuses } from "@/lib/validations/fee";
import { PageLoader } from "@/components/common/page-loader";
import type { StudentFee } from "@/lib/validations/fee";

type FeeStatusValue = (typeof feeStatuses)[number];

// One row per student, rolled up from all their StudentFee records
interface StudentFeeGroup {
  studentId: string;
  student: StudentFee["student"];
  fees: StudentFee[];
  totalAmount: number;
  totalBalance: number;
  paidCount: number;
}

function balanceOf(fee: StudentFee) {
  const paid = fee.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
  return Number(fee.totalAmount) - Number(fee.discountAmount) - paid;
}

function groupByStudent(fees: StudentFee[]): StudentFeeGroup[] {
  const map = new Map<string, StudentFeeGroup>();

  for (const fee of fees) {
    const studentId = fee.student?.id;
    if (!studentId) continue;

    if (!map.has(studentId)) {
      map.set(studentId, {
        studentId,
        student: fee.student,
        fees: [],
        totalAmount: 0,
        totalBalance: 0,
        paidCount: 0,
      });
    }

    const group = map.get(studentId)!;
    group.fees.push(fee);
    group.totalAmount += Number(fee.totalAmount);
    group.totalBalance += balanceOf(fee);
    if (fee.status === "PAID") group.paidCount += 1;
  }

  return Array.from(map.values());
}

export default function SectionFeesPage() {
  const params = useParams<{ sectionId: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<FeeStatusValue | "">("");
  const [search, setSearch] = useState("");

  const {
    data: sectionDetails,
    isLoading: sectionLoading,
    isError,
  } = useQuery({
    queryKey: ["sectionDetails", params.sectionId],
    queryFn: () => sectionsApi.getDetails(params.sectionId),
  });

  const { data: studentFees = [], isLoading: feesLoading } = useQuery({
    queryKey: ["student-fees", { sectionId: params.sectionId, status, search }],
    queryFn: () =>
      feeApi.list({
        sectionId: params.sectionId,
        status: status || undefined,
        search: search || undefined,
      }),
  });

  const studentGroups = useMemo(
    () => groupByStudent(studentFees),
    [studentFees],
  );

  if (isError) {
    router.push("/dashboard/fees");
    return null;
  }

  if (sectionLoading || !sectionDetails) {
    return <PageLoader text="Loading section..." />;
  }

  const { section } = sectionDetails;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/fees"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Fees
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              {section.class?.name} — Section {section.name}
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Track fee balances and record offline payments.
            </p>
          </div>

          <Link
            href={`/dashboard/fees/new?sectionId=${section.id}`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary-hover"
          >
            + Record Payment
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
        <Select
          value={status}
          onValueChange={(v: string | null) =>
            setStatus((v ?? "") as FeeStatusValue | "")
          }
        >
          <SelectTrigger className="h-10 w-44 rounded-lg border-border bg-surface-secondary/50">
            <SelectValue>
              {(v: string) => (v ? v.replace("_", " ") : "All Statuses")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {feeStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search student name or admission no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 max-w-xs rounded-lg border-border bg-surface-secondary/50"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold text-text-primary">Student Fees</h2>
          <span className="text-sm text-text-muted">
            {studentGroups.length}{" "}
            {studentGroups.length === 1 ? "student" : "students"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-secondary/40 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Student
                </th>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Fees
                </th>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Total
                </th>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Balance
                </th>
                <th className="px-6 py-3.5 font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {feesLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    Loading fees...
                  </td>
                </tr>
              ) : studentGroups.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-text-muted"
                  >
                    No fee records match these filters.
                  </td>
                </tr>
              ) : (
                studentGroups.map((group) => (
                  <tr
                    key={group.studentId}
                    className="transition hover:bg-surface-secondary/50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">
                        {group.student?.firstName} {group.student?.lastName}
                      </p>
                      <p className="text-xs text-text-muted">
                        {group.student?.admissionNumber}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-text-secondary">
                      {group.paidCount}/{group.fees.length} paid
                    </td>

                    <td className="px-6 py-4 text-text-secondary">
                      ₹{group.totalAmount}
                    </td>

                    <td className="px-6 py-4 font-medium text-text-primary">
                      ₹{group.totalBalance}
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/fees/section/${params.sectionId}/student/${group.studentId}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
                        title="View fees"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
