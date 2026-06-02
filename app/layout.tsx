import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import evoChipLogo from "../public/resources/LOGO-EVOCHIP.png";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

// Optimizare SEO avansată pentru EVOCHIP Oradea
export const metadata: Metadata = {
  title: {
    default: "EvoChip | Resoftări Auto Profesionale & Chiptuning Oradea",
    template: "%s | EvoChip Oradea",
  },
  description:
    "Servicii profesionale de chiptuning și resoftări Stage 1, 2, 3 în Oradea. Soluții software OEM pentru performanță auto, optimizare DPF, EGR, AdBlue și diagnoză.",
  keywords: [
    "chiptuning Oradea",
    "resoftare auto Oradea",
    "Stage 1",
    "Stage 2",
    "anulare DPF",
    "solutii EGR",
    "AdBlue Oradea",
    "file service",
    "diagnoza auto",
    "tuning auto Bihor",
    "EvoChip",
  ],
  authors: [{ name: "EvoChip" }],
  metadataBase: new URL("https://evochip.ro"), // Înlocuiește cu domeniul tău real când îl cumperi
  alternates: {
    canonical: "/",
  },
  // Afișare profi când distribui link-ul pe WhatsApp, Facebook sau Instagram
  openGraph: {
    title: "EvoChip | Resoftări Auto Profesionale & Chiptuning Oradea",
    description:
      "Performanță și fiabilitate fără compromisuri. Stage 1/2/3, diagnoză și soluții DPF/EGR/AdBlue la standarde OEM în Oradea.",
    url: "https://evochip.ro",
    siteName: "EvoChip",
    locale: "ro_RO",
    type: "website",
    images: [
      {
        url: evoChipLogo.src,
        width: 1200,
        height: 630,
        alt: "EvoChip Oradea - Chiptuning și Resoftări Auto",
      },
    ],
  },
  // Configurare iconițe (Tab Browser)
  icons: {
    icon: evoChipLogo.src,
    apple: evoChipLogo.src,
  },
  // Instrucțiuni pentru roboții de căutare Google
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className="h-full antialiased select-none bg-black overflow-x-hidden overscroll-none"
    >
      <body className={`${montserrat.className} min-h-full flex flex-col`}>
        <div className="relative z-10 min-h-full flex-1">{children}</div>
      </body>
    </html>
  );
}
