"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { live } from "@/lib/store";
import { nightAt, skyAt } from "@/lib/world";

const sky = new THREE.Color();
const sunDay = new THREE.Color("#fff1d6");
const sunGold = new THREE.Color("#ffb070");
const sunNight = new THREE.Color("#8d8cff");

/** Time of day follows the walker: morning at the trailhead, night at Recall, sunset on the summit. */
export function Atmosphere() {
  const { scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const fog = useRef<THREE.Fog>(null);

  useFrame(() => {
    const t = live.t;
    const night = nightAt(t);
    skyAt(t, sky);
    if (!(scene.background instanceof THREE.Color)) scene.background = new THREE.Color();
    (scene.background as THREE.Color).copy(sky);
    fog.current!.color.copy(sky);

    const s = sun.current!;
    s.position.set(live.pos.x + 18, live.pos.y + 30, live.pos.z + 12);
    s.target.position.copy(live.pos);
    s.target.updateMatrixWorld();
    s.color.copy(sunDay).lerp(sunGold, THREE.MathUtils.smoothstep(t, 0.5, 0.64)).lerp(sunNight, night);
    s.intensity = THREE.MathUtils.lerp(2.4, 0.5, night);
    hemi.current!.intensity = THREE.MathUtils.lerp(1.15, 0.45, night);
  });

  return (
    <>
      <fog ref={fog} attach="fog" args={["#bfe3f5", 35, 120]} />
      <hemisphereLight ref={hemi} args={["#dff3ff", "#6b8a4a", 1.15]} />
      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0008}
      />
    </>
  );
}
