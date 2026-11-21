import type { ReactNode } from "react";

type InfoSection = { title: string; paragraphs: ReactNode[] };

export function InfoPage({ title, intro, sections }: { title: string; intro: string; sections: InfoSection[] }) {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-800">LOG Industries</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{intro}</p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
