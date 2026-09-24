"use client";

import { usePathname } from "next/navigation";
import LayoutShell from "@/components/LayoutShell";

export default function RootLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const ehSistema =
    pathname === "/sistema" ||
    pathname.startsWith("/sistema/") ||
    pathname === "/sistema-login";

  if (ehSistema) {
    return <>{children}</>;
  }

  return <LayoutShell>{children}</LayoutShell>;
}