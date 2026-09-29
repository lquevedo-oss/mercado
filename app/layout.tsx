import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mercado · Luka",
  description: "Tu espacio de investigación de acciones: empresas, earnings, noticias y catalizadores.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
