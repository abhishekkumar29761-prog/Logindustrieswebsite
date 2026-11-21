"use client";

import { useState } from "react";

const previewLength = 200;

export function ProductDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const shouldCollapse = description.length > previewLength;
  const preview = description.slice(0, previewLength).replace(/\s+\S*$/, "").trimEnd();

  return (
    <section className="mt-6 border-t border-slate-200 pt-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">Product description</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
        {shouldCollapse && !expanded ? `${preview}…` : description}
      </p>
      {shouldCollapse && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 text-sm font-semibold text-cyan-900 underline-offset-4 hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </section>
  );
}
