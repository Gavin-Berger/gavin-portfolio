"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile, stops } from "@/content/journey";
import { live, useJourney } from "@/lib/store";
import { nearestT, scrollToT, tToScroll } from "@/lib/world";
import { ProgressRail } from "./ui/ProgressRail";
import { StopCard } from "./ui/StopCard";
import { StoryFallback } from "./ui/StoryFallback";

const Experience = dynamic(() => import("./three/Experience"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Journey() {
  // null until we know whether this device should get the 3D trail.
  const [use3D, setUse3D] = useState<boolean | null>(null);
  const [touch, setTouch] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const mode = useJourney((s) => s.mode);
  const setMode = useJourney((s) => s.setMode);
  const drag = useRef<{ x: number } | null>(null);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).has("trail");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setUse3D(hasWebGL() && (forced || !reduced));
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // Scroll drives the walker.
  useEffect(() => {
    if (!use3D) return;
    const onScroll = () => {
      if (useJourney.getState().mode !== "scroll") return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      live.scroll = max > 0 ? window.scrollY / max : 0;
      live.targetT = scrollToT(live.scroll);
      setAtStart(window.scrollY < 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [use3D]);

  // Explore mode: keyboard + drag to look around.
  useEffect(() => {
    if (mode !== "explore") return;
    document.documentElement.style.overflow = "hidden";
    live.yaw = live.heading;
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") return exitExplore();
      if (["w", "a", "s", "d", "q", "e", "shift", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
        live.keys.add(k);
      }
    };
    const up = (e: KeyboardEvent) => live.keys.delete(e.key.toLowerCase());
    const blur = () => live.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      document.documentElement.style.overflow = "";
      live.keys.clear();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
    // exitExplore only reads stable module state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function enterExplore() {
    setMode("explore");
  }

  function exitExplore() {
    const t = nearestT(live.pos.x, live.pos.z);
    live.t = live.targetT = t;
    setMode("scroll");
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: tToScroll(t) * max, behavior: "instant" as ScrollBehavior });
    });
  }

  if (use3D === false) {
    return <StoryFallback />;
  }

  return (
    <>
      {/* Crawlers and screen readers get the whole story as text. */}
      <div className="sr-only">
        <StoryFallback showTrailLink={false} />
      </div>

      <div
        className="fixed inset-0 z-0"
        onPointerDown={(e) => mode === "explore" && (drag.current = { x: e.clientX })}
        onPointerMove={(e) => {
          if (!drag.current) return;
          live.yaw -= (e.clientX - drag.current.x) * 0.006;
          drag.current.x = e.clientX;
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
        style={{ cursor: mode === "explore" ? "grab" : undefined }}
      >
        {use3D && <Experience />}
      </div>

      {/* Scroll length: one screen-and-a-bit per gap between stops. */}
      <div aria-hidden style={{ height: `${(stops.length - 1) * 110 + 100}vh` }} />

      <div className="pointer-events-none fixed inset-0 z-10">
        <header className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link href="/" className="font-display rounded-full bg-[color:var(--paper)]/80 px-3 py-1.5 text-sm font-bold text-[color:var(--ink)] shadow-sm backdrop-blur">
            {profile.name}
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/story"
              className="rounded-full bg-[color:var(--paper)]/80 px-3 py-1.5 text-sm font-medium text-[color:var(--ink)] shadow-sm backdrop-blur hover:bg-[color:var(--paper)]"
            >
              Read as page
            </Link>
            {!touch && (
              <button
                onClick={() => (mode === "explore" ? exitExplore() : enterExplore())}
                className="rounded-full bg-[color:var(--ink)] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                {mode === "explore" ? "Back to scroll" : "Explore mode"}
              </button>
            )}
            <a
              href={`mailto:${profile.email}`}
              className="hidden rounded-full bg-[color:var(--trail)] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 sm:inline-block"
            >
              Contact
            </a>
          </div>
        </header>

        {mode === "scroll" && atStart && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-sm font-medium text-[color:var(--ink)]/80">
            <span className="scroll-hint block">Scroll to start walking ↓</span>
          </div>
        )}
        {mode === "explore" && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--ink)]/80 px-4 py-2 text-xs text-white backdrop-blur">
            WASD / arrows to walk · Shift to jog · drag or Q/E to look · Esc to exit
          </div>
        )}
      </div>

      <StopCard />
      <ProgressRail />
    </>
  );
}
