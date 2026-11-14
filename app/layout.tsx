import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Naskh_Arabic, Noto_Nastaliq_Urdu, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

// Tailor module type system: Inter for English/numbers, Noto Naskh Arabic for
// Urdu labels, Noto Nastaliq Urdu for large Urdu headings. Loaded at the root
// (not in app/tailor/layout.tsx) so the CSS variables also reach portalled
// dialogs, which render outside the tailor layout's DOM subtree.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Paradise Tailor Dashboard",
  description: "A dashboard for clothing tailors to manage their orders, customers, and history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} ${notoNaskhArabic.variable} ${notoNastaliqUrdu.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
