"use client";

import { useState } from "react";
import { Eye, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FeePayment } from "@/lib/validations/fee";

interface ReceiptDialogProps {
  payment: FeePayment;
  studentName?: string;
  feeStructureName?: string;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}

export function ReceiptDialog({
  payment,
  studentName,
  feeStructureName,
}: ReceiptDialogProps) {
  const [open, setOpen] = useState(false);

  function handleDownload() {
    const receiptWindow = window.open("", "_blank", "width=420,height=600");
    if (!receiptWindow) return;

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${payment.receiptNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 32px; color: #111; }
            h1 { font-size: 18px; margin-bottom: 4px; }
            .muted { color: #666; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee; }
            td:first-child { color: #666; }
            td:last-child { text-align: right; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>Payment Receipt</h1>
          <p class="muted">Receipt No. ${payment.receiptNumber}</p>
          <table>
            <tr><td>Student</td><td>${studentName ?? "—"}</td></tr>
            <tr><td>Fee</td><td>${feeStructureName ?? "—"}</td></tr>
            <tr><td>Amount Paid</td><td>₹${payment.amount}</td></tr>
            <tr><td>Payment Method</td><td>${payment.paymentMethod.replace("_", " ")}</td></tr>
            <tr><td>Date</td><td>${new Date(payment.paymentDate).toLocaleDateString()}</td></tr>
            <tr><td>Collected By</td><td>${payment.collectedBy?.email ?? "—"}</td></tr>
          </table>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 items-center cursor-pointer justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
        aria-label="View receipt"
      >
        <Eye className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="font-mono text-xs text-text-muted">
              Receipt No. {payment.receiptNumber}
            </p>

            <div className="divide-y divide-border rounded-lg border border-border">
              <Row label="Student" value={studentName ?? "—"} />
              <Row label="Fee" value={feeStructureName ?? "—"} />
              <Row label="Amount Paid" value={`₹${payment.amount}`} />
              <Row
                label="Payment Method"
                value={payment.paymentMethod.replace("_", " ")}
              />
              <Row
                label="Date"
                value={new Date(payment.paymentDate).toLocaleDateString()}
              />
              <Row
                label="Collected By"
                value={payment.collectedBy?.email ?? "—"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
