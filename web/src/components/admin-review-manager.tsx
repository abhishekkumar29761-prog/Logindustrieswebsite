"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, MessageSquareText, Star, X } from "lucide-react";

import { adminRequest, getAdminToken, getServerAdminToken, subscribeToAdminAuth } from "@/lib/admin-api";

type ReviewStatus = "pending" | "approved" | "rejected";
type AdminReview = {
  id: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  created_at: string;
  profiles: { full_name: string } | null;
  products: { name: string; slug: string } | null;
};

export function AdminReviewManager() {
  const token = useSyncExternalStore(subscribeToAdminAuth, getAdminToken, getServerAdminToken);
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const query = filter === "all" ? "" : `?status=${filter}`;
    adminRequest<{ items: AdminReview[] }>(`/api/admin/reviews${query}`, token)
      .then((result) => {
        setReviews(result.items);
        setError("");
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load reviews."));
  }, [filter, token]);

  async function moderate(reviewId: string, status: "approved" | "rejected") {
    if (!token) return;
    try {
      const result = await adminRequest<{ item: AdminReview }>(`/api/admin/reviews/${encodeURIComponent(reviewId)}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setReviews((current) => filter === "all"
        ? current.map((review) => review.id === reviewId ? result.item : review)
        : current.filter((review) => review.id !== reviewId));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update review.");
    }
  }

  if (!token) {
    return (
      <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
        <MessageSquareText className="h-9 w-9 text-slate-400" />
        <h2 className="mt-4 text-lg font-semibold text-slate-950">Sign in to manage reviews</h2>
        <p className="mt-2 max-w-md text-sm text-slate-600">Admin access is required to approve or reject customer reviews.</p>
        <Link href="/admin/login" className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-[#102b43] px-4 text-sm font-semibold text-white">Admin sign in</Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-lg font-bold text-slate-950">Product reviews</h2><p className="mt-1 text-sm text-slate-500">{reviews.length} {filter} reviews</p></div>
        <label className="text-xs font-semibold text-slate-500">Filter
          <select value={filter} onChange={(event) => setFilter(event.target.value as ReviewStatus | "all")} className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
            <option value="pending">Awaiting approval</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All reviews</option>
          </select>
        </label>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {!reviews.length ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center"><MessageSquareText className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm text-slate-600">{filter === "pending" ? "No reviews are waiting for approval." : "No reviews in this view."}</p></div>
      ) : (
        <div className="divide-y divide-slate-100">
          {reviews.map((review) => (
            <article key={review.id} className="py-5 first:pt-1 last:pb-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {review.products ? <Link href={`/product/${review.products.slug}`} target="_blank" className="text-sm font-semibold text-blue-900 hover:underline">{review.products.name}</Link> : <p className="text-sm font-semibold text-slate-900">Product no longer available</p>}
                  <div className="mt-2 flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className={`h-4 w-4 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />)}
                    <span className="ml-1 text-xs text-slate-500">{review.rating}/5</span>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">{review.title}</h3>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">{review.body}</p>
                  <p className="mt-2 text-xs text-slate-500">{review.profiles?.full_name || "Customer"} · {new Date(review.created_at).toLocaleDateString("en-IN")} · <span className="capitalize">{review.status}</span></p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {review.status !== "approved" && <button type="button" onClick={() => moderate(review.id, "approved")} aria-label="Approve review" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white transition hover:bg-emerald-800"><Check className="h-4 w-4" />Approve</button>}
                  {review.status !== "rejected" && <button type="button" onClick={() => moderate(review.id, "rejected")} aria-label="Reject review" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"><X className="h-4 w-4" />Reject</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
