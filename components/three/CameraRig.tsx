"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { easing } from "maath";
import { live, useJourney } from "@/lib/store";
import { anchors, frameAt, height, nearestT } from "@/lib/world";

const frame = { p: new THREE.Vector3(), tan: new THREE.Vector3(), n: new THREE.Vector3() };
const followPos = new THREE.Vector3();
const followLook = new THREE.Vector3();
const stopPos = new THREE.Vector3();
const stopLook = new THREE.Vector3();
const goalPos = new THREE.Vector3();
const goalLook = new THREE.Vector3();

/**
 * Follows the walker from behind, and swings across the trail to frame each diorama as the
 * walker arrives at a stop.
 */
export function CameraRig() {
  const look = useRef(new THREE.Vector3());
  const ready = useRef(false);
  const { camera, size } = useThree();
  const portrait = size.width < size.height;

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const mode = useJourney.getState().mode;
    const back = portrait ? 14 : 11;

    if (mode === "scroll") {
      frameAt(live.t, frame);
      followPos.copy(frame.p).addScaledVector(frame.tan, -back);
      followPos.y += 6.5;
      followLook.copy(frame.p).addScaledVector(frame.tan, 6);
      followLook.y += 1.4;

      // Find the nearest stop and how close we are to it.
      let w = 0;
      let a = anchors[0];
      for (const an of anchors) {
        const d = Math.abs(an.stop.t - live.t);
        const k = 1 - THREE.MathUtils.smoothstep(d, 0.012, 0.045);
        if (k > w) {
          w = k;
          a = an;
        }
      }
      const side = a.stop.side;
      frameAt(a.stop.t, frame);
      const across = portrait ? 12 : 9.5;
      stopPos.copy(frame.p).addScaledVector(frame.n, -side * across).addScaledVector(frame.tan, -5);
      stopPos.y = Math.max(stopPos.y, height(stopPos.x, stopPos.z)) + 4.2;
      stopLook.copy(live.pos).lerp(a.pos, 0.5);
      stopLook.y += 1.6;

      goalPos.copy(followPos).lerp(stopPos, w);
      goalLook.copy(followLook).lerp(stopLook, w);
    } else {
      const fx = Math.sin(live.yaw);
      const fz = Math.cos(live.yaw);
      goalPos.set(live.pos.x - fx * back, live.pos.y + 6, live.pos.z - fz * back);
      goalPos.y = Math.max(goalPos.y, height(goalPos.x, goalPos.z) + 2.5);
      goalLook.set(live.pos.x + fx * 5, live.pos.y + 1.5, live.pos.z + fz * 5);
    }

    // Never let the camera dip into a hillside.
    goalPos.y = Math.max(goalPos.y, height(goalPos.x, goalPos.z) + 2);

    if (!ready.current) {
      camera.position.copy(goalPos);
      look.current.copy(goalLook);
      ready.current = true;
    }
    easing.damp3(camera.position, goalPos, mode === "scroll" ? 0.45 : 0.25, dt);
    easing.damp3(look.current, goalLook, 0.35, dt);
    camera.lookAt(look.current);
  });

  return null;
}

/** When explore mode starts, point the camera yaw the way the walker is facing. */
export function syncYawFromHeading() {
  live.yaw = live.heading;
}

export function nearestTForWalker() {
  return nearestT(live.pos.x, live.pos.z);
}
