import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond, Delicious_Handrawn } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], display: "swap" });
const hand = Delicious_Handrawn({ variable: "--font-handrawn", subsets: ["latin"], weight: "400", display: "swap" });

export const metadata: Metadata = {
  title: "Anastomosis — Erin Figueroa | Portafolio Creativo",
  description: "Portafolio de diseño editorial, branding, mix media, collage e investigación visual por Erin Figueroa. Universidad Dr. José Matías Delgado, El Salvador.",
  keywords: ["Erin Figueroa", "Anastomosis", "Diseño Gráfico", "Branding", "Collage", "Mix Media", "Ilustración", "El Salvador"],
  authors: [{ name: "Erin Figueroa" }],
  creator: "Erin Figueroa",
  openGraph: {
    title: "Anastomosis — Erin Figueroa | Portafolio Creativo",
    description: "U otra forma de decir te quiero. Exploración de diseño e identidad visual.",
    type: "website",
    locale: "es_SV",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${outfit.variable} ${cormorant.variable} ${hand.variable} scroll-smooth antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
