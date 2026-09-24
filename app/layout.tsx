import type { Metadata } from "next";
import "./globals.css";
import RootLayoutShell from "@/components/RootLayoutShell";

export const metadata: Metadata = {
  title: "Biblioteca Tesouro Infantil",
  description: "Sistema de Biblioteca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="overflow-x-hidden">
        <RootLayoutShell>
          {children}
        </RootLayoutShell>
      </body>
    </html>
  );
}