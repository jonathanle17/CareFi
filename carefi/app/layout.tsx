import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DermaFi - AI Dermatology Assistant",
  description: "Understand your skin with clinical clarity. AI-assisted analysis, dermatologist-grade insights, and a budget-smart routine tailored to you.",
  keywords: ["skincare", "dermatology", "AI", "skin analysis", "personalized routine"],
  authors: [{ name: "DermaFi" }],
  openGraph: {
    type: "website",
    title: "DermaFi - AI Dermatology Assistant",
    description: "Understand your skin with clinical clarity.",
    siteName: "DermaFi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Navbar />
        <div className="pt-16 md:pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
