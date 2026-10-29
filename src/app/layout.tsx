import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Togather - Temukan Komunitas dan Event di DIY",
  description:
    "Platform discovery komunitas dan event di Daerah Istimewa Yogyakarta. Temukan komunitas dan event yang sesuai dengan minat dan lokasimu.",
  icons: {
    icon: "/logo-togather.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
