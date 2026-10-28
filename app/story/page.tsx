import type { Metadata } from "next";
import { StoryFallback } from "@/components/ui/StoryFallback";

export const metadata: Metadata = { title: "The story · Gavin Berger" };

export default function StoryPage() {
  return <StoryFallback />;
}
