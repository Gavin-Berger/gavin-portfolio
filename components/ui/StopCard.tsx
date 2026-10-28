"use client";

import Link from "next/link";
import { stops } from "@/content/journey";
import { useJourney } from "@/lib/store";
import { MaybePhoto } from "./MaybePhoto";

export function StopCard() {
  const active = useJourney((s) => s.activeStop);
  const stop = active >= 0 ? stops[active] : null;
  if (!stop) return null;
  // The first and last stops show a round portrait; the rest get a photo across the top.
  const portraitStop = stop.id === "trailhead" || stop.id === "summit";

  return (
    <article
      key={stop.id}
      aria-hidden
      className="card-in pointer-events-auto fixed inset-x-3 bottom-3 z-20 max-h-[46vh] overflow-y-auto rounded-2xl border border-white/40 bg-[color:var(--paper)]/90 p-5 shadow-[0_20px_60px_-20px_rgba(20,20,40,.45)] backdrop-blur-md sm:inset-x-auto sm:bottom-auto sm:left-8 sm:top-1/2 sm:max-h-[80vh] sm:w-[400px] sm:-translate-y-1/2 sm:p-7"
      style={{ ["--accent" as string]: stop.accent }}
    >
      {stop.photo && portraitStop && (
        <MaybePhoto photo={stop.photo} className="mb-4 h-20 w-20 rounded-full border-4 border-white object-cover shadow-md sm:h-24 sm:w-24" />
      )}
      {stop.photo && !portraitStop && (
        <MaybePhoto photo={stop.photo} className="-mx-5 -mt-5 mb-4 aspect-[16/10] w-[calc(100%+2.5rem)] max-w-none rounded-t-2xl object-cover sm:-mx-7 sm:-mt-7 sm:w-[calc(100%+3.5rem)]" />
      )}
      <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">{stop.chapter}</p>
      <h2 className="font-display mt-2 text-2xl font-bold leading-tight text-[color:var(--ink)] sm:text-3xl">{stop.title}</h2>
      {stop.period && <p className="mt-1 text-sm text-[color:var(--muted)]">{stop.period}</p>}
      <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink)]/85">{stop.body}</p>
      {stop.bullets && (
        <ul className="mt-3 space-y-1.5 text-sm text-[color:var(--ink)]/80">
          {stop.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
              {b}
            </li>
          ))}
        </ul>
      )}
      {stop.tags && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {stop.tags.map((t) => (
            <li key={t} className="rounded-full border border-[color:var(--ink)]/10 bg-white/60 px-2.5 py-0.5 text-xs text-[color:var(--ink)]/75">
              {t}
            </li>
          ))}
        </ul>
      )}
      {stop.links && (
        <div className="mt-5 flex flex-wrap gap-2">
          {stop.links.map((l, i) => {
            const cls =
              i === 0
                ? "rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                : "rounded-full border border-[color:var(--ink)]/15 px-4 py-2 text-sm font-medium text-[color:var(--ink)] transition hover:bg-white/70";
            return l.href.startsWith("/") ? (
              <Link key={l.href} href={l.href} className={cls}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className={cls} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {l.label}
              </a>
            );
          })}
        </div>
      )}
    </article>
  );
}
