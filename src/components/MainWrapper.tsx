"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const isLogin = pathname === "/login";

  return (
    <main
      className={`transition-all duration-300 ease-in-out ${
        isLogin
          ? "p-0 overflow-hidden"
          : `p-6 overflow-auto min-h-screen ${collapsed ? "ml-20" : "ml-72"}`
      }`}
    >
      {children}
    </main>
  );
}
