"use client";

import { useState } from "react";
import type { Photo } from "@/content/journey";

/** Shows a photo from public/photos, or nothing at all if the file hasn't been added yet. */
export function MaybePhoto({ photo, className }: { photo?: Photo; className?: string }) {
  const [missing, setMissing] = useState(false);
  if (!photo || missing) return null;
  return (
    // Plain <img> so a missing file fails quietly instead of erroring in the image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo.src} alt={photo.alt} className={className} onError={() => setMissing(true)} loading="lazy" />
  );
}
