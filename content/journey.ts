// The whole story lives here. Zones, cards, the progress rail and the plain-HTML version
// all read from this list, so editing copy never touches 3D code.

export type ZoneKind =
  | "trailhead"
  | "college"
  | "events"
  | "music"
  | "touchgrass"
  | "builds"
  | "challenges"
  | "graduation"
  | "recall"
  | "frs"
  | "toolkit"
  | "summit";

export type Link = { label: string; href: string };

export type Photo = { src: string; alt: string };

export type Group = { label: string; items: string[] };

export type Stop = {
  id: ZoneKind;
  /** Position along the trail, 0 (trailhead) to 1 (summit). */
  t: number;
  /** Which side of the path the diorama sits on. */
  side: 1 | -1;
  chapter: string;
  title: string;
  period?: string;
  body: string;
  bullets?: string[];
  tags?: string[];
  links?: Link[];
  /**
   * A real photo for this chapter, shown on the card and framed in the 3D scene.
   * Drop the file into public/photos/; until it exists the photo is simply left out.
   */
  photo?: Photo;
  /** Grouped chips, used by the toolkit stop for skills and hobbies. */
  groups?: Group[];
  /** Accent color used on the card and progress rail. */
  accent: string;
};

export const profile = {
  name: "Gavin Berger",
  role: "Developer & Designer",
  location: "Atlanta, GA",
  email: "gavinberger96@gmail.com",
  github: "https://github.com/Gavin-Berger",
  linkedin: "https://www.linkedin.com/in/gavinberger03",
  tagline:
    "I design and build software for web, mobile and desktop, with a soft spot for anything that makes sound.",
  portrait: { src: "/photos/portrait.jpg", alt: "Gavin Berger" },
};

// UNG's blue and gold, used on the college stop.
export const ung = { blue: "#0b2a5b", gold: "#c99a2e" };

export const stops: Stop[] = [
  {
    id: "trailhead",
    t: 0,
    side: 1,
    chapter: "Trailhead",
    title: "Hi, I'm Gavin.",
    body: "I'm a developer and designer from Atlanta, and a 2026 computer science grad from the University of North Georgia. This trail is how I got here. Scroll to walk it with me.",
    tags: ["TypeScript", "React", "Rust", "Design"],
    photo: profile.portrait,
    accent: "#e8a33d",
  },
  {
    id: "college",
    t: 0.09,
    side: -1,
    chapter: "01 · College",
    title: "University of North Georgia",
    period: "B.S. Computer Science · Dahlonega · May 2026",
    body: "Up in the mountains of Dahlonega I learned the fundamentals, then kept going past them: systems, data, security, and how to work on a team that ships. Go Nighthawks.",
    bullets: ["Major GPA 3.6", "TypeScript, Python, Rust, SQL, C++, Java", "Agile teams, code review, release workflows"],
    photo: { src: "/photos/college.jpg", alt: "Gavin at the University of North Georgia" },
    accent: ung.blue,
  },
  {
    id: "events",
    t: 0.18,
    side: 1,
    chapter: "02 · Working through school",
    title: "Events by Design",
    period: "Event planning & management · Throughout college",
    body: "All through college I worked at Events by Design, planning and running events alongside my classes. It's where I learned to plan backward from a hard deadline, keep a lot of moving parts in sync, and stay calm when the plan changes on the day.",
    bullets: [
      "Planned event timelines, layouts and logistics",
      "Coordinated vendors, crews and clients on event day",
      "Solved problems live when things didn't go to plan",
    ],
    tags: ["Planning", "Project management", "Client communication"],
    photo: { src: "/photos/events.jpg", alt: "Gavin working an event for Events by Design" },
    accent: "#b5476b",
  },
  {
    id: "music",
    t: 0.27,
    side: -1,
    chapter: "03 · Side hobby",
    title: "Music, between classes",
    body: "In college I picked up Ableton Live as a side hobby, making tracks between classes and shifts. It started as a way to unwind. Then I got curious about how the tools worked, and that curiosity ended up shaping what I build.",
    tags: ["Ableton Live", "Max for Live", "Production"],
    photo: { src: "/photos/music.jpg", alt: "Gavin making music" },
    accent: "#c05bd6",
  },
  {
    id: "touchgrass",
    t: 0.36,
    side: 1,
    chapter: "04 · First apps",
    title: "TouchGrass",
    period: "Mobile app · 2025",
    body: "A cross-platform step tracker that literally tells you to go outside. Walking and running sessions, goals, achievements and progress, all stored on the device.",
    bullets: [
      "React Native + Expo, step tracking with Expo Sensors",
      "Session logs with steps, duration and timestamps",
      "Goal and achievement flows, persisted with AsyncStorage",
    ],
    tags: ["React Native", "Expo", "Mobile UX"],
    links: [{ label: "GitHub", href: "https://github.com/Gavin-Berger/Touch_Grass" }],
    photo: { src: "/photos/touchgrass.jpg", alt: "The TouchGrass app home screen" },
    accent: "#3fae5a",
  },
  {
    id: "builds",
    t: 0.45,
    side: -1,
    chapter: "05 · Website builds",
    title: "Blue Seagull Group",
    period: "Software Development Intern · 2025 – 2026",
    body: "My first real product team. I designed and built the front end of Blue Seagull Compute, a cloud computing platform, from wireframes to the shipped site.",
    bullets: [
      "Designed the wireframes, homepage, brand and in-browser IDE",
      "Helped ship 20+ features and launch blueseagull.org",
      "Built APIs and middleware, plus E2E and integration tests",
    ],
    tags: ["React Native", "Node.js", "TypeScript", "Tailwind", "Branding"],
    links: [{ label: "blueseagull.org", href: "https://blueseagull.org" }],
    accent: "#2f8fd8",
  },
  {
    id: "challenges",
    t: 0.54,
    side: 1,
    chapter: "06 · Challenges",
    title: "Don't trust a pretty backtest",
    period: "Quant trading senior project · 2026",
    body: "I designed and backtested an automated SPY strategy in Python on QuantConnect and LEAN. The hard part wasn't the code. It was being honest about results that looked better than they were.",
    bullets: [
      "Entry and exit signals, order rules, risk controls",
      "Measured profit, win rate, drawdown and trade count",
      "Debugged strategy logic to avoid misleading backtests",
    ],
    tags: ["Python", "QuantConnect", "LEAN", "Data"],
    links: [{ label: "GitHub", href: "https://github.com/Gavin-Berger/Gavin_Berger_Senior_Project_Quantative_Algrithoms" }],
    photo: { src: "/photos/challenges.jpg", alt: "Gavin in his cap and gown pointing at a stock ticker in UNG's finance and analytics lab" },
    accent: "#d9534f",
  },
  {
    id: "graduation",
    t: 0.635,
    side: -1,
    chapter: "07 · Graduation",
    title: "Class of 2026",
    period: "University of North Georgia · May 2026",
    body: "Degree in hand. From here the trail gets steeper, and the work becomes my own: two products I designed and built end to end.",
    photo: { src: "/photos/graduation.jpg", alt: "Gavin at graduation" },
    accent: ung.gold,
  },
  {
    id: "recall",
    t: 0.74,
    side: 1,
    chapter: "08 · Building",
    title: "Recall Studio",
    period: "Desktop app · 2026 – present",
    body: "The side hobby became a product. Recall is version control for music production: it quietly records every track, device, parameter and tempo change in Ableton Live, so producers can get back to the exact moment a sound came together.",
    bullets: [
      "Local event pipeline: Max for Live → JSON over UDP → Rust → SQLite",
      "Browsable project → track → device → parameter model",
      "Timeline of factual changes plus pinned creative moments",
    ],
    tags: ["Rust", "Tauri", "React", "TypeScript", "SQLite"],
    links: [
      { label: "recallstudios.net", href: "https://recallstudios.net" },
      { label: "Case study", href: "/work/recall" },
    ],
    accent: "#8578ff",
  },
  {
    id: "frs",
    t: 0.86,
    side: -1,
    chapter: "09 · Building",
    title: "FRS Sound",
    period: "Website · 2026",
    body: "Front Right Stack is an Atlanta sound system rooted in bass music. I designed and built its site around a real-time 3D speaker stack you can orbit, pull apart, and feel thump at 92 BPM.",
    bullets: [
      "three.js speaker stack built entirely in code",
      "One beat clock syncs the 3D and the CSS pulses",
      "Astro, deployed on Cloudflare, booking form that works without JS",
    ],
    tags: ["three.js", "Astro", "TypeScript", "Motion design"],
    links: [
      { label: "Case study", href: "/work/frs" },
      { label: "Instagram", href: "https://www.instagram.com/frs.sound/" },
    ],
    accent: "#F28C1B",
  },
  {
    id: "toolkit",
    t: 0.93,
    side: 1,
    chapter: "10 · Toolkit",
    title: "What I work with",
    body: "The tools I reach for, from the resume to the side projects, and what I'm up to when I'm not coding.",
    groups: [
      { label: "Languages", items: ["TypeScript", "JavaScript", "Python", "Rust", "SQL", "C++", "Java"] },
      { label: "Web, mobile & desktop", items: ["React", "React Native", "Expo", "Next.js", "Astro", "Tailwind CSS", "Tauri", "Node.js", "Vite", "three.js"] },
      { label: "Data & APIs", items: ["SQLite", "APIs & middleware", "UDP messaging", "Local-first storage", "Event-driven architecture", "Python scripting"] },
      { label: "Testing & tools", items: ["Vitest", "Playwright", "E2E & integration testing", "Git & GitHub", "Code review", "Agile", "Release workflows", "PowerShell", "Linux"] },
      { label: "Design", items: ["Wireframing", "Branding", "UI design", "Design systems", "Motion & 3D"] },
      { label: "Applied", items: ["QuantConnect & LEAN", "Ableton Live", "Max for Live", "Node for Max", "Expo Sensors"] },
      { label: "Off the clock", items: ["Golf", "DJing & live sets", "Music production", "Side projects"] },
    ],
    photo: { src: "/photos/golf.jpg", alt: "Gavin on a golf course" },
    accent: "#4a8f6a",
  },
  {
    id: "summit",
    t: 1,
    side: -1,
    chapter: "Summit",
    title: "What's next? Let's build it.",
    body: "I'm looking for product engineering roles and design-minded dev work. If you're building something people should feel, I'd love to hear about it.",
    links: [
      { label: "Email me", href: "mailto:" + profile.email },
      { label: "LinkedIn", href: profile.linkedin },
      { label: "GitHub", href: profile.github },
    ],
    photo: profile.portrait,
    accent: "#ff7a59",
  },
];
