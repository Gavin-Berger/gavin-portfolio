import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { profile } from "@/content/journey";
import { work } from "@/content/work";

export function generateStaticParams() {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = work.find((x) => x.slug === slug);
  return w ? { title: `${w.name} · ${profile.name}`, description: w.summary } : {};
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = work.find((x) => x.slug === slug);
  if (!w) notFound();
  const others = work.filter((x) => x.slug !== slug);

  return (
    <div style={{ background: w.theme.bg, color: w.theme.ink }} className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
        <Link href="/" className="text-sm opacity-70 hover:opacity-100">
          ← Back to the trail
        </Link>
        <header className="mt-10">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: w.theme.accent }}>
            Case study · {w.year}
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold sm:text-6xl">{w.name}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed opacity-85">{w.summary}</p>
          <dl className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="opacity-60">Role</dt>
              <dd className="mt-1">{w.role}</dd>
            </div>
            <div>
              <dt className="opacity-60">Stack</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {w.stack.map((s) => (
                  <span key={s} className="rounded-full border px-2.5 py-0.5 text-xs" style={{ borderColor: w.theme.accent + "55" }}>
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex gap-3">
            {w.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-4 py-2 text-sm font-semibold"
                style={{ background: w.theme.accent, color: w.theme.bg }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </header>

        <figure className="mt-12 overflow-hidden rounded-2xl border" style={{ borderColor: w.theme.accent + "33" }}>
          {w.hero.video ? (
            <video src={w.hero.video} poster={w.hero.src} autoPlay muted loop playsInline className="block max-h-[70vh] w-full object-cover" />
          ) : (
            <Image src={w.hero.src} alt={w.hero.alt} width={1440} height={900} className="mx-auto h-auto max-h-[75vh] w-auto" priority />
          )}
        </figure>

        <div className="mt-16 space-y-16">
          {w.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ color: w.theme.soft }}>
                {s.heading}
              </h2>
              <p className="mt-4 max-w-2xl text-[17px] leading-relaxed opacity-85">{s.body}</p>
              {s.image && (
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  width={1440}
                  height={900}
                  className="mt-8 h-auto max-h-[70vh] w-full rounded-xl border object-contain"
                  style={{ borderColor: w.theme.accent + "33" }}
                />
              )}
            </section>
          ))}
        </div>

        <footer className="mt-24 flex flex-col gap-6 border-t pt-10 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: w.theme.accent + "33" }}>
          <div>
            <p className="opacity-70">Like what you see?</p>
            <a href={`mailto:${profile.email}`} className="font-display text-2xl font-bold" style={{ color: w.theme.accent }}>
              {profile.email}
            </a>
          </div>
          {others.map((o) => (
            <Link key={o.slug} href={`/work/${o.slug}`} className="text-sm opacity-80 hover:opacity-100">
              Next: {o.name} →
            </Link>
          ))}
        </footer>
      </main>
    </div>
  );
}
