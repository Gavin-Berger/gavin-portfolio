"use client";

import { Sparkles, useTexture, useVideoTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { ung, type ZoneKind } from "@/content/journey";
import { groove } from "@/lib/beat";
import { live, useJourney } from "@/lib/store";
import { anchors, nightAt } from "@/lib/world";
import { Label, PhotoFrame } from "./Labels";

// Each diorama is built in local space where +z faces the trail.

function Std({ color, ...rest }: { color: string } & Partial<THREE.MeshStandardMaterialParameters>) {
  return <meshStandardMaterial color={color} flatShading roughness={0.85} {...rest} />;
}

function Pad({ color = "#c9ad7f", r = 4.6 }: { color?: string; r?: number }) {
  return (
    <mesh position-y={-0.15} receiveShadow>
      <cylinderGeometry args={[r, r + 0.4, 0.5, 9]} />
      <Std color={color} />
    </mesh>
  );
}

function Bob({ children, speed = 1, amp = 0.25, offset = 0 }: { children: ReactNode; speed?: number; amp?: number; offset?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    ref.current!.position.y = Math.sin(clock.elapsedTime * speed + offset) * amp;
  });
  return <group ref={ref}>{children}</group>;
}

function VideoMaterial({ src }: { src: string }) {
  const tex = useVideoTexture(src, { muted: true, loop: true, start: true, playsInline: true });
  return <meshBasicMaterial map={tex} toneMapped={false} />;
}

function ImageMaterial({ src }: { src: string }) {
  const tex = useTexture(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  return <meshBasicMaterial map={tex} toneMapped={false} />;
}

/** A screen showing a video or image, loaded only when the walker is close. */
function Screen({ src, w, h, near }: { src: string; w: number; h: number; near: boolean }) {
  return (
    <mesh>
      <planeGeometry args={[w, h]} />
      {near ? (
        <Suspense fallback={<meshBasicMaterial color="#111" />}>
          {src.endsWith(".mp4") ? <VideoMaterial src={src} /> : <ImageMaterial src={src} />}
        </Suspense>
      ) : (
        <meshBasicMaterial color="#111" />
      )}
    </mesh>
  );
}

function Trailhead() {
  return (
    <group>
      <Pad />
      {/* trail map board */}
      <group position={[-1.2, 0, 0]}>
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} position={[x, 1.1, 0]} castShadow>
            <boxGeometry args={[0.18, 2.2, 0.18]} />
            <Std color="#7a5a3a" />
          </mesh>
        ))}
        <mesh position={[0, 1.7, 0]} castShadow>
          <boxGeometry args={[2.6, 1.4, 0.12]} />
          <Std color="#8b6a46" />
        </mesh>
        <mesh position={[0, 1.7, 0.07]}>
          <planeGeometry args={[2.3, 1.15]} />
          <Std color="#efe2c3" />
        </mesh>
        {/* the trail drawn on the map, one dot per stop */}
        {anchors.map((a, i) => (
          <mesh key={i} position={[-1 + (i / (anchors.length - 1)) * 2, 1.4 + Math.sin(i * 1.3) * 0.25 + i * 0.04, 0.09]}>
            <circleGeometry args={[0.06, 8]} />
            <meshBasicMaterial color={a.stop.accent} />
          </mesh>
        ))}
        <mesh position={[0, 2.55, 0]} rotation-z={Math.PI / 4} castShadow>
          <boxGeometry args={[2.1, 2.1, 0.2]} />
          <Std color="#6b4a2f" />
        </mesh>
      </group>
      {/* arrow sign pointing up the trail */}
      <group position={[2, 0, 0.8]}>
        <mesh position-y={0.9}>
          <cylinderGeometry args={[0.08, 0.08, 1.8, 6]} />
          <Std color="#7a5a3a" />
        </mesh>
        <mesh position={[0.3, 1.5, 0]}>
          <boxGeometry args={[0.9, 0.3, 0.08]} />
          <Std color="#e8a33d" />
        </mesh>
      </group>
    </group>
  );
}

function College() {
  return (
    <group position-z={-0.8}>
      <Pad color="#b9b2a2" r={5} />
      {/* main hall */}
      <mesh position={[0, 1.3, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[5.6, 2.6, 2.8]} />
        <Std color="#a8553f" />
      </mesh>
      {/* windows */}
      {[-2, -1.2, 1.2, 2].map((x) =>
        [0.9, 1.9].map((y) => (
          <mesh key={`${x}${y}`} position={[x, y, 0.91]}>
            <planeGeometry args={[0.4, 0.55]} />
            <Std color="#f7e7b4" emissive="#f7d77a" emissiveIntensity={0.2} />
          </mesh>
        )),
      )}
      {/* portico */}
      {[-0.75, -0.25, 0.25, 0.75].map((x) => (
        <mesh key={x} position={[x, 1.2, 1.25]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 2.4, 8]} />
          <Std color="#f2eee4" />
        </mesh>
      ))}
      <mesh position={[0, 2.62, 1.0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.25, 1.2]} />
        <Std color="#f2eee4" />
      </mesh>
      {/* gold steeple, a nod to Dahlonega's gold-rush history */}
      <mesh position={[0, 3.25, -0.5]} castShadow>
        <cylinderGeometry args={[0.55, 0.65, 1.1, 8]} />
        <Std color="#f2eee4" />
      </mesh>
      <mesh position={[0, 4.6, -0.5]} castShadow>
        <coneGeometry args={[0.6, 1.8, 8]} />
        <Std color="#e2b33a" metalness={0.6} roughness={0.3} emissive="#7a5a10" emissiveIntensity={0.25} />
      </mesh>
      {/* steps */}
      <mesh position={[0, 0.1, 1.9]}>
        <boxGeometry args={[2.2, 0.2, 0.6]} />
        <Std color="#d8d2c4" />
      </mesh>
      {/* UNG banner across the hall */}
      <Label lines={["UNIVERSITY OF NORTH GEORGIA"]} w={4.6} h={0.5} bg={ung.blue} fg={ung.gold} position={[0, 2.95, 0.92]} />
      {/* Nighthawks pennants on poles either side of the steps */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 2.4, 0, 1.9]}>
          <mesh position-y={1.4}>
            <cylinderGeometry args={[0.04, 0.05, 2.8, 6]} />
            <Std color="#d8d8d8" metalness={0.5} />
          </mesh>
          <Label lines={["NIGHTHAWKS"]} w={1.3} h={0.42} bg={ung.blue} fg={ung.gold} position={[s * 0.68, 2.5, 0]} />
        </group>
      ))}
    </group>
  );
}

function Events() {
  const bulbs = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffd27a", toneMapped: false }), []);
  useFrame(({ clock }) => {
    bulbs.color.setHSL(0.11, 0.9, 0.65 + Math.sin(clock.elapsedTime * 2) * 0.08 + nightAt(live.t) * 0.1);
  });
  const corners: [number, number][] = [
    [-2.4, -1.6],
    [2.4, -1.6],
    [2.4, 1.4],
    [-2.4, 1.4],
  ];
  // String lights drooping between the tent's front corners and along the sides.
  const lights = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let e = 0; e < 4; e++) {
      const [ax, az] = corners[e];
      const [bx, bz] = corners[(e + 1) % 4];
      for (let i = 1; i < 8; i++) {
        const u = i / 8;
        out.push([ax + (bx - ax) * u, 2.55 - Math.sin(u * Math.PI) * 0.35, az + (bz - az) * u]);
      }
    }
    return out;
    // corners is a constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <group>
      <Pad color="#d9cdb6" />
      {/* tent poles and roof */}
      {corners.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 1.35, z]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.7, 6]} />
          <Std color="#f4f1ea" />
        </mesh>
      ))}
      <mesh position={[0, 3.35, -0.1]} rotation-y={Math.PI / 4} castShadow>
        <coneGeometry args={[3.55, 1.4, 4]} />
        <Std color="#fbfaf6" side={THREE.DoubleSide} />
      </mesh>
      {lights.map((p, i) => (
        <mesh key={i} position={p} material={bulbs}>
          <sphereGeometry args={[0.06, 6, 4]} />
        </mesh>
      ))}
      {/* round tables with linens and centerpieces */}
      {[
        [-1.2, -0.4],
        [1.3, 0.2],
      ].map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <mesh position-y={0.42} castShadow>
            <cylinderGeometry args={[0.75, 0.82, 0.84, 14]} />
            <Std color="#ffffff" />
          </mesh>
          <mesh position-y={0.95}>
            <cylinderGeometry args={[0.05, 0.08, 0.3, 6]} />
            <Std color="#c9b27a" metalness={0.5} />
          </mesh>
          <mesh position-y={1.18}>
            <icosahedronGeometry args={[0.2, 0]} />
            <Std color="#b5476b" />
          </mesh>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} position={[Math.cos((k / 5) * Math.PI * 2) * 1.05, 0.3, Math.sin((k / 5) * Math.PI * 2) * 1.05]}>
              <boxGeometry args={[0.3, 0.6, 0.3]} />
              <Std color="#c9b27a" />
            </mesh>
          ))}
        </group>
      ))}
      {/* welcome sign */}
      <group position={[-3.1, 0, 2.3]} rotation-y={0.35}>
        <mesh position-y={0.55}>
          <boxGeometry args={[0.06, 1.1, 0.06]} />
          <Std color="#6b4a2f" />
        </mesh>
        <Label lines={["EVENTS", "BY DESIGN"]} w={1.3} h={0.85} bg="#fbf7ef" fg="#b5476b" position={[0, 1.4, 0.04]} />
      </group>
    </group>
  );
}

function Music() {
  const bars = useRef<THREE.Mesh[]>([]);
  const disc = useRef<THREE.Mesh>(null);
  const cones = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = groove(t);
    bars.current.forEach((b, i) => {
      if (!b) return;
      const v = 0.35 + Math.abs(Math.sin(t * 3 + i * 0.9)) * 0.6 + g.kick * (i < 3 ? 1.2 : 0.4) + g.hat * (i > 5 ? 0.6 : 0);
      b.scale.y = v;
      b.position.y = 0.4 + v * 0.5;
    });
    if (disc.current) disc.current.rotation.y = t * 3.5;
    cones.current.forEach((c) => c && c.scale.setScalar(1 + Math.max(0, g.kick) * 0.12));
  });
  return (
    <group>
      <Pad color="#3a3346" />
      {/* speakers */}
      {[-2.6, 2.6].map((x, i) => (
        <group key={x} position={[x, 0, -0.6]}>
          <mesh position-y={1.1} castShadow>
            <boxGeometry args={[1.3, 2.2, 1.1]} />
            <Std color="#1d1b22" />
          </mesh>
          <group ref={(el) => void (cones.current[i] = el!)} position={[0, 0.8, 0.56]}>
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.45, 0.45, 0.05, 16]} />
              <Std color="#3b3740" />
            </mesh>
            <mesh rotation-x={Math.PI / 2} position-z={0.03}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 12]} />
              <Std color="#c05bd6" emissive="#c05bd6" emissiveIntensity={0.6} />
            </mesh>
          </group>
          <mesh position={[0, 1.75, 0.56]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.22, 0.22, 0.05, 12]} />
            <Std color="#3b3740" />
          </mesh>
        </group>
      ))}
      {/* turntable desk */}
      <mesh position={[0, 0.5, 0.4]} castShadow>
        <boxGeometry args={[2, 1, 1]} />
        <Std color="#5b4636" />
      </mesh>
      <mesh position={[0, 1.05, 0.4]}>
        <boxGeometry args={[1.6, 0.1, 0.85]} />
        <Std color="#2a2830" />
      </mesh>
      <mesh ref={disc} position={[-0.3, 1.13, 0.4]}>
        <cylinderGeometry args={[0.36, 0.36, 0.04, 20]} />
        <Std color="#111" />
      </mesh>
      {/* EQ bars behind */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} ref={(el) => void (bars.current[i] = el!)} position={[-1.4 + i * 0.4, 1, -1.6]}>
          <boxGeometry args={[0.28, 1, 0.28]} />
          <Std color={i % 2 ? "#c05bd6" : "#e8a33d"} emissive={i % 2 ? "#c05bd6" : "#e8a33d"} emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* floating notes */}
      {[
        [-1.2, 3.2, 0.5],
        [1.4, 3.6, 0.2],
        [0.2, 4, -0.6],
      ].map((p, i) => (
        <group key={i} position={p as THREE.Vector3Tuple}>
          <Bob speed={1.4} offset={i * 2} amp={0.3}>
            <mesh>
              <sphereGeometry args={[0.17, 8, 6]} />
              <Std color="#2a2830" />
            </mesh>
            <mesh position={[0.15, 0.35, 0]}>
              <boxGeometry args={[0.04, 0.7, 0.04]} />
              <Std color="#2a2830" />
            </mesh>
          </Bob>
        </group>
      ))}
    </group>
  );
}

function TouchGrass() {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.z = -clock.elapsedTime * 1.5;
  });
  const tufts = useMemo(
    () => Array.from({ length: 26 }, (_, i) => [Math.cos(i * 2.4) * (1.5 + (i % 5) * 0.55), Math.sin(i * 2.4) * (1.5 + (i % 5) * 0.55)]),
    [],
  );
  return (
    <group>
      <Pad color="#79b85a" />
      {tufts.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]} rotation-y={i}>
          <coneGeometry args={[0.16, 0.55, 4]} />
          <Std color={i % 2 ? "#4f9a3e" : "#6cbf4f"} />
        </mesh>
      ))}
      {/* the phone */}
      <group position={[0, 0, -0.6]} rotation-x={-0.12}>
        <mesh position-y={1.9} castShadow>
          <boxGeometry args={[1.7, 3.3, 0.18]} />
          <Std color="#1f2328" />
        </mesh>
        <mesh position={[0, 1.95, 0.1]}>
          <planeGeometry args={[1.5, 2.9]} />
          <meshBasicMaterial color="#e9f7e3" />
        </mesh>
        <mesh position={[0, 2.5, 0.11]}>
          <torusGeometry args={[0.42, 0.07, 6, 28]} />
          <meshBasicMaterial color="#cfe8c7" />
        </mesh>
        <mesh ref={ring} position={[0, 2.5, 0.12]}>
          <torusGeometry args={[0.42, 0.075, 6, 28, Math.PI * 1.5]} />
          <meshBasicMaterial color="#3fae5a" />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 1.6 - i * 0.35, 0.12]}>
            <planeGeometry args={[1.1 - i * 0.2, 0.16]} />
            <meshBasicMaterial color={i === 0 ? "#3fae5a" : "#b9dfb0"} />
          </mesh>
        ))}
      </group>
      {/* footprints leading to it */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[(i % 2 ? 0.25 : -0.25), 0.11, 3.6 - i * 0.55]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.13, 6]} />
          <meshBasicMaterial color="#3d6b2f" />
        </mesh>
      ))}
    </group>
  );
}

function BrowserWindow({ color, w = 2.2, h = 1.5 }: { color: string; w?: number; h?: number }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.08]} />
        <Std color="#fbfbf8" />
      </mesh>
      <mesh position={[0, h / 2 - 0.1, 0.05]}>
        <planeGeometry args={[w, 0.2]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-w / 2 + 0.12 + i * 0.12, h / 2 - 0.1, 0.06]}>
          <circleGeometry args={[0.035, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      <mesh position={[-w / 4, 0.05, 0.05]}>
        <planeGeometry args={[w / 2 - 0.2, 0.7]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[w / 4, 0.25 - i * 0.22, 0.05]}>
          <planeGeometry args={[w / 2 - 0.3, 0.1]} />
          <meshBasicMaterial color="#c9ccd6" />
        </mesh>
      ))}
    </group>
  );
}

function Seagull() {
  const ref = useRef<THREE.Group>(null);
  const wings = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.6;
    ref.current!.position.set(Math.cos(t) * 3.2, 4.6 + Math.sin(t * 2) * 0.3, Math.sin(t) * 3.2);
    ref.current!.rotation.y = -t;
    const flap = Math.sin(clock.elapsedTime * 7) * 0.5;
    if (wings.current[0]) wings.current[0].rotation.z = flap;
    if (wings.current[1]) wings.current[1].rotation.z = -flap;
  });
  return (
    <group ref={ref}>
      <mesh rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.12, 0.6, 5]} />
        <Std color="#ffffff" />
      </mesh>
      {[-1, 1].map((s, i) => (
        <mesh key={s} ref={(el) => void (wings.current[i] = el!)} position={[0, 0.02, 0]}>
          <boxGeometry args={[1.1 * 2, 0.03, 0.22]} />
          <Std color="#2f8fd8" />
        </mesh>
      ))}
    </group>
  );
}

function Builds() {
  return (
    <group>
      <Pad color="#cfd8e3" />
      <group position={[-1.8, 2.2, -0.4]} rotation-y={0.35}>
        <Bob speed={1.1} amp={0.18}>
          <BrowserWindow color="#2f8fd8" />
        </Bob>
      </group>
      <group position={[0.4, 3.2, -1.2]}>
        <Bob speed={0.9} amp={0.2} offset={1.5}>
          <BrowserWindow color="#1c3d5a" w={2.6} h={1.7} />
        </Bob>
      </group>
      <group position={[2.2, 1.9, -0.2]} rotation-y={-0.4}>
        <Bob speed={1.3} amp={0.15} offset={3}>
          <BrowserWindow color="#e8a33d" w={1.6} h={1.2} />
        </Bob>
      </group>
      {/* desk + laptop */}
      <mesh position={[0, 0.55, 0.8]} castShadow>
        <boxGeometry args={[2.2, 0.1, 1]} />
        <Std color="#8b6a46" />
      </mesh>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.27, 0.8]}>
          <boxGeometry args={[0.1, 0.55, 0.9]} />
          <Std color="#6b4a2f" />
        </mesh>
      ))}
      <mesh position={[0, 0.63, 0.85]}>
        <boxGeometry args={[0.9, 0.04, 0.6]} />
        <Std color="#b8bcc6" metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.92, 0.57]} rotation-x={-0.25}>
        <boxGeometry args={[0.9, 0.58, 0.03]} />
        <Std color="#b8bcc6" metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.92, 0.59]} rotation-x={-0.25}>
        <planeGeometry args={[0.8, 0.48]} />
        <meshBasicMaterial color="#14243a" />
      </mesh>
      <Seagull />
    </group>
  );
}

function Challenges() {
  const candles = useRef<THREE.Group[]>([]);
  const data = useMemo(() => [1.2, 1.8, 1.4, 2.4, 2.0, 3.1, 2.2, 3.6, 2.6, 3.9], []);
  useFrame(({ clock }) => {
    candles.current.forEach((c, i) => {
      if (c) c.scale.y = 1 + Math.sin(clock.elapsedTime * 1.5 + i) * 0.08;
    });
  });
  return (
    <group>
      <Pad color="#8f877a" />
      {/* jagged boulders: the hard part of the climb */}
      {[
        [-3, 0.7, 0.8, 1.1],
        [3.1, 0.8, 0.6, 1.3],
        [-2.4, 0.5, -1.8, 0.8],
        [2.6, 0.6, -1.6, 0.9],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[s, s * 1.2, s]} rotation={[i, i * 2, 0]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <Std color="#7d756a" />
        </mesh>
      ))}
      {/* candlestick chart */}
      <mesh position={[0, 0.15, -0.6]}>
        <boxGeometry args={[4.4, 0.3, 1]} />
        <Std color="#2b2d33" />
      </mesh>
      {data.map((v, i) => {
        const up = i === 0 || v >= data[i - 1];
        const lo = Math.min(v, data[Math.max(0, i - 1)]);
        const hi = Math.max(v, data[Math.max(0, i - 1)]);
        return (
          <group key={i} ref={(el) => void (candles.current[i] = el!)} position={[-1.9 + i * 0.42, 0.3, -0.6]}>
            <mesh position-y={(lo + hi) / 2}>
              <boxGeometry args={[0.24, Math.max(0.15, hi - lo), 0.24]} />
              <Std color={up ? "#3fae5a" : "#d9534f"} emissive={up ? "#3fae5a" : "#d9534f"} emissiveIntensity={0.25} />
            </mesh>
            <mesh position-y={(lo + hi) / 2}>
              <boxGeometry args={[0.04, hi - lo + 0.5, 0.04]} />
              <Std color="#e8e4dc" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Graduation() {
  const caps = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    caps.current.forEach((c, i) => {
      if (!c) return;
      const p = (clock.elapsedTime * 0.45 + i / 5) % 1;
      c.position.y = 2 + Math.sin(p * Math.PI) * 4;
      c.rotation.set(p * 6 + i, p * 4, p * 3);
    });
  });
  return (
    <group>
      <Pad color="#d8cfb8" />
      {/* arch */}
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, 1.6, 0]} castShadow>
          <boxGeometry args={[0.6, 3.2, 0.6]} />
          <Std color="#efe9db" />
        </mesh>
      ))}
      <mesh position={[0, 3.45, 0]} castShadow>
        <boxGeometry args={[5, 0.6, 0.8]} />
        <Std color="#efe9db" />
      </mesh>
      <Label lines={["UNG · CLASS OF 2026"]} w={3.6} h={0.42} bg={ung.blue} fg={ung.gold} position={[0, 3.45, 0.41]} />
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} ref={(el) => void (caps.current[i] = el!)} position={[-1.6 + i * 0.8, 2, 0.6 + (i % 2) * 0.5]}>
          <mesh>
            <boxGeometry args={[0.7, 0.05, 0.7]} />
            <Std color="#1b1b24" />
          </mesh>
          <mesh position-y={-0.12}>
            <cylinderGeometry args={[0.24, 0.26, 0.22, 8]} />
            <Std color="#1b1b24" />
          </mesh>
          <mesh position={[0.3, -0.12, 0.3]}>
            <boxGeometry args={[0.03, 0.26, 0.03]} />
            <Std color="#f0c419" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Recall({ near }: { near: boolean }) {
  const moments = useRef<THREE.Mesh[]>([]);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    moments.current.forEach((m, i) => {
      if (!m) return;
      m.position.y = 0.55 + Math.sin(t * 1.6 + i) * 0.12;
      m.rotation.y = t + i;
    });
    if (light.current) light.current.intensity = 12 + nightAt(live.t) * 25;
  });
  return (
    <group>
      <Pad color="#1a1b2e" />
      {/* the monolith */}
      <mesh position={[0, 2.3, -1.2]} castShadow>
        <boxGeometry args={[3.4, 4.6, 0.5]} />
        <meshStandardMaterial color="#05060f" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.5, -0.93]}>
        <planeGeometry args={[3.0, 3.0]} />
        <meshBasicMaterial color="#8578ff" transparent opacity={0.12} />
      </mesh>
      <group position={[0, 2.5, -0.92]}>
        <Screen src="/media/recall/recall-square.mp4" w={2.8} h={2.8} near={near} />
      </group>
      {/* the timeline ribbon on the ground, with pinned moments */}
      <mesh position={[0, 0.12, 1.2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[7.5, 0.12]} />
        <meshBasicMaterial color="#8578ff" toneMapped={false} />
      </mesh>
      {[-3, -1.8, -0.4, 1, 2.4].map((x, i) => (
        <group key={i} position={[x, 0, 1.2]}>
          <mesh position-y={0.25}>
            <boxGeometry args={[0.03, 0.3, 0.03]} />
            <meshBasicMaterial color="#c6c0ff" />
          </mesh>
          <mesh ref={(el) => void (moments.current[i] = el!)} position-y={0.55}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color={i === 3 ? "#e3b667" : "#c6c0ff"} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <pointLight ref={light} position={[0, 3, 2]} color="#8578ff" distance={14} decay={1.6} />
      <Sparkles count={40} scale={[8, 5, 6]} position={[0, 2.5, 0]} size={3} speed={0.3} color="#c6c0ff" />
    </group>
  );
}

function Frs({ near }: { near: boolean }) {
  const stack = useRef<THREE.Group>(null);
  const cones = useRef<THREE.Mesh[]>([]);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const g = groove(clock.elapsedTime);
    const k = Math.max(0, g.kick);
    if (stack.current) stack.current.scale.set(1 + k * 0.02, 1 + k * 0.03, 1 + k * 0.02);
    cones.current.forEach((c) => {
      if (c) c.position.z = 0.5 + k * 0.07;
    });
    if (light.current) light.current.intensity = (8 + k * 30) * (0.4 + nightAt(live.t));
  });

  const cab = (x: number, y: number, w: number, h: number, key: string, i: number) => (
    <group key={key} position={[x, y + h / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, 1]} />
        <Std color="#0D0C0B" />
      </mesh>
      <mesh ref={(el) => void (cones.current[i] = el!)} position-z={0.5} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[Math.min(w, h) * 0.36, Math.min(w, h) * 0.36, 0.06, 18]} />
        <Std color="#F28C1B" emissive="#F28C1B" emissiveIntensity={0.35} />
      </mesh>
      <mesh position-z={0.54} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[Math.min(w, h) * 0.14, Math.min(w, h) * 0.14, 0.06, 12]} />
        <Std color="#1a1714" />
      </mesh>
    </group>
  );

  return (
    <group>
      <Pad color="#231d19" />
      <group ref={stack} position={[0, 0, -0.8]}>
        {/* front-right stack: subs on the bottom, tops above */}
        {cab(-1.25, 0, 1.4, 1.4, "s1", 0)}
        {cab(0.25, 0, 1.4, 1.4, "s2", 1)}
        {cab(-1.25, 1.4, 1.4, 1.1, "m1", 2)}
        {cab(0.25, 1.4, 1.4, 1.1, "m2", 3)}
        {cab(-0.5, 2.5, 1.6, 0.8, "t1", 4)}
      </group>
      <group position={[2.4, 1.9, -0.4]} rotation-y={-0.45}>
        <mesh position-z={-0.05}>
          <boxGeometry args={[1.85, 3.25, 0.06]} />
          <Std color="#0D0C0B" />
        </mesh>
        <Screen src="/media/frs/frs-poster.webp" w={1.69} h={3.0} near={near} />
      </group>
      <pointLight ref={light} position={[0, 2.5, 2.2]} color="#F28C1B" distance={14} decay={1.6} />
    </group>
  );
}

function Summit() {
  const flag = useRef<THREE.Mesh>(null);
  const fire = useRef<THREE.PointLight>(null);
  const flames = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(1.6, 1, 12, 1), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + 0.8;
      pos.setZ(i, Math.sin(x * 3 - t * 5) * 0.12 * x);
    }
    pos.needsUpdate = true;
    if (fire.current) fire.current.intensity = 6 + Math.sin(t * 13) * 1.5 + Math.sin(t * 7.3) * 1.5;
    if (flames.current) flames.current.scale.y = 1 + Math.sin(t * 11) * 0.15;
  });
  return (
    <group>
      <Pad color="#cdbfa8" />
      <mesh position={[-1.5, 2.2, -0.8]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 4.4, 6]} />
        <Std color="#d8d8d8" metalness={0.5} />
      </mesh>
      <mesh ref={flag} geometry={geo} position={[-0.7, 3.85, -0.8]}>
        <meshStandardMaterial color="#ff7a59" side={THREE.DoubleSide} flatShading />
      </mesh>
      {/* bench to sit and look back down the trail */}
      <group position={[1.3, 0, -0.4]}>
        <mesh position-y={0.5} castShadow>
          <boxGeometry args={[2, 0.12, 0.6]} />
          <Std color="#8b6a46" />
        </mesh>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[x, 0.25, 0]}>
            <boxGeometry args={[0.12, 0.5, 0.5]} />
            <Std color="#6b4a2f" />
          </mesh>
        ))}
      </group>
      {/* campfire */}
      <group position={[0.2, 0, 1.6]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position-y={0.12} rotation={[0, (i * Math.PI) / 3, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.9, 5]} />
            <Std color="#5a3b28" />
          </mesh>
        ))}
        <mesh ref={flames} position-y={0.45}>
          <coneGeometry args={[0.25, 0.7, 5]} />
          <meshBasicMaterial color="#ffb040" toneMapped={false} />
        </mesh>
        <pointLight ref={fire} position-y={0.9} color="#ff9a3c" distance={9} decay={1.6} />
      </group>
    </group>
  );
}

const registry: Record<ZoneKind, (p: { near: boolean }) => ReactNode> = {
  trailhead: () => <Trailhead />,
  college: () => <College />,
  events: () => <Events />,
  music: () => <Music />,
  touchgrass: () => <TouchGrass />,
  builds: () => <Builds />,
  challenges: () => <Challenges />,
  graduation: () => <Graduation />,
  recall: ({ near }) => <Recall near={near} />,
  frs: ({ near }) => <Frs near={near} />,
  summit: () => <Summit />,
};

export function Zones() {
  const active = useJourney((s) => s.activeStop);
  return (
    <>
      {anchors.map((a, i) => (
        <group key={a.stop.id} position={a.pos} rotation-y={a.rotY}>
          {registry[a.stop.id]({ near: active >= 0 && Math.abs(active - i) <= 1 })}
          {/* the real photo for this chapter, on an easel at the front corner of the diorama */}
          {a.stop.photo && <PhotoFrame photo={a.stop.photo} position={[3.7, 0, 2.6]} rotation-y={-0.55} />}
        </group>
      ))}
    </>
  );
}
