import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://quiomx.github.io/Quio/"),
  title: "Quio — Diseño web y reseñas de Google",
  description: "Sitios web con personalidad y kits de reseñas de Google con NFC y QR. Diseño sencillo, atención directa y precios claros en Sonora.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Quio — Diseño web y reseñas de Google",
    description: "Tu negocio merece una web que esté a su altura.",
    url: "https://quiomx.github.io/Quio/",
    images: [{ url: "https://quiomx.github.io/Quio/quio2026-og.png", width: 1200, height: 630, alt: "Quio — diseño web y reseñas de Google" }],
    locale: "es_MX", type: "website",
  },
  twitter: { card: "summary_large_image", images: ["https://quiomx.github.io/Quio/quio2026-og.png"] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX"><body>{children}</body></html>;
}
