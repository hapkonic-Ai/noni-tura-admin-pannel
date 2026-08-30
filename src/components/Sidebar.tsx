"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPayload, logout } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/doctors", label: "Doctors" },
  { href: "/nurses", label: "Nurses" },
  { href: "/patients", label: "Patients" },
  { href: "/consent-templates/content", label: "Consent Content" },
  { href: "/consent-templates/layout", label: "Consent Layout" },
  { href: "/consent-forms", label: "Consent Forms" },
  { href: "/medical-summaries", label: "Medical Summaries" },
];

export function Sidebar() {
  const pathname = usePathname();
  const payload = typeof window !== "undefined" ? getPayload() : null;

  if (pathname === "/login") {
    return null;
  }

  return (
    <aside className="w-64 bg-indigo-900 text-white flex flex-col">
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-xl font-bold">Noni Tura Admin</h1>
        {payload && (
          <p className="text-xs text-indigo-200 mt-1 capitalize">{payload.role}</p>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-md text-sm ${
                active ? "bg-indigo-700 font-medium" : "hover:bg-indigo-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-indigo-800">
        <button
          onClick={logout}
          className="w-full text-left px-4 py-2 rounded-md text-sm hover:bg-indigo-800"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
