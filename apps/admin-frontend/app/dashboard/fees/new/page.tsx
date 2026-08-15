import { PaymentForm } from "@/components/fees/payment-form";

export default function NewPaymentPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Finance</p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Record Payment
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Log an offline fee payment for a student.
        </p>
      </div>

      <div className="max-w-3xl">
        <PaymentForm />
      </div>
    </div>
  );
}
