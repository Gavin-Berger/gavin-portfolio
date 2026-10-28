"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import type { Photo } from "@/content/journey";

/**
 * Signs drawn to a canvas texture with the page's own fonts, so 3D text needs no font
 * files or network requests.
 */
export function useLabel(lines: string[], { bg, fg, width = 1024, height = 256, weight = 700 }: { bg: string; fg: string; width?: number; height?: number; weight?: number }) {
  const key = lines.join("|") + bg + fg + width + height;
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const family = getComputedStyle(document.body).getPropertyValue("--font-heading") || "sans-serif";
    const size = Math.min(height / (lines.length + 0.6), (width * 1.6) / Math.max(...lines.map((l) => l.length)));
    ctx.font = `${weight} ${size}px ${family}, system-ui, sans-serif`;
    lines.forEach((line, i) => ctx.fillText(line, width / 2, height / 2 + (i - (lines.length - 1) / 2) * size * 1.1));
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
    // key captures every input
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function Label({ lines, w, h, bg, fg, ...rest }: { lines: string[]; w: number; h: number; bg: string; fg: string } & Omit<ThreeElements["mesh"], "args">) {
  const map = useLabel(lines, { bg, fg, width: 1024, height: Math.round((1024 * h) / w) });
  return (
    <mesh {...rest}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={map} roughness={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** A framed photo on an easel. Renders nothing until the photo file exists. */
export function PhotoFrame({ photo, height = 1.7, ...rest }: { photo: Photo; height?: number } & ThreeElements["group"]) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let cancelled = false;
    new THREE.TextureLoader().load(
      photo.src,
      (t) => {
        if (cancelled) return t.dispose();
        t.colorSpace = THREE.SRGBColorSpace;
        setTex(t);
      },
      undefined,
      () => {},
    );
    return () => {
      cancelled = true;
    };
  }, [photo.src]);

  if (!tex) return null;
  const img = tex.image as HTMLImageElement;
  const w = height * (img.width / img.height);
  const lift = 1.1;
  return (
    <group {...rest}>
      {/* easel legs */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * w * 0.35, lift / 2 + 0.2, -0.05]} rotation-z={s * -0.08}>
          <boxGeometry args={[0.07, lift + 0.6, 0.07]} />
          <meshStandardMaterial color="#6b4a2f" flatShading />
        </mesh>
      ))}
      <mesh position={[0, lift / 2, -0.35]} rotation-x={0.35}>
        <boxGeometry args={[0.07, lift + 0.3, 0.07]} />
        <meshStandardMaterial color="#6b4a2f" flatShading />
      </mesh>
      <group position-y={lift + height / 2}>
        <mesh castShadow>
          <boxGeometry args={[w + 0.22, height + 0.22, 0.08]} />
          <meshStandardMaterial color="#3a2a1c" />
        </mesh>
        <mesh position-z={0.045}>
          <planeGeometry args={[w + 0.1, height + 0.1]} />
          <meshBasicMaterial color="#fbf7ef" />
        </mesh>
        <mesh position-z={0.05}>
          <planeGeometry args={[w, height]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
