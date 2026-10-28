// Case studies for the two flagship projects. Each one follows problem → design → build.

export type CaseStudy = {
  slug: string;
  name: string;
  summary: string;
  role: string;
  year: string;
  stack: string[];
  links: { label: string; href: string }[];
  theme: { bg: string; ink: string; accent: string; soft: string };
  hero: { src: string; alt: string; video?: string };
  sections: { heading: string; body: string; image?: { src: string; alt: string } }[];
};

export const work: CaseStudy[] = [
  {
    slug: "recall",
    name: "Recall Studio",
    summary: "Local-first session memory for Ableton Live. Version control for music production.",
    role: "Solo: product, design, engineering",
    year: "2026 – present",
    stack: ["Rust", "Tauri v2", "React 19", "TypeScript", "SQLite", "Python", "Max for Live", "Cloudflare Workers"],
    links: [
      { label: "recallstudios.net", href: "https://recallstudios.net" },
    ],
    theme: { bg: "#05060f", ink: "#e9e7ff", accent: "#8578ff", soft: "#c6c0ff" },
    hero: { src: "/media/recall/timeline-endstate-1440.png", alt: "Recall's timeline view", video: "/media/recall/recall-square.mp4" },
    sections: [
      {
        heading: "The problem",
        body: "Producers lose great ideas constantly. A sound comes together at 2am, then ten tweaks later it's gone, and Ableton's undo history doesn't survive closing the project. Saving copies by hand breaks your flow, and nobody remembers which file had the good version.",
      },
      {
        heading: "The design",
        body: "Recall stays out of the way. It records factual changes (tracks, devices, parameters, clips, tempo) automatically, and lets you pin the creative moments yourself: rough, working, keeper, final. I built the UI around a 'midnight glass' system: near-black, one violet signal color for activity, and warm gold reserved for your moments, so the things you chose always stand out from the things that just happened.",
        image: { src: "/media/recall/final-startup-1440x900.png", alt: "Recall startup screen" },
      },
      {
        heading: "The build",
        body: "A Python control surface inside Ableton streams newline-delimited JSON over a local socket to a Rust backend, which writes to SQLite. The Tauri + React front end reads it as a browsable project → track → device → parameter tree and a timeline. No account, no cloud: nothing leaves the machine unless you create a share link, which runs on a Cloudflare Worker with R2 and D1.",
      },
      {
        heading: "Built to be trusted",
        body: "Because it's a memory tool, losing data is the one unforgivable bug. The project is covered by Vitest, Playwright and pytest suites, with CI on every push and a release pipeline that builds the installers.",
        image: { src: "/media/recall/version-reader-390-check.png", alt: "Recall version reader on a narrow window" },
      },
    ],
  },
  {
    slug: "frs",
    name: "FRS Sound",
    summary: "A booking site for Front Right Stack, an Atlanta sound system rooted in bass music, built around a real-time 3D speaker stack.",
    role: "Design & development",
    year: "2026",
    stack: ["Astro", "TypeScript", "three.js", "Web Animations API", "Cloudflare Workers", "Formspree"],
    links: [{ label: "Instagram", href: "https://www.instagram.com/frs.sound/" }],
    theme: { bg: "#0D0C0B", ink: "#F3EEE6", accent: "#F28C1B", soft: "#FFB15C" },
    hero: { src: "/media/frs/frs-poster.webp", alt: "FRS Sound poster" },
    sections: [
      {
        heading: "The brief",
        body: "Promoters, artists and venues needed one place to see the rig and reach out about booking. The site had to feel like standing in front of the stack: heavy, warm, and loud, without being slow on a phone.",
      },
      {
        heading: "The design",
        body: "I built a 'Grille' system from the hardware itself: a black ground, speaker-grille dot textures, one hot orange, Bebas Neue headlines and Work Sans for reading. The headline says it plainly: Atlanta's sound system, built to be felt.",
      },
      {
        heading: "The 3D stack",
        body: "The hero is a three.js speaker stack modeled entirely in code. Visitors can orbit it, pull out a cabinet to read its specs, or explode it into parts. A shared 92 BPM beat clock drives both the 3D cones and the CSS pulses, so every thump on the page lands on the same beat.",
      },
      {
        heading: "Shipping it",
        body: "Astro renders it as a static site served from Cloudflare. The booking form works with or without JavaScript, a floating 'Reach out' button keeps contact one tap away on phones, and every push is built in CI.",
      },
    ],
  },
];
