"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const paginaPublica =
    pathname === "/biblioteca" ||
    pathname.startsWith("/livro/") ||
    pathname === "/login";

  if (paginaPublica) {
    return (
      <main className="min-h-screen w-full min-w-0 bg-blue-50">
        {children}
      </main>
    );
  }

  return (
    <>
      <Sidebar />

      <main className="min-h-screen w-full min-w-0 bg-blue-50 md:ml-72 md:w-[calc(100%-18rem)]">
        <div className="w-full min-w-0 max-w-full">
          {children}
        </div>
      </main>
    </>
  );
}