import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
      <body>

        <div className="flex">

          <Sidebar />

          <main className="flex-1 bg-blue-50 min-h-screen">
            {children}
          </main>

        </div>

      </body>
    </html>
  );
}