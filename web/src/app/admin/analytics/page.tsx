import { AdminSidebar } from "@/components/admin-sidebar";
import { ChartNoAxesCombined } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin panel</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Analytics</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <AdminSidebar />

        <section className="flex min-h-80 flex-col items-center justify-center border border-slate-200 bg-white px-6 py-12 text-center">
          <ChartNoAxesCombined className="h-9 w-9 text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-950">Analytics will appear when store data is connected</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Traffic, sales, and conversion reports need live checkout and analytics data. No sample figures are shown.</p>
          <span className="mt-5 border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">No live analytics</span>
        </section>
      </div>
    </main>
  );
}
