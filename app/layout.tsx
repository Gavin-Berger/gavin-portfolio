import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const heading = Space_Grotesk({ variable: "--font-heading", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Gavin Berger · Developer & Designer",
  description:
    "Walk the trail: from UNG computer science to Recall Studio and FRS Sound. Gavin Berger designs and builds software for web, mobile and desktop.",
  openGraph: {
    title: "Gavin Berger · Developer & Designer",
    description: "A 3D walk through my journey, from college to Recall Studio and FRS Sound.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#bfe3f5" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${heading.variable} antialiased`}>{children}</body>
    </html>
  );
}
