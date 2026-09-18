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
import jsPDF from "jspdf";

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
    const doc = new jsPDF();

    const receiptNumber = payment.receiptNumber;
    const paymentMethod = payment.paymentMethod.replace("_", " ");
    const date = new Date(payment.paymentDate).toLocaleDateString();

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Receipt", 20, 25);

    // Receipt number
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt No. ${receiptNumber}`, 20, 33);

    // Divider
    doc.line(20, 40, 190, 40);

    // Details
    const rows = [
      ["Student", studentName ?? "—"],
      ["Fee", feeStructureName ?? "—"],
      ["Amount Paid", `₹${payment.amount}`],
      ["Payment Method", paymentMethod],
      ["Date", date],
      ["Collected By", payment.collectedBy?.email ?? "—"],
    ];

    let y = 55;

    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(label, 20, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(value, 190, y, {
        align: "right",
      });

      doc.setDrawColor(230, 230, 230);
      doc.line(20, y + 5, 190, y + 5);

      y += 16;
    });

    // Download
    doc.save(`Receipt-${receiptNumber}.pdf`);
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
