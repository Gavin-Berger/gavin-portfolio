import * as THREE from "three";
import { stops, type Stop } from "@/content/journey";

// The trail runs from z = +START toward -LENGTH, climbing as it goes.
export const LENGTH = 300;
export const START = 4;
export const WALL = 7; // half-width of the valley floor before the slopes rise

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Where the trail's centerline sits (x) at a given depth (z). */
export function trailX(z: number) {
  return 9 * Math.sin(z * 0.03) + 4 * Math.sin(z * 0.075 + 1);
}

/** Height of the climb itself, ignoring local bumps. */
export function baseHeight(z: number) {
  return 30 * Math.pow(clamp01(-z / LENGTH), 1.3);
}

/** Terrain height: a rising valley with gentle hills and steeper walls away from the trail. */
export function height(x: number, z: number) {
  const d = Math.abs(x - trailX(z));
  const hills = 0.9 * Math.sin(x * 0.21) * Math.cos(z * 0.17) + 0.5 * Math.sin(x * 0.5 + z * 0.33);
  const walls = Math.pow(Math.max(0, d - WALL), 1.35) * 0.22 + Math.sin(x * 0.11 + z * 0.07) * 2 * smooth(10, 30, d);
  return baseHeight(z) + hills * smooth(3, 9, d) + walls;
}

function buildCurve() {
  const pts: THREE.Vector3[] = [];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const z = START - (i / n) * (LENGTH + START);
    const x = trailX(z);
    pts.push(new THREE.Vector3(x, height(x, z), z));
  }
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
}

export const curve = buildCurve();
export const curveLength = curve.getLength();

const UP = new THREE.Vector3(0, 1, 0);

/** Position, flat forward direction and flat right-hand normal at t along the trail. */
export function frameAt(t: number, out = { p: new THREE.Vector3(), tan: new THREE.Vector3(), n: new THREE.Vector3() }) {
  const tt = clamp01(t);
  curve.getPointAt(tt, out.p);
  curve.getTangentAt(tt, out.tan);
  out.tan.y = 0;
  out.tan.normalize();
  out.n.crossVectors(out.tan, UP).normalize();
  out.p.y = height(out.p.x, out.p.z);
  return out;
}

export type ZoneAnchor = { stop: Stop; index: number; pos: THREE.Vector3; rotY: number; trailPoint: THREE.Vector3 };

/** Where each stop's diorama sits, beside the trail and turned to face it. */
export const anchors: ZoneAnchor[] = stops.map((stop, index) => {
  const f = frameAt(stop.t);
  const pos = f.p.clone().addScaledVector(f.n, stop.side * 7);
  pos.y = height(pos.x, pos.z);
  const toTrail = f.p.clone().sub(pos);
  return { stop, index, pos, rotY: Math.atan2(toTrail.x, toTrail.z), trailPoint: f.p.clone() };
});

/** Nearest t on the trail to a world point (coarse search then refine). */
export function nearestT(x: number, z: number) {
  const tmp = new THREE.Vector3();
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= 400; i++) {
    curve.getPointAt(i / 400, tmp);
    const d = (tmp.x - x) ** 2 + (tmp.z - z) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i / 400;
    }
  }
  return best;
}

// Scroll progress is spread evenly across the gaps between stops, and eased inside each
// gap so the walker slows down as it arrives at a stop.
const ease = (u: number) => u - Math.sin(2 * Math.PI * u) / (2 * Math.PI) * 0.85;

export function scrollToT(s: number) {
  const segs = stops.length - 1;
  const x = clamp01(s) * segs;
  const i = Math.min(segs - 1, Math.floor(x));
  const u = x - i;
  return stops[i].t + (stops[i + 1].t - stops[i].t) * ease(u);
}

export function tToScroll(t: number) {
  const segs = stops.length - 1;
  let i = 0;
  while (i < segs - 1 && t > stops[i + 1].t) i++;
  const span = stops[i + 1].t - stops[i].t;
  const target = clamp01((t - stops[i].t) / span);
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < target) lo = mid;
    else hi = mid;
  }
  return (i + (lo + hi) / 2) / segs;
}

/** Sky colors along the trail: morning, midday, golden hour, Recall's night, FRS's stage, summit sunset. */
const skyKeys: [number, string][] = [
  [0, "#bfe3f5"],
  [0.45, "#a6d6f2"],
  [0.62, "#f6c48e"],
  [0.7, "#4b3d6e"],
  [0.76, "#15142e"],
  [0.85, "#2a1a1f"],
  [0.93, "#d9785a"],
  [1, "#f4a46c"],
];
const ca = new THREE.Color();
const cb = new THREE.Color();
export function skyAt(t: number, out = new THREE.Color()) {
  for (let i = 0; i < skyKeys.length - 1; i++) {
    const [ta, a] = skyKeys[i];
    const [tb, b] = skyKeys[i + 1];
    if (t <= tb) {
      return out.copy(ca.set(a)).lerp(cb.set(b), smooth(ta, tb, t));
    }
  }
  return out.set(skyKeys[skyKeys.length - 1][1]);
}

/** How dark it is (0 day, 1 night), used for lights and emissive glow. */
export function nightAt(t: number) {
  return smooth(0.62, 0.74, t) * (1 - smooth(0.88, 0.97, t));
}

/** Deterministic random so scenery is the same on every load. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
