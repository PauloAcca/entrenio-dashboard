// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Urbanist } from 'next/font/google';
import { ThemeProvider } from "@/components/providers/theme-provider"

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  display: 'swap',
});

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
    <html lang="es" className={`${urbanist.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
