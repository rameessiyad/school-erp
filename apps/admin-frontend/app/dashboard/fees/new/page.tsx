import { PaymentForm } from "@/components/fees/payment-form";

export default function NewPaymentPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">Finance</p>

        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Record Payment
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Log an offline fee payment for a student.
        </p>
      </div>

      <div className="w-auto">
        <PaymentForm />
      </div>
    </div>
  );
}
