import Link from "next/link";
import { profile, stops } from "@/content/journey";
import { MaybePhoto } from "./MaybePhoto";

/** The whole journey as a plain page: for reduced motion, no WebGL, screen readers and search engines. */
export function StoryFallback({ showTrailLink = true }: { showTrailLink?: boolean }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <header>
        <MaybePhoto photo={profile.portrait} className="mb-6 h-28 w-28 rounded-full border-4 border-white object-cover shadow-md" />
        <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--trail)]">{profile.role}</p>
        <h1 className="font-display mt-2 text-4xl font-bold text-[color:var(--ink)] sm:text-5xl">{profile.name}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--ink)]/80">{profile.tagline}</p>
        {showTrailLink && (
          <p className="mt-4 text-sm">
            <Link href="/?trail=1" className="underline decoration-[color:var(--trail)] underline-offset-4">
              Walk the 3D trail instead
            </Link>
          </p>
        )}
      </header>
      <ol className="mt-12 space-y-10 border-l-2 border-dashed border-[color:var(--ink)]/15 pl-6">
        {stops.map((s) => (
          <li key={s.id} className="relative">
            <span className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-white" style={{ background: s.accent }} />
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: s.accent }}>
              {s.chapter}
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold text-[color:var(--ink)]">{s.title}</h2>
            {s.period && <p className="text-sm text-[color:var(--muted)]">{s.period}</p>}
            {s.photo && s.photo !== profile.portrait && (
              <MaybePhoto photo={s.photo} className="mt-3 aspect-[16/10] w-full rounded-xl object-cover" />
            )}
            <p className="mt-2 leading-relaxed text-[color:var(--ink)]/85">{s.body}</p>
            {s.bullets && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[color:var(--ink)]/80">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            {s.links && (
              <p className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                {s.links.map((l) => (
                  <a key={l.href} href={l.href} className="underline underline-offset-4" style={{ textDecorationColor: s.accent }}>
                    {l.label}
                  </a>
                ))}
              </p>
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}
