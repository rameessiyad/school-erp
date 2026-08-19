"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { FeePayment } from "@/lib/validations/fee";

interface PaymentHistoryTableProps {
  payments: FeePayment[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Receipt</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Collected By</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {payments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-text-muted">
              No payments recorded yet.
            </TableCell>
          </TableRow>
        ) : (
          payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs text-text-secondary">
                {p.receiptNumber}
              </TableCell>

              <TableCell className="font-medium text-text-primary">
                ₹{p.amount}
              </TableCell>

              <TableCell className="text-text-secondary">
                {p.paymentMethod.replace("_", " ")}
              </TableCell>

              <TableCell className="text-text-secondary">
                {new Date(p.paymentDate).toLocaleDateString()}
              </TableCell>

              <TableCell className="text-text-secondary">
                {p.collectedBy?.email ?? "—"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
