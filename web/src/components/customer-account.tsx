"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, PackageCheck, Save, UserRound } from "lucide-react";

import { clearCustomerToken, getCustomerToken, getServerCustomerToken, setCustomerToken, subscribeToCustomerAuth } from "@/lib/auth-store";

type AccountSection = "profile" | "orders" | "addresses";
type Profile = { fullName: string; email: string; phone: string; address: string; city: string; postalCode: string };
type Order = { id: string; order_number: string; status: string; payment_status: string; total: number; created_at: string };

const emptyProfile: Profile = { fullName: "", email: "", phone: "", address: "", city: "", postalCode: "" };
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function accountFetch(path: string, token: string, init?: RequestInit) {
  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
  });
}

function addressFields(value: Record<string, unknown> | null | undefined) {
  return {
    address: typeof value?.address === "string" ? value.address : "",
    city: typeof value?.city === "string" ? value.city : "",
    postalCode: typeof value?.postal_code === "string" ? value.postal_code : "",
  };
}

export function CustomerAccount() {
  const token = useSyncExternalStore(subscribeToCustomerAuth, getCustomerToken, getServerCustomerToken);
  const router = useRouter();
  const [section, setSection] = useState<AccountSection>("profile");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    Promise.all([
      accountFetch("/api/account/profile", token),
      accountFetch("/api/account/orders", token),
    ]).then(async ([profileResponse, ordersResponse]) => {
      if (profileResponse.status === 401 || profileResponse.status === 403) {
        clearCustomerToken();
        throw new Error("Please sign in again to access your account.");
      }
      const profileBody = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profileBody.error || "Could not load profile.");
      const ordersBody = ordersResponse.ok ? await ordersResponse.json() : { items: [] };
      if (!active) return;
      const item = profileBody.item;
      setProfile({
        fullName: item.full_name || "",
        email: item.email || "",
        phone: item.phone || "",
        ...addressFields(item.shipping_address),
      });
      setOrders(Array.isArray(ordersBody.items) ? ordersBody.items : []);
    }).catch((error: unknown) => {
      if (active) setMessage(error instanceof Error ? error.message : "Unable to load account data.");
    });
    return () => { active = false; };
  }, [token]);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
      fullName: form.get("fullName"),
      phone: form.get("phone"),
    };
    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Authentication failed.");
      if (authMode === "register" && !result.session?.access_token) {
        setMessage("Account created. Check your email to confirm it, then sign in.");
        setAuthMode("login");
        return;
      }
      if (authMode === "login" && result.profile?.role !== "customer") throw new Error("This account does not have customer access.");
      setCustomerToken(result.session.access_token);
      const nextPath = new URLSearchParams(window.location.search).get("next");
      if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) router.replace(nextPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setMessage("");
    try {
      const response = await accountFetch("/api/account/profile", token, {
        method: "PATCH",
        body: JSON.stringify({
          full_name: profile.fullName,
          phone: profile.phone,
          shipping_address: { address: profile.address, city: profile.city, postal_code: profile.postalCode },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save profile.");
      setSaved(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile.");
    }
  }

  async function signOut() {
    if (token) {
      try { await accountFetch("/api/auth/logout", token, { method: "POST" }); } catch { /* Local token is still cleared. */ }
    }
    clearCustomerToken();
    setOrders([]);
    setProfile(emptyProfile);
    setSaved(false);
    setMessage("");
  }

  function updateProfile(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  const tabs: { id: AccountSection; label: string; icon: typeof UserRound }[] = [
    { id: "profile", label: "Personal details", icon: UserRound },
    { id: "orders", label: "Orders", icon: PackageCheck },
    { id: "addresses", label: "Address book", icon: MapPin },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="border-b border-slate-200 pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-900">Customer account</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Your profile</h1>
        <p className="mt-2 text-sm text-slate-600">Manage your contact details, delivery address, and orders.</p>
      </div>

      <div className="grid gap-8 py-8 md:grid-cols-[240px_1fr]">
        <nav aria-label="Account sections" className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setSection(id)} aria-current={section === id ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-3 border px-4 py-3 text-left text-sm font-semibold transition md:border-0 ${section === id ? "border-cyan-900 bg-[#102b43] text-white md:bg-[#edf4f6] md:text-[#102b43]" : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
          {token && <button type="button" onClick={signOut} className="inline-flex shrink-0 items-center gap-3 px-4 py-3 text-left text-sm text-slate-500 hover:text-slate-900 md:mt-3"><LogOut className="h-4 w-4" />Sign out</button>}
        </nav>

        <section className="min-h-[420px] border-t border-slate-200 pt-7 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          {!token ? (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-slate-950">{authMode === "login" ? "Sign in to your account" : "Create your account"}</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to save your details and view orders.</p>
              <form onSubmit={authenticate} className="mt-6 space-y-4">
                {authMode === "register" && <label className="block text-sm font-medium text-slate-700">Full name<input name="fullName" autoComplete="name" required className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-cyan-800" /></label>}
                <label className="block text-sm font-medium text-slate-700">Email address<input name="email" type="email" autoComplete="email" required className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-cyan-800" /></label>
                <label className="block text-sm font-medium text-slate-700">Password<input name="password" type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength={8} required className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-cyan-800" /></label>
                {authMode === "register" && <label className="block text-sm font-medium text-slate-700">Phone<input name="phone" type="tel" autoComplete="tel" className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-cyan-800" /></label>}
                <button disabled={submitting} className="min-h-11 w-full bg-[#102b43] px-5 text-sm font-semibold text-white transition hover:bg-cyan-900 disabled:opacity-60">{submitting ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}</button>
              </form>
              <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setMessage(""); }} className="mt-4 text-sm font-semibold text-cyan-900 underline underline-offset-4">
                {authMode === "login" ? "New customer? Create an account" : "Already have an account? Sign in"}
              </button>
              {!message && <p className="mt-4 text-xs leading-5 text-slate-500">Account access requires Supabase Auth to be configured for this store.</p>}
            </div>
          ) : section === "profile" || section === "addresses" ? (
            <form onSubmit={saveProfile} className="max-w-2xl">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{section === "profile" ? "Personal details" : "Delivery address"}</h2>
                  <p className="mt-1 text-sm text-slate-500">Saved to your LOG Industries customer account.</p>
                </div>
                {section === "profile" && <span className="text-xs text-slate-500">{profile.email}</span>}
              </div>
              {section === "profile" ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">Full name<input value={profile.fullName} onChange={(event) => updateProfile("fullName", event.target.value)} autoComplete="name" className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-cyan-800" /></label>
                  <label className="text-sm font-medium text-slate-700">Phone<input value={profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} autoComplete="tel" className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-cyan-800" /></label>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700 sm:col-span-2">Street address<input value={profile.address} onChange={(event) => updateProfile("address", event.target.value)} autoComplete="street-address" className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-cyan-800" /></label>
                  <label className="text-sm font-medium text-slate-700">City<input value={profile.city} onChange={(event) => updateProfile("city", event.target.value)} autoComplete="address-level2" className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-cyan-800" /></label>
                  <label className="text-sm font-medium text-slate-700">PIN code<input value={profile.postalCode} onChange={(event) => updateProfile("postalCode", event.target.value)} autoComplete="postal-code" className="mt-2 w-full border border-slate-300 px-3 py-3 outline-none focus:border-cyan-800" /></label>
                </div>
              )}
              <div className="mt-8 flex items-center gap-4 border-t border-slate-200 pt-6">
                <button type="submit" className="inline-flex min-h-11 items-center gap-2 bg-[#102b43] px-5 text-sm font-semibold text-white transition hover:bg-cyan-900"><Save className="h-4 w-4" />Save changes</button>
                {saved && <p role="status" className="text-sm text-emerald-700">Saved to your account.</p>}
              </div>
            </form>
          ) : (
            <div className="max-w-3xl">
              <div className="mb-7"><h2 className="text-xl font-bold text-slate-950">Your orders</h2><p className="mt-1 text-sm text-slate-500">Order history and delivery updates.</p></div>
              {orders.length ? <div className="divide-y divide-slate-200 border-y border-slate-200">
                {orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div><p className="font-semibold text-slate-900">{order.order_number}</p><p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString("en-IN")}</p></div>
                  <div className="text-right"><p className="font-bold text-slate-900">₹{Number(order.total).toLocaleString("en-IN")}</p><p className="text-xs font-semibold uppercase text-slate-600">{order.status} · payment {order.payment_status}</p></div>
                </div>)}
              </div> : <div className="border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><PackageCheck className="mx-auto h-8 w-8 text-slate-400" /><h3 className="mt-4 text-base font-semibold text-slate-900">No orders yet</h3><p className="mt-2 text-sm leading-6 text-slate-600">Orders placed through this account will appear here.</p><Link href="/products" className="mt-6 inline-flex min-h-10 items-center bg-[#102b43] px-4 text-sm font-semibold text-white">Browse products</Link></div>}
            </div>
          )}
          {message && <p role="alert" className="mt-5 max-w-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</p>}
        </section>
      </div>
    </main>
  );
}