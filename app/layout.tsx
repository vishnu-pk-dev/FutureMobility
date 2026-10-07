import type { Metadata, Viewport } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CursorGlow from "@/components/CursorGlow";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AXION X — The Future of Electric Motion",
  description:
    "AXION X. A 1,050 HP, all-electric hyper GT engineered for tomorrow. Reserve yours today.",
  keywords: ["AXION", "electric car", "EV", "hypercar", "autonomous"],
  openGraph: {
    title: "AXION X — The Future of Electric Motion",
    description:
      "A 1,050 HP, all-electric hyper GT engineered for tomorrow. Reserve yours today.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#eaf1fb",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${rajdhani.variable} antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/media/frames/heroV2_frames/0000.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/media/frames/heroV2_frames/0001.jpg" />
        <link rel="preload" as="image" href="/media/frames/heroV2_frames/0002.jpg" />
        <link rel="preload" as="image" href="/media/frames/heroV2_frames/0003.jpg" />
      </head>
      <body className="min-h-full bg-void text-ice font-body">
        <SmoothScroll />
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}