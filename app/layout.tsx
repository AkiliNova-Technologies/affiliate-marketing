import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import "./globals.css";
import { AuthInitializer } from "@/components/providers/AuthInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tek | Affiliate Marketing Platform",
  description: "A modern affiliate marketing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </ReduxProvider>
        {/* {children} */}
      </body>
    </html>
  );
}
