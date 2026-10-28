"use client";

import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { Atmosphere } from "./Atmosphere";
import { CameraRig } from "./CameraRig";
import { Clouds, Rocks, TrailPath, Terrain, Trees } from "./Terrain";
import { Walker } from "./Walker";
import { Zones } from "./Zones";

export default function Experience() {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ fov: 50, near: 0.1, far: 260, position: [0, 8, 14] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <PerformanceMonitor onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))} onDecline={() => setDpr(1)} />
      <AdaptiveDpr pixelated={false} />
      <Atmosphere />
      <Terrain />
      <TrailPath />
      <Trees />
      <Rocks />
      <Clouds />
      <Zones />
      <Walker />
      <CameraRig />
    </Canvas>
  );
}
