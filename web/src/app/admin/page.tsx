import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminOverviewData } from "@/components/admin-overview-data";

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Store overview</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <AdminSidebar />

        <AdminOverviewData />
      </div>
    </main>
  );
}
