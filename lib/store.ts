import * as THREE from "three";
import { create } from "zustand";

export type Mode = "scroll" | "explore";

type State = {
  mode: Mode;
  activeStop: number;
  setMode: (mode: Mode) => void;
  setActiveStop: (i: number) => void;
};

export const useJourney = create<State>((set) => ({
  mode: "scroll",
  activeStop: 0,
  setMode: (mode) => set({ mode }),
  setActiveStop: (activeStop) => set({ activeStop }),
}));

/**
 * Per-frame values. These change every frame, so they live outside React state and are
 * read directly inside useFrame callbacks.
 */
export const live = {
  /** Scroll progress 0..1 as read from the page. */
  scroll: 0,
  /** Trail position the walker is easing toward, and where it is now. */
  targetT: 0,
  t: 0,
  /** Walker position, facing (radians) and speed in units/second. */
  pos: new THREE.Vector3(),
  heading: 0,
  speed: 0,
  /** Explore mode: camera yaw and pressed keys. */
  yaw: 0,
  keys: new Set<string>(),
  /** Set by the rail in explore mode to teleport the walker to a stop. */
  teleportTo: null as number | null,
};
