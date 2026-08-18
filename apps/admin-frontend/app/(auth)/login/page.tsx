import { GraduationCap } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { LoginBrandPanel } from "@/components/auth/login-brand-panel";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-background lg:grid lg:grid-cols-2">
      <LoginBrandPanel />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
        {/* Background glow */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          {/* Brand */}
          <div className="mb-7 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>

            <span className="text-lg font-semibold tracking-tight text-text-primary">
              School ERP
            </span>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
