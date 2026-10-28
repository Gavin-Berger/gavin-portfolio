"use client";

import { stops } from "@/content/journey";
import { live, useJourney } from "@/lib/store";
import { tToScroll } from "@/lib/world";

export function goToStop(i: number) {
  if (useJourney.getState().mode === "explore") {
    live.teleportTo = i;
    return;
  }
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: tToScroll(stops[i].t) * max, behavior: "smooth" });
}

export function ProgressRail() {
  const active = useJourney((s) => s.activeStop);
  return (
    <nav aria-label="Journey stops" className="pointer-events-auto fixed right-3 top-1/2 z-20 hidden -translate-y-1/2 sm:block">
      <ol className="flex flex-col items-end gap-2.5">
        {stops.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => goToStop(i)}
              className="group flex items-center gap-2"
              aria-current={active === i ? "step" : undefined}
              aria-label={`Go to ${s.title}`}
            >
              <span
                className={`font-display rounded-full bg-[color:var(--paper)]/85 px-2 py-0.5 text-[11px] font-medium text-[color:var(--ink)] shadow-sm backdrop-blur transition ${
                  active === i ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                }`}
              >
                {s.chapter.replace(/^\d+ · /, "")}
              </span>
              <span
                className="block rounded-full border-2 border-white shadow transition-all"
                style={{
                  background: s.accent,
                  width: active === i ? 14 : 10,
                  height: active === i ? 14 : 10,
                }}
              />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
