// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://entrenio.com"),
  title: "Entrenio — Tu entrenador personal con IA",
  description: "Calcula calorías, registra comidas con foto y crea rutinas personalizadas.",
  openGraph: {
    title: "Entrenio — Tu entrenador personal con IA",
    description: "Estimación de macros por foto, objetivos diarios y rutinas.",
    url: "https://entrenio.com",
    siteName: "Entrenio",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-slate-800 antialiased">{children}</body>
    </html>
  );
}
