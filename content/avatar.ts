// How the hiker looks, matched to Gavin's photos. The 3D figure reads these directly.

export type HairStyle = "none" | "buzz" | "short" | "swept" | "curly" | "shaggy" | "long";
export type FacialHair = "none" | "stubble" | "mustache" | "beard";

export const avatar = {
  skin: "#e7b894",
  // Dark, wavy, about chin length and flipping out under the cap.
  hair: { style: "shaggy" as HairStyle, color: "#2a1c14" },
  // Short beard with a mustache.
  facialHair: "beard" as FacialHair,
  glasses: false,
  /** Black cap with a small white logo. Set to null for no cap. */
  cap: "#1d1d21" as string | null,
  capLogo: "#f2f2f2" as string | null,
  jacket: "#93475a", // maroon long-sleeve
  pants: "#34405a",
  boots: "#3a3a3d",
  backpack: "#26262b",
};
