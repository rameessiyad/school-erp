"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { feeApi } from "@/lib/api/fee";
import { classesApi } from "@/lib/api/classes";
import { sectionsApi } from "@/lib/api/sections";
import { FeeRowActions } from "@/components/fees/fee-row-actions";
import { FeeStatusBadge } from "@/components/fees/fee-status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { feeStatuses } from "@/lib/validations/fee";

// NOTE: adjust these imports/shapes to match your actual Class/Section types
interface ClassOption {
  id: string;
  name: string;
}

interface SectionOption {
  id: string;
  name: string;
  classId: string;
}

type FeeStatusValue = (typeof feeStatuses)[number];

export default function FeesPage() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [status, setStatus] = useState<FeeStatusValue | "">("");
  const [search, setSearch] = useState("");

  const { data: classes = [] } = useQuery<ClassOption[]>({
    queryKey: ["classes"],
    queryFn: classesApi.list,
  });

  const { data: allSections = [] } = useQuery<SectionOption[]>({
    queryKey: ["sections"],
    queryFn: sectionsApi.list,
  });

  const sections = useMemo(
    () => allSections.filter((s) => s.classId === classId),
    [allSections, classId],
  );

  const { data: studentFees = [], isLoading } = useQuery({
    queryKey: ["student-fees", { classId, sectionId, status, search }],
    queryFn: () =>
      feeApi.list({
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        status: status || undefined,
        search: search || undefined,
      }),
  });

  const balanceOf = (fee: (typeof studentFees)[number]) => {
    const paid = fee.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
    return Number(fee.totalAmount) - Number(fee.discountAmount) - paid;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Finance</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Fees
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track student fee balances and record offline payments.
          </p>
        </div>

        <Link
          href="/dashboard/fees/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
        >
          + Record Payment
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Select
          value={classId}
          onValueChange={(v) => {
            setClassId(v ?? "");
            setSectionId("");
          }}
        >
          <SelectTrigger className="h-10 w-40 rounded-lg border-slate-200 bg-slate-50/50">
            <SelectValue>
              {(v) => classes.find((c) => c.id === v)?.name ?? "All Classes"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sectionId}
          onValueChange={(v) => setSectionId(v ?? "")}
          disabled={!classId}
        >
          <SelectTrigger className="h-10 w-40 rounded-lg border-slate-200 bg-slate-50/50">
            <SelectValue>
              {(v) => sections.find((s) => s.id === v)?.name ?? "All Sections"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sections</SelectItem>
            {sections.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(v) => setStatus((v ?? "") as FeeStatusValue | "")}
        >
          <SelectTrigger className="h-10 w-44 rounded-lg border-slate-200 bg-slate-50/50">
            <SelectValue>
              {(v) => (v ? v.replace("_", " ") : "All Statuses")}
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
          className="h-10 max-w-xs rounded-lg border-slate-200 bg-slate-50/50"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Student Fees</h2>
          <span className="text-sm text-slate-400">
            {studentFees.length}{" "}
            {studentFees.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-left">
              <tr>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Student
                </th>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Class
                </th>
                <th className="px-6 py-3.5 font-medium text-slate-500">Fee</th>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Total
                </th>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Balance
                </th>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3.5 font-medium text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Loading fees...
                  </td>
                </tr>
              ) : studentFees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No fee records match these filters.
                  </td>
                </tr>
              ) : (
                studentFees.map((fee) => (
                  <tr key={fee.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {fee.student?.firstName} {fee.student?.lastName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {fee.student?.admissionNumber}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {fee.feeStructure?.class?.name ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {fee.feeStructure?.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      ₹{fee.totalAmount}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-800">
                      ₹{balanceOf(fee)}
                    </td>

                    <td className="px-6 py-4">
                      <FeeStatusBadge status={fee.status} />
                    </td>

                    <td className="px-6 py-4">
                      <FeeRowActions studentFeeId={fee.id} />
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
