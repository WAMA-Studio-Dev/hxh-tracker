import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HxH Tracker — Progreso de Hunter x Hunter",
  description:
    "Trackea tu progreso viendo Hunter x Hunter (2011): capítulo actual, ritmo de visualización y fecha estimada de fin, sincronizado entre tus dispositivos.",
  applicationName: "HxH Tracker",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HxH Tracker",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0d0c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-[100dvh] font-sans antialiased">
        <div className="aura-field fixed inset-0 z-0" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
