import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <div className="flex h-full">
        <DashboardSidebar user={user} />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
            <div>
              <h2 className="text-sm font-medium text-slate-500">
                School Administration
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-800">
                  {user.email ?? "Administrator"}
                </p>

                <p className="text-xs text-slate-500">{user.role}</p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {(user.email?.[0] ?? "A").toUpperCase()}
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
