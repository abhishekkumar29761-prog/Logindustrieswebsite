"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";

import { getCustomerToken, getServerCustomerToken, subscribeToCustomerAuth } from "@/lib/auth-store";
import { getApiBaseUrl } from "@/lib/api-url";
import { googleProfileUrl } from "@/lib/google-reviews";

type Review = {
  id: string;
  rating: number;
  title: string;
  body: string;
  customer_name: string;
  verified_purchase: boolean;
  created_at: string;
};

type OwnReview = { id: string; rating: number; title: string; body: string; status: string };

function Stars({ rating, label }: { rating: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={label || `${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} aria-hidden="true" className={`h-4 w-4 ${index < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
      ))}
    </span>
  );
}

export function ProductReviews({ slug, productName }: { slug: string; productName: string }) {
  const token = useSyncExternalStore(subscribeToCustomerAuth, getCustomerToken, getServerCustomerToken);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ownReviewEntry, setOwnReviewEntry] = useState<{ token: string; review: OwnReview | null } | null>(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/products/${encodeURIComponent(slug)}/reviews`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load product reviews.");
        if (active) setReviews(Array.isArray(result.items) ? result.items : []);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load product reviews.");
      }
    }
    void loadReviews();
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    let active = true;
    if (!token) return () => { active = false; };
    fetch(`${getApiBaseUrl()}/api/account/reviews`, {
      headers: { Authorization: "Bearer " + token },
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load your review.");
      const existing = (result.items || []).find((item: { products?: { slug?: string } }) => item.products?.slug === slug);
      if (!active) return;
      setOwnReviewEntry({ token, review: existing || null });
      if (existing) {
        setRating(existing.rating);
        setTitle(existing.title);
        setBody(existing.body);
      }
    }).catch((error: unknown) => {
      if (active) setMessage(error instanceof Error ? error.message : "Could not load your review.");
    });
    return () => { active = false; };
  }, [slug, token]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setMessage("");
    setSubmitting(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/account/products/${encodeURIComponent(slug)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ rating, title, body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit your review.");
      setOwnReviewEntry({ token, review: result.item });
      setMessage(result.message || "Your review was submitted for approval.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const ownReview = ownReviewEntry?.token === token ? ownReviewEntry.review : null;

  return (
    <section aria-labelledby="product-reviews-heading" className="mt-14 border-t border-blue-100 pt-10 sm:mt-16 sm:pt-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.65fr)] lg:gap-12">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-800">Customer feedback</p>
              <h2 id="product-reviews-heading" className="mt-2 text-2xl font-black text-[#102b43] sm:text-3xl">Ratings & reviews</h2>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
                <span className="text-2xl font-black text-[#102b43]">{average.toFixed(1)}</span>
                <div><Stars rating={Math.round(average)} /><p className="text-xs text-slate-500">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p></div>
              </div>
            )}
          </div>

          {loadError ? (
            <p role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{loadError}</p>
          ) : reviews.length ? (
            <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-5">
              {reviews.map((review) => (
                <article key={review.id} className="py-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars rating={review.rating} />
                    <time className="text-xs text-slate-500" dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("en-IN")}</time>
                  </div>
                  <h3 className="mt-2 font-bold text-slate-900">{review.title}</h3>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">{review.body}</p>
                  <p className="mt-3 text-xs font-medium text-slate-500">{review.customer_name} <span className="mx-1 text-slate-300">·</span><span className="text-emerald-700">Verified purchase</span></p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 px-5 py-8 text-center">
              <Stars rating={0} />
              <p className="mt-2 font-semibold text-slate-800">No reviews yet</p>
              <p className="mt-1 text-sm text-slate-600">Be the first customer to share your experience.</p>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
          <h3 className="text-lg font-bold text-[#102b43]">{ownReview ? "Update your review" : "Rate this product"}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">Only customers whose order was delivered can review {productName}. Reviews appear after approval.</p>
          <a href={googleProfileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-900 transition hover:border-blue-400 hover:bg-blue-50">
            Also review us on Google <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {!token ? (
            <Link href={`/user?next=${encodeURIComponent(`/product/${slug}`)}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#102b43] px-4 text-sm font-semibold text-white transition hover:bg-blue-900">
              Sign in to review
            </Link>
          ) : (
            <form onSubmit={submitReview} className="mt-5 space-y-4">
              <fieldset>
                <legend className="text-sm font-semibold text-slate-800">Your rating</legend>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;
                    return (
                      <button key={value} type="button" onClick={() => setRating(value)} aria-label={`Rate ${value} out of 5 stars`} aria-pressed={rating === value} className="rounded p-1 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                        <Star aria-hidden="true" className={`h-7 w-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <label className="block text-sm font-semibold text-slate-800">Review title<input required minLength={3} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What stood out?" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              <label className="block text-sm font-semibold text-slate-800">Your experience<textarea required minLength={10} maxLength={2000} rows={4} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Tell other customers about the product..." className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
              {message && <p role="status" className="rounded-lg border border-blue-100 bg-white px-3 py-2.5 text-sm text-blue-900">{message}</p>}
              <button type="submit" disabled={submitting || rating === 0} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#102b43] px-4 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? "Submitting..." : ownReview ? "Resubmit for approval" : "Submit review"}
              </button>
            </form>
          )}
        </aside>
      </div>
    </section>
  );
}
