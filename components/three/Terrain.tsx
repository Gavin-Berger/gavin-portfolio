"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { anchors, baseHeight, curve, height, LENGTH, rng, START, trailX } from "@/lib/world";

const GRASS = new THREE.Color("#8fbf6a");
const GRASS_DARK = new THREE.Color("#6fa356");
const ROCK = new THREE.Color("#9a9184");
const SNOW = new THREE.Color("#f3f1ea");

export function Terrain() {
  const geometry = useMemo(() => {
    const width = 160;
    const depth = LENGTH + 90;
    const g = new THREE.PlaneGeometry(width, depth, 80, 190);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, START + 40 - depth / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, height(x, z));
    }
    // Flat shading needs unshared vertices so each face gets one color.
    const flat = g.toNonIndexed();
    flat.computeVertexNormals();
    const p = flat.attributes.position as THREE.BufferAttribute;
    const n = flat.attributes.normal as THREE.BufferAttribute;
    const colors = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    const rand = rng(7);
    for (let f = 0; f < p.count; f += 3) {
      const y = (p.getY(f) + p.getY(f + 1) + p.getY(f + 2)) / 3;
      const z = (p.getZ(f) + p.getZ(f + 1) + p.getZ(f + 2)) / 3;
      const rel = y - baseHeight(z);
      const slope = 1 - n.getY(f);
      c.copy(rand() > 0.5 ? GRASS : GRASS_DARK);
      c.lerp(ROCK, THREE.MathUtils.smoothstep(rel + slope * 20, 4, 10));
      if (rel > 13) c.lerp(SNOW, THREE.MathUtils.smoothstep(rel, 13, 18));
      for (let k = 0; k < 3; k++) c.toArray(colors, (f + k) * 3);
    }
    flat.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return flat;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={1} />
    </mesh>
  );
}

/** The path itself: a sandy ribbon draped over the terrain. */
export function TrailPath() {
  const geometry = useMemo(() => {
    const segments = 700;
    const half = 1.3;
    const pts = curve.getSpacedPoints(segments);
    const verts: number[] = [];
    const idx: number[] = [];
    const tan = new THREE.Vector3();
    for (let i = 0; i <= segments; i++) {
      const p = pts[i];
      curve.getTangentAt(i / segments, tan);
      const nx = -tan.z;
      const nz = tan.x;
      const len = Math.hypot(nx, nz) || 1;
      for (const s of [-1, 1]) {
        const x = p.x + (nx / len) * half * s;
        const z = p.z + (nz / len) * half * s;
        verts.push(x, height(x, z) + 0.07, z);
      }
      if (i < segments) {
        const a = i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#e2c99a" roughness={1} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

function scatter(count: number, seed: number, minFromTrail: number) {
  const rand = rng(seed);
  const out: { x: number; y: number; z: number; s: number; r: number }[] = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 20) {
    const z = START + 30 - rand() * (LENGTH + 70);
    const x = trailX(z) + (rand() - 0.5) * 140;
    if (Math.abs(x - trailX(z)) < minFromTrail) continue;
    if (anchors.some((a) => (a.pos.x - x) ** 2 + (a.pos.z - z) ** 2 < 70)) continue;
    const y = height(x, z);
    if (y - baseHeight(z) > 14) continue; // keep the snowline bare
    out.push({ x, y, z, s: 0.7 + rand() * 0.9, r: rand() * Math.PI * 2 });
  }
  return out;
}

export function Trees() {
  const crowns = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => scatter(650, 11, 4.5), []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const c = new THREE.Color();
    const palette = ["#4f8a4b", "#5f9a52", "#3f7a48", "#6aa05a"];
    items.forEach((it, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.r);
      m.compose(new THREE.Vector3(it.x, it.y + 1.9 * it.s, it.z), q, new THREE.Vector3(it.s, it.s, it.s));
      crowns.current!.setMatrixAt(i, m);
      crowns.current!.setColorAt(i, c.set(palette[i % palette.length]));
      m.compose(new THREE.Vector3(it.x, it.y + 0.4 * it.s, it.z), q, new THREE.Vector3(it.s, it.s, it.s));
      trunks.current!.setMatrixAt(i, m);
    });
    crowns.current!.instanceMatrix.needsUpdate = true;
    trunks.current!.instanceMatrix.needsUpdate = true;
  }, [items]);

  return (
    <group>
      <instancedMesh ref={crowns} args={[undefined, undefined, items.length]} castShadow>
        <coneGeometry args={[1.1, 3, 6]} />
        <meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, items.length]}>
        <cylinderGeometry args={[0.15, 0.2, 0.9, 5]} />
        <meshStandardMaterial color="#7a5a3a" flatShading />
      </instancedMesh>
    </group>
  );
}

export function Rocks() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => scatter(220, 23, 2.2), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const e = new THREE.Euler();
    items.forEach((it, i) => {
      e.set(it.r, it.r * 2, 0);
      const s = it.s * 0.55;
      m.compose(new THREE.Vector3(it.x, it.y + s * 0.2, it.z), new THREE.Quaternion().setFromEuler(e), new THREE.Vector3(s * 1.3, s, s));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#a39a8c" flatShading roughness={1} />
    </instancedMesh>
  );
}

export function Clouds() {
  const clouds = useMemo(() => {
    const rand = rng(5);
    return Array.from({ length: 22 }, () => {
      const z = START - rand() * LENGTH;
      return {
        pos: [trailX(z) + (rand() - 0.5) * 120, baseHeight(z) + 22 + rand() * 10, z] as const,
        puffs: Array.from({ length: 4 }, (_, i) => ({ x: i * 2.2 - 3.3, y: rand() * 0.8, s: 1.4 + rand() * 1.4 })),
      };
    });
  }, []);
  return (
    <group>
      {clouds.map((c, i) => (
        <group key={i} position={c.pos as unknown as THREE.Vector3Tuple}>
          {c.puffs.map((p, j) => (
            <mesh key={j} position={[p.x, p.y, 0]} scale={p.s}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#ffffff" flatShading transparent opacity={0.92} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
