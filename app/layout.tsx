import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoWall — Year Progress Wallpaper",
  description:
    "Generate a beautiful year progress wallpaper for your phone. Each dot represents a day — see how far you've come.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAFAF8] text-[#2D2A26] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
