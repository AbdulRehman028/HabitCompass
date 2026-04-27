import type { Metadata } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const manrope = Manrope({
  variable: "--font-brand-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-brand-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HabitCompass | Build Habits That Last",
  description: "Track daily habits, visualize your score, and save progress securely per account.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
