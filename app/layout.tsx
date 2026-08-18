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
        <Sidebar />

        <main className="min-h-screen w-full min-w-0 bg-blue-50 md:ml-72 md:w-[calc(100%-18rem)]">
          <div className="w-full min-w-0 max-w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}