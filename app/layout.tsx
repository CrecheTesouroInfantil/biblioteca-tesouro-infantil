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
      <body className="overflow-x-hidden">

        <div className="min-h-screen">

          <Sidebar />

          <main className="min-h-screen bg-blue-50 md:ml-72">
            <div className="min-w-0">
              {children}
            </div>
          </main>

        </div>

      </body>
    </html>
  );
}