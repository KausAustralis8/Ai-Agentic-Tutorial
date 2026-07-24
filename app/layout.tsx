import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twilight Agents — Your AI Brand-Deal Team",
  description:
    "Twilight Agents finds brands, pitches them in your voice, prices deals, follows up, and books calls — your AI-powered talent manager.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="ambient-bg" aria-hidden="true" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
