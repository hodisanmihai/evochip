import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import evoChipLogo from "../public/resources/LOGO-EVOCHIP.png";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});
export const metadata: Metadata = {
  title: "EVOCHIP",
  description:
    "EVOCHIP - SERVICII PROFESIONALE DE CHIPTUNING ȘI OPTIMIZARE AUTO - DPF EGR ADBLUE - ORADEA",
  icons: {
    icon: evoChipLogo.src,
    apple: evoChipLogo.src,
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
    <html lang="ro" className="h-full antialiased select-none">
      <body className={`${montserrat.className} min-h-full flex flex-col`}>
        <div className="relative z-10 min-h-full flex-1">{children}</div>
      </body>
    </html>
  );
}
