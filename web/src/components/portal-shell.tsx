"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { clearAdminToken, getAdminToken } from "@/lib/admin-api";
import { getApiBaseUrl } from "@/lib/api-url";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  async function signOutAdmin() {
    const token = getAdminToken();
    if (token) {
      try {
        await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Clear the local session even if the API cannot be reached.
      }
    }
    clearAdminToken();
    router.replace("/admin/login");
  }

  if (isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f7f9]">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8">
            <Link href="/admin" aria-label="Admin dashboard" className="flex min-w-0 items-center gap-4">
              <BrandLogo compact />
              <span className="hidden h-8 border-l border-slate-200 sm:block" />
              <span className="hidden text-xs font-bold uppercase tracking-[0.16em] text-slate-500 sm:block">Store management</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/" aria-label="View storefront" title="View storefront" className="inline-flex h-9 items-center gap-2 border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-400">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View storefront</span>
              </Link>
              {!isAdminLogin && (
                <button type="button" onClick={signOutAdmin} aria-label="Sign out" title="Sign out" className="inline-flex h-9 items-center gap-2 px-2 text-sm font-medium text-slate-600 transition hover:text-slate-950">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}