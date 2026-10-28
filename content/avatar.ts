// How the hiker looks. Tune these to match Gavin's photos; the 3D figure reads them directly.

export type HairStyle = "none" | "buzz" | "short" | "swept" | "curly" | "long";
export type FacialHair = "none" | "stubble" | "mustache" | "beard";

export const avatar = {
  skin: "#e9b48a",
  hair: { style: "short" as HairStyle, color: "#4a3222" },
  facialHair: "none" as FacialHair,
  glasses: false,
  /** Set to null for no cap. */
  cap: "#d9534f" as string | null,
  jacket: "#2f7d6d",
  pants: "#3b3f58",
  boots: "#5a3b28",
  backpack: "#e8a33d",
};
