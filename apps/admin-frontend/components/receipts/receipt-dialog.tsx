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

    const student = studentName ?? "—";
    const feeName = feeStructureName ?? "—";
    const collectedBy = payment.collectedBy?.email ?? "—";

    // =========================================================
    // PAGE CONSTANTS
    // =========================================================

    const pageWidth = 210;
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    // =========================================================
    // COLORS
    // =========================================================

    const primary = {
      r: 30,
      g: 41,
      b: 59,
    };

    const secondary = {
      r: 100,
      g: 116,
      b: 139,
    };

    const muted = {
      r: 148,
      g: 163,
      b: 184,
    };

    const border = {
      r: 226,
      g: 232,
      b: 240,
    };

    const light = {
      r: 248,
      g: 250,
      b: 252,
    };

    const white = {
      r: 255,
      g: 255,
      b: 255,
    };

    // =========================================================
    // HELPER FUNCTIONS
    // =========================================================

    const setPrimary = () => {
      doc.setTextColor(primary.r, primary.g, primary.b);
    };

    const setSecondary = () => {
      doc.setTextColor(secondary.r, secondary.g, secondary.b);
    };

    const setBorder = () => {
      doc.setDrawColor(border.r, border.g, border.b);
    };

    const drawLabel = (text: string, x: number, y: number) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      setSecondary();
      doc.text(text, x, y);
    };

    const drawValue = (
      text: string,
      x: number,
      y: number,
      options?: {
        align?: "left" | "center" | "right";
        size?: number;
      },
    ) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(options?.size ?? 10);
      setPrimary();

      doc.text(text, x, y, {
        align: options?.align ?? "left",
      });
    };

    // =========================================================
    // PAGE BACKGROUND
    // =========================================================

    doc.setFillColor(white.r, white.g, white.b);

    doc.rect(0, 0, pageWidth, 297, "F");

    // =========================================================
    // TOP BRANDING
    // =========================================================

    // Header background
    doc.setFillColor(light.r, light.g, light.b);

    doc.roundedRect(margin, 16, contentWidth, 42, 4, 4, "F");

    // Small vertical brand line
    doc.setFillColor(primary.r, primary.g, primary.b);

    doc.roundedRect(margin + 7, 24, 2, 25, 1, 1, "F");

    // SKOLA DECK
    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    setPrimary();

    doc.text("SKOLA DECK", margin + 15, 31);

    // School name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setSecondary();

    doc.text(SCHOOL_NAME, margin + 15, 39);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(muted.r, muted.g, muted.b);

    doc.text("School Management System", margin + 15, 46);

    // =========================================================
    // RECEIPT BADGE
    // =========================================================

    const badgeX = 151;
    const badgeY = 23;
    const badgeW = 39;
    const badgeH = 27;

    doc.setFillColor(primary.r, primary.g, primary.b);

    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(white.r, white.g, white.b);

    doc.text("OFFICIAL", badgeX + badgeW / 2, badgeY + 9, {
      align: "center",
    });

    doc.setFontSize(10);

    doc.text("RECEIPT", badgeX + badgeW / 2, badgeY + 18, {
      align: "center",
    });

    // =========================================================
    // RECEIPT META
    // =========================================================

    const metaY = 72;

    // Receipt number
    drawLabel("RECEIPT NUMBER", margin, metaY);

    drawValue(receiptNumber, margin, metaY + 8, {
      size: 10,
    });

    // Date
    drawLabel("PAYMENT DATE", pageWidth - margin, metaY);

    drawValue(date, pageWidth - margin, metaY + 8, {
      align: "right",
      size: 10,
    });

    // Divider
    setBorder();
    doc.setLineWidth(0.4);

    doc.line(margin, 86, pageWidth - margin, 86);

    // =========================================================
    // STUDENT INFORMATION
    // =========================================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setPrimary();

    doc.text("Student Information", margin, 100);

    // Student card
    doc.setFillColor(light.r, light.g, light.b);

    doc.roundedRect(margin, 106, contentWidth, 30, 3, 3, "F");

    // Student label
    drawLabel("STUDENT NAME", margin + 8, 116);

    // Student name
    const studentLines = doc.splitTextToSize(student, 105);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setPrimary();

    doc.text(studentLines, margin + 8, 125);

    // Status
    const statusX = 160;
    const statusY = 116;

    drawLabel("STATUS", statusX, statusY);

    doc.setFillColor(240, 253, 244);

    doc.roundedRect(statusX, 120, 20, 8, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);

    doc.setTextColor(22, 101, 52);

    doc.text("PAID", statusX + 10, 125.5, {
      align: "center",
    });

    // =========================================================
    // PAYMENT DETAILS
    // =========================================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setPrimary();

    doc.text("Payment Details", margin, 153);

    // Table
    const tableX = margin;
    const tableY = 160;
    const tableW = contentWidth;
    const rowH = 15;

    // Header
    doc.setFillColor(primary.r, primary.g, primary.b);

    doc.roundedRect(tableX, tableY, tableW, 12, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(white.r, white.g, white.b);

    doc.text("DESCRIPTION", tableX + 8, tableY + 7.5);

    doc.text("DETAILS", tableX + tableW - 8, tableY + 7.5, {
      align: "right",
    });

    // Table rows
    const rows = [
      {
        label: "Fee",
        value: feeName,
      },
      {
        label: "Payment Method",
        value: paymentMethod,
      },
      {
        label: "Collected By",
        value: collectedBy,
      },
    ];

    let currentY = tableY + 12;

    rows.forEach((row, index) => {
      const isLast = index === rows.length - 1;

      // Row background
      if (index % 2 === 0) {
        doc.setFillColor(251, 252, 253);

        doc.rect(tableX, currentY, tableW, rowH, "F");
      }

      // Label
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setSecondary();

      doc.text(row.label, tableX + 8, currentY + 9);

      // Value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      setPrimary();

      const valueLines = doc.splitTextToSize(row.value, 95);

      // For long values, start slightly higher
      const valueY = valueLines.length > 1 ? currentY + 6 : currentY + 9;

      doc.text(valueLines, tableX + tableW - 8, valueY, {
        align: "right",
      });

      // Row divider
      if (!isLast) {
        setBorder();
        doc.setLineWidth(0.3);

        doc.line(
          tableX + 7,
          currentY + rowH,
          tableX + tableW - 7,
          currentY + rowH,
        );
      }

      currentY += rowH;
    });

    // Outer table border
    setBorder();

    doc.setLineWidth(0.5);

    doc.roundedRect(tableX, tableY, tableW, 12 + rowH * rows.length, 3, 3);

    // =========================================================
    // TOTAL AMOUNT
    // =========================================================

    const totalY = currentY + 13;

    doc.setFillColor(light.r, light.g, light.b);

    doc.roundedRect(margin, totalY, contentWidth, 34, 4, 4, "F");

    drawLabel("TOTAL AMOUNT PAID", margin + 10, totalY + 13);

    // Amount
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    setPrimary();

    doc.text(
      `Rs. ${amount.toLocaleString("en-IN")}`,
      pageWidth - margin - 10,
      totalY + 20,
      {
        align: "right",
      },
    );

    // =========================================================
    // SIGNATURE SECTION
    // =========================================================

    const signatureY = totalY + 53;

    // Left signature
    doc.setDrawColor(203, 213, 225);

    doc.setLineWidth(0.4);

    doc.line(margin, signatureY, margin + 58, signatureY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);

    setSecondary();

    doc.text("Authorized Signature", margin, signatureY + 6);

    // Right signature
    doc.line(
      pageWidth - margin - 58,
      signatureY,
      pageWidth - margin,
      signatureY,
    );

    doc.text("Parent / Student", pageWidth - margin - 58, signatureY + 6);

    // =========================================================
    // FOOTER
    // =========================================================

    const footerY = 276;

    setBorder();

    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);

    setPrimary();

    doc.text("SKOLA DECK", margin, footerY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    doc.setTextColor(muted.r, muted.g, muted.b);

    doc.text("School Management System", margin + 27, footerY + 8);

    doc.text("Computer-generated receipt", pageWidth - margin, footerY + 8, {
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
