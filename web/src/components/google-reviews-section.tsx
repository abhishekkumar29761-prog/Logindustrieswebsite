import { ExternalLink, Star } from "lucide-react";

const googleProfileUrl = "https://www.google.com/search?q=logindustries";

export function GoogleReviewsSection() {
  return (
    <section aria-labelledby="google-reviews-heading" className="border-y border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-sky-100/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-10 text-center sm:px-8 sm:py-12 md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-800">Trusted by our customers</p>
          <h2 id="google-reviews-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-[#102b43] sm:text-3xl">What customers say on Google</h2>
          <p className="mt-2 text-sm text-slate-600">See customer feedback or share your experience on our Google profile.</p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-5 py-3.5 shadow-sm">
            <span className="text-3xl font-black tracking-tight text-[#102b43]">5.0</span>
            <span className="text-left">
              <span className="flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, index) => <Star key={index} aria-hidden="true" className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </span>
              <span className="mt-1 block text-xs font-medium text-slate-500">23 Google reviews</span>
            </span>
          </div>
          <a
            href={googleProfileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#102b43] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            View reviews &amp; write one <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
