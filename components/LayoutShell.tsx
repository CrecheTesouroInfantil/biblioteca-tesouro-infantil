"use client";

import Sidebar from "@/components/Sidebar";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
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