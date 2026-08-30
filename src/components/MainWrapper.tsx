"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <main
      className={`flex-1 ${
        isLogin ? "p-0 overflow-hidden" : "p-6 overflow-auto"
      }`}
    >
      {children}
    </main>
  );
}
