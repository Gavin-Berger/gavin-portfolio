"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { easing } from "maath";
import { avatar } from "@/content/avatar";
import { live, useJourney } from "@/lib/store";
import { anchors, frameAt, height, LENGTH, START, trailX } from "@/lib/world";

const SKIN = avatar.skin;
const JACKET = avatar.jacket;
const PANTS = avatar.pants;
const PACK = avatar.backpack;
const CAP = avatar.cap;
const BOOT = avatar.boots;
const HAIR = avatar.hair.color;

/** Hair around the head. Under a cap only the sides and back show. */
function Hair() {
  const { style } = avatar.hair;
  if (style === "none") return null;
  const mat = <meshStandardMaterial color={HAIR} flatShading />;
  return (
    <group>
      {/* back and sides, visible under a cap */}
      <mesh position={[0, 0.02, -0.06]} scale={style === "buzz" ? [1.02, 0.95, 1.02] : [1.07, 1, 1.08]}>
        <sphereGeometry args={[0.28, 8, 6, Math.PI * 0.75, Math.PI * 1.5, Math.PI * 0.2, Math.PI * 0.45]} />
        {mat}
      </mesh>
      {!CAP && style !== "curly" && (
        <mesh position={[0, style === "swept" ? 0.07 : 0.04, style === "swept" ? -0.01 : -0.02]} rotation-x={style === "swept" ? -0.25 : -0.1}>
          <sphereGeometry args={[style === "buzz" ? 0.29 : 0.31, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          {mat}
        </mesh>
      )}
      {!CAP && style === "curly" &&
        Array.from({ length: 11 }, (_, i) => {
          const a = (i / 11) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.2, 0.2 + (i % 2) * 0.05, Math.sin(a) * 0.2 - 0.03]}>
              <icosahedronGeometry args={[0.12, 0]} />
              {mat}
            </mesh>
          );
        })}
      {style === "long" && (
        <mesh position={[0, -0.22, -0.16]}>
          <boxGeometry args={[0.5, 0.42, 0.14]} />
          {mat}
        </mesh>
      )}
      {style === "shaggy" && (
        <>
          {/* chin-length at the back */}
          <mesh position={[0, -0.12, -0.17]} rotation-x={0.15}>
            <boxGeometry args={[0.5, 0.3, 0.16]} />
            {mat}
          </mesh>
          {/* waves flipping out over the ears */}
          {[-1, 1].map((s) =>
            [0, 1].map((k) => (
              <mesh key={`${s}${k}`} position={[s * (0.27 + k * 0.03), -0.06 - k * 0.1, -0.03 - k * 0.05]} rotation={[0.3, 0, s * (0.7 + k * 0.4)]}>
                <boxGeometry args={[0.1, 0.2, 0.16]} />
                {mat}
              </mesh>
            )),
          )}
        </>
      )}
    </group>
  );
}

function FacialHair() {
  const kind = avatar.facialHair;
  if (kind === "none") return null;
  const mustache = (
    <mesh position={[0, -0.08, 0.265]}>
      <boxGeometry args={[0.18, 0.045, 0.04]} />
      <meshStandardMaterial color={HAIR} flatShading />
    </mesh>
  );
  if (kind === "mustache") return mustache;
  // Beard or stubble: a shell over the jaw, faint for stubble. A beard comes with a mustache.
  return (
    <>
      <mesh position={[0, -0.02, 0.01]} scale={[1.04, 1.04, 1.06]}>
        <sphereGeometry args={[0.28, 10, 6, -Math.PI * 0.05, Math.PI * 1.1, Math.PI * 0.6, Math.PI * 0.36]} />
        <meshStandardMaterial color={HAIR} flatShading transparent={kind === "stubble"} opacity={kind === "stubble" ? 0.4 : 1} />
      </mesh>
      {kind === "beard" && mustache}
    </>
  );
}

function Glasses() {
  return (
    <group position={[0, 0.03, 0.27]}>
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position-x={x}>
          <torusGeometry args={[0.065, 0.012, 4, 12]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      ))}
      <mesh>
        <boxGeometry args={[0.07, 0.012, 0.012]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

const frame = { p: new THREE.Vector3(), tan: new THREE.Vector3(), n: new THREE.Vector3() };
const prev = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const move = new THREE.Vector3();

function angleDamp(current: number, target: number, smooth: number, dt: number) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * (1 - Math.exp(-dt / smooth));
}

/** The hiker: a low-poly figure whose walk cycle is driven by how far it actually moves. */
export function Walker() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const stride = useRef(0);
  const idleFor = useRef(0);
  const started = useRef(false);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { mode, activeStop, setActiveStop } = useJourney.getState();
    prev.copy(live.pos);

    if (mode === "scroll") {
      if (!started.current) live.t = live.targetT;
      easing.damp(live, "t", live.targetT, 0.35, dt);
      frameAt(live.t, frame);
      live.pos.copy(frame.p);
      const dir = live.targetT - live.t;
      if (Math.abs(dir) > 0.0004) {
        live.heading = angleDamp(live.heading, Math.atan2(frame.tan.x, frame.tan.z) + (dir < 0 ? Math.PI : 0), 0.15, dt);
      }
    } else {
      if (live.teleportTo !== null) {
        const a = anchors[live.teleportTo];
        live.pos.copy(a.trailPoint);
        live.teleportTo = null;
      }
      const k = live.keys;
      const f = (k.has("w") || k.has("arrowup") ? 1 : 0) - (k.has("s") || k.has("arrowdown") ? 1 : 0);
      const s = (k.has("d") || k.has("arrowright") ? 1 : 0) - (k.has("a") || k.has("arrowleft") ? 1 : 0);
      if (k.has("q")) live.yaw += dt * 1.8;
      if (k.has("e")) live.yaw -= dt * 1.8;
      forward.set(Math.sin(live.yaw), 0, Math.cos(live.yaw));
      right.set(-forward.z, 0, forward.x);
      move.set(0, 0, 0).addScaledVector(forward, f).addScaledVector(right, s);
      if (move.lengthSq() > 0) {
        move.normalize();
        const speed = k.has("shift") ? 11 : 6.5;
        live.pos.addScaledVector(move, speed * dt);
        live.heading = angleDamp(live.heading, Math.atan2(move.x, move.z), 0.1, dt);
      }
      // Stay in the valley.
      live.pos.z = THREE.MathUtils.clamp(live.pos.z, -LENGTH - 6, START + 6);
      const cx = trailX(live.pos.z);
      live.pos.x = THREE.MathUtils.clamp(live.pos.x, cx - 11, cx + 11);
      live.pos.y = height(live.pos.x, live.pos.z);
    }

    const moved = started.current ? prev.distanceTo(live.pos) : 0;
    started.current = true;
    live.speed = THREE.MathUtils.lerp(live.speed, moved / Math.max(dt, 1e-4), 0.2);

    // Which stop are we at?
    let near = -1;
    if (mode === "scroll") {
      let best = 0.03;
      anchors.forEach((a, i) => {
        const d = Math.abs(a.stop.t - live.t);
        if (d < best) {
          best = d;
          near = i;
        }
      });
    } else {
      let best = 13 * 13;
      anchors.forEach((a, i) => {
        const d = a.pos.distanceToSquared(live.pos);
        if (d < best) {
          best = d;
          near = i;
        }
      });
    }
    if (near !== activeStop) setActiveStop(near);

    // At the trailhead the hiker greets the visitor: faces the camera and keeps waving.
    // At any other stop, after a moment idle, it turns toward the diorama and waves once.
    const walking = live.speed > 0.4;
    idleFor.current = walking ? 0 : idleFor.current + dt;
    const greeting = !walking && near === 0;
    if (greeting) {
      const cam = state.camera.position;
      live.heading = angleDamp(live.heading, Math.atan2(cam.x - live.pos.x, cam.z - live.pos.z), 0.12, dt);
    } else if (!walking && near >= 0 && idleFor.current > 0.6) {
      const a = anchors[near];
      live.heading = angleDamp(live.heading, Math.atan2(a.pos.x - live.pos.x, a.pos.z - live.pos.z), 0.4, dt);
    }

    // Walk cycle: phase advances with distance so feet don't skate.
    phase.current += moved * 1.6;
    const targetStride = Math.min(1, live.speed / 4);
    stride.current = THREE.MathUtils.lerp(stride.current, targetStride, 1 - Math.exp(-dt * 8));
    const sw = Math.sin(phase.current) * 0.75 * stride.current;
    const time = state.clock.elapsedTime;

    root.current!.position.copy(live.pos);
    root.current!.rotation.y = live.heading;
    legL.current!.rotation.x = sw;
    legR.current!.rotation.x = -sw;
    armL.current!.rotation.x = -sw * 0.9;
    const wave = greeting
      ? idleFor.current % 4.4 < 2.6 // wave, rest, wave again
      : !walking && near >= 0 && idleFor.current > 1.2 && idleFor.current < 4;
    if (wave) {
      armR.current!.rotation.x = THREE.MathUtils.lerp(armR.current!.rotation.x, -2.6, 0.15);
      armR.current!.rotation.z = Math.sin(time * 9) * 0.35 - 0.2;
    } else {
      armR.current!.rotation.x = THREE.MathUtils.lerp(armR.current!.rotation.x, sw * 0.9, 0.3);
      armR.current!.rotation.z = THREE.MathUtils.lerp(armR.current!.rotation.z, 0, 0.3);
    }
    body.current!.position.y = Math.abs(Math.cos(phase.current)) * 0.09 * stride.current + Math.sin(time * 2) * 0.012;
    body.current!.rotation.x = stride.current * 0.08;
    head.current!.rotation.y = Math.sin(time * 0.7) * 0.15 * (1 - stride.current);
  });

  return (
    <group ref={root}>
      {/* blob shadow keeps the figure grounded even where the sun shadow is soft */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.09}>
        <circleGeometry args={[0.55, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <group ref={body}>
        {/* legs pivot at the hips */}
        {[
          [legL, -0.17],
          [legR, 0.17],
        ].map(([ref, x], i) => (
          <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.92, 0]}>
            <mesh position-y={-0.4} castShadow>
              <boxGeometry args={[0.24, 0.8, 0.26]} />
              <meshStandardMaterial color={PANTS} flatShading />
            </mesh>
            <mesh position={[0, -0.84, 0.06]} castShadow>
              <boxGeometry args={[0.27, 0.16, 0.4]} />
              <meshStandardMaterial color={BOOT} flatShading />
            </mesh>
          </group>
        ))}
        {/* torso */}
        <mesh position-y={1.3} castShadow>
          <boxGeometry args={[0.62, 0.78, 0.36]} />
          <meshStandardMaterial color={JACKET} flatShading />
        </mesh>
        {/* backpack */}
        <mesh position={[0, 1.33, -0.3]} castShadow>
          <boxGeometry args={[0.5, 0.62, 0.26]} />
          <meshStandardMaterial color={PACK} flatShading />
        </mesh>
        <mesh position={[0, 1.7, -0.3]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.1, 0.1, 0.56, 6]} />
          <meshStandardMaterial color="#55555c" flatShading />
        </mesh>
        {/* arms pivot at the shoulders */}
        {[
          [armL, -0.41],
          [armR, 0.41],
        ].map(([ref, x], i) => (
          <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 1.62, 0]}>
            <mesh position-y={-0.33} castShadow>
              <boxGeometry args={[0.19, 0.66, 0.21]} />
              <meshStandardMaterial color={JACKET} flatShading />
            </mesh>
            <mesh position-y={-0.72}>
              <icosahedronGeometry args={[0.11, 0]} />
              <meshStandardMaterial color={SKIN} flatShading />
            </mesh>
          </group>
        ))}
        {/* head */}
        <group ref={head} position-y={1.96}>
          <mesh castShadow>
            <icosahedronGeometry args={[0.28, 1]} />
            <meshStandardMaterial color={SKIN} flatShading />
          </mesh>
          <Hair />
          {CAP && (
            <>
              <mesh position={[0, 0.13, 0]}>
                <sphereGeometry args={[0.3, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={CAP} flatShading />
              </mesh>
              <mesh position={[0, 0.14, 0.27]} rotation-x={0.25}>
                <boxGeometry args={[0.42, 0.04, 0.24]} />
                <meshStandardMaterial color={CAP} flatShading />
              </mesh>
              {avatar.capLogo && (
                <mesh position={[0, 0.3, 0.21]} rotation-x={-0.75}>
                  <planeGeometry args={[0.14, 0.07]} />
                  <meshBasicMaterial color={avatar.capLogo} />
                </mesh>
              )}
            </>
          )}
          {[-0.1, 0.1].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.25]}>
              <boxGeometry args={[0.05, 0.07, 0.02]} />
              <meshBasicMaterial color="#222" />
            </mesh>
          ))}
          <FacialHair />
          {avatar.glasses && <Glasses />}
        </group>
      </group>
    </group>
  );
}

