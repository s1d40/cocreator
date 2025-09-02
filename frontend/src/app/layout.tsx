import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Cocreator - AI Video Generation",
  description:
    "Turn your ideas into videos with AI. Automatically generate short videos from a topic or URL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
