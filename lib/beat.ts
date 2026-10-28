// Same synthetic groove as the FRS Sound site: four-on-the-floor at 92 BPM with offbeat hats.

export const BPM = 92;
export const BEAT = 60 / BPM;

export function groove(t: number) {
  const index = Math.floor(t / BEAT);
  const sinceKick = t - index * BEAT;
  const accent = index % 4 === 0 ? 1 : 0.78;
  const kick = accent * (Math.exp(-sinceKick * 6) - 0.18 * Math.exp(-sinceKick * 3) * Math.sin(sinceKick * 12));
  const hat = Math.exp(-((t + BEAT / 2) % BEAT) * 16) * 0.9;
  return { kick, hat, index };
}
