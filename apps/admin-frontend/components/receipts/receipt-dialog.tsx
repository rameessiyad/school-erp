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

// Change this later to your actual school data
const SCHOOL_NAME = "ABC INTERNATIONAL SCHOOL";

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
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const receiptNumber = payment.receiptNumber ?? "—";

    const paymentMethod = payment.paymentMethod
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const date = new Date(payment.paymentDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const amount = Number(payment.amount || 0);

    const pageWidth = 210;

    // =========================================================
    // HEADER
    // =========================================================

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 15, 180, 43, 4, 4, "F");

    // SKOLA DECK
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("SKOLA DECK", 25, 30);

    // School name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(SCHOOL_NAME, 25, 39);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("School Management System", 25, 47);

    // Receipt badge
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(148, 23, 37, 22, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text("PAYMENT", 166.5, 31, {
      align: "center",
    });

    doc.setFontSize(11);

    doc.text("RECEIPT", 166.5, 38, {
      align: "center",
    });

    // =========================================================
    // RECEIPT INFORMATION
    // =========================================================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text("Receipt Number", 20, 72);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    doc.text(receiptNumber, 20, 79);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text("Payment Date", 190, 72, {
      align: "right",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    doc.text(date, 190, 79, {
      align: "right",
    });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);

    doc.line(20, 87, 190, 87);

    // =========================================================
    // STUDENT DETAILS
    // =========================================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    doc.text("Student Details", 20, 101);

    // Student card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 108, 170, 26, 3, 3, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text("STUDENT", 27, 117);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    const student = studentName ?? "—";

    const studentText = doc.splitTextToSize(student, 145);

    doc.text(studentText, 27, 125);

    // =========================================================
    // PAYMENT DETAILS
    // =========================================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    doc.text("Payment Details", 20, 151);

    // Outer box
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);

    doc.roundedRect(20, 158, 170, 50, 3, 3);

    // Fee
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text("Fee", 27, 169);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const feeName = doc.splitTextToSize(feeStructureName ?? "—", 100);

    doc.text(feeName, 190, 169, {
      align: "right",
    });

    // Divider
    doc.setDrawColor(226, 232, 240);

    doc.line(27, 176, 183, 176);

    // Payment method
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text("Payment Method", 27, 186);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);

    doc.text(paymentMethod, 190, 186, {
      align: "right",
    });

    // Divider
    doc.setDrawColor(226, 232, 240);

    doc.line(27, 193, 183, 193);

    // Collected by
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text("Collected By", 27, 203);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);

    const collectedBy = payment.collectedBy?.email ?? "—";

    const collectorText = doc.splitTextToSize(collectedBy, 105);

    doc.text(collectorText, 190, 203, {
      align: "right",
    });

    // =========================================================
    // TOTAL AMOUNT
    // =========================================================

    doc.setFillColor(241, 245, 249);

    doc.roundedRect(20, 219, 170, 32, 4, 4, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text("TOTAL AMOUNT PAID", 28, 232);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(30, 41, 59);

    // Using Rs. because default Helvetica doesn't support ₹
    doc.text(`Rs. ${amount.toLocaleString("en-IN")}`, 182, 234, {
      align: "right",
    });

    // =========================================================
    // THANK YOU
    // =========================================================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    doc.text("Thank you for your payment.", pageWidth / 2, 269, {
      align: "center",
    });

    // =========================================================
    // FOOTER
    // =========================================================

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);

    doc.line(20, 278, 190, 278);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    doc.text("Generated by SKOLA DECK", 20, 285);

    doc.text("This is a computer-generated receipt.", 190, 285, {
      align: "right",
    });

    // =========================================================
    // DOWNLOAD
    // =========================================================

    doc.save(`Receipt-${receiptNumber}.pdf`);
  }

  return (
    <>
      {/* View Receipt Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
        aria-label="View receipt"
      >
        <Eye className="h-4 w-4" />
      </button>

      {/* Receipt Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Receipt number + status */}
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-text-muted">
                Receipt No. {payment.receiptNumber}
              </p>

              <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                Paid
              </span>
            </div>

            {/* Receipt details */}
            <div className="divide-y divide-border rounded-lg border border-border">
              <Row label="Student" value={studentName ?? "—"} />

              <Row label="Fee" value={feeStructureName ?? "—"} />

              <Row label="Amount Paid" value={`₹${payment.amount}`} />

              <Row
                label="Payment Method"
                value={payment.paymentMethod.replace(/_/g, " ")}
              />

              <Row
                label="Date"
                value={new Date(payment.paymentDate).toLocaleDateString(
                  "en-IN",
                )}
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
              Download Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
