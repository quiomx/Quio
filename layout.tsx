import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://quio.mx/"),
  title: "Quio — Diseño web",
  alternates: { canonical: "https://quio.mx/" },
  description: "Diseño web con personalidad para negocios que quieren destacar. Sitios claros, rápidos y hechos a la medida, con atención directa desde Sonora.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Quio — Diseño web",
    description: "Tu negocio merece una web que esté a su altura.",
    url: "https://quio.mx/",
    images: [{ url: "https://quio.mx/quio2026-og.png", width: 1200, height: 630, alt: "Quio — diseño web" }],
    locale: "es_MX", type: "website",
  },
  twitter: { card: "summary_large_image", images: ["https://quio.mx/quio2026-og.png"] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-MX"><body>{children}</body></html>;
}
