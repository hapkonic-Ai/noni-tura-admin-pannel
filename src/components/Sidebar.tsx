"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPayload, logout } from "@/lib/auth";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  UserPlus,
  FileText,
  Settings,
  LogOut,
  Layers,
} from "lucide-react";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "D" },
];

const staffNav = [
  { href: "/doctors", label: "Doctors", icon: Stethoscope, key: "O" },
  { href: "/nurses", label: "Nurses", icon: Users, key: "N" },
  { href: "/patients", label: "Patients", icon: UserPlus, key: "P" },
];

const consentNav = [
  { href: "/consent-forms", label: "Consent Forms", icon: FileText, key: "F" },
  { href: "/consent-templates/content", label: "Content Templates", icon: Layers, key: "C" },
  { href: "/consent-templates/layout", label: "Layout Templates", icon: Settings, key: "L" },
  { href: "/medical-summaries", label: "Medical Summaries", icon: FileText, key: "M" },
];

function NavSection({ title, items }: { title: string; items: typeof mainNav }) {
  const pathname = usePathname();

  return (
    <div className="mb-5">
      <h3 className="px-4 text-[10px] font-semibold text-indigo-200/60 uppercase tracking-wider mb-1.5">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2 mx-2 rounded-lg text-sm transition-all duration-200 group ${
                active
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-100 hover:bg-indigo-800/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-indigo-300 group-hover:text-white"}`} />
                <span className="font-medium">{item.label}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-indigo-800/60 text-indigo-200 group-hover:bg-indigo-700 group-hover:text-white"
                }`}
              >
                {item.key}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const payload = typeof window !== "undefined" ? getPayload() : null;

  if (pathname === "/login") {
    return null;
  }

  return (
    <aside className="w-72 bg-indigo-900 text-white flex flex-col h-screen shrink-0">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
            <span className="text-base font-bold text-white">N</span>
          </div>
          <div>
            <h1 className="text-base font-bold font-heading leading-tight">Noni Tura</h1>
            <p className="text-[11px] text-indigo-200/80">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <NavSection title="Overview" items={mainNav} />
        <NavSection title="Staff & Patients" items={staffNav} />
        <NavSection title="Consent & Records" items={consentNav} />
      </nav>

      <div className="p-4 mx-4 mb-4 rounded-2xl bg-indigo-800/40 border border-indigo-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
            {payload?.name?.charAt(0) || payload?.role?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{payload?.name || "Admin"}</p>
            <p className="text-xs text-indigo-200/80 capitalize">{payload?.role || "superadmin"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-100 bg-indigo-800 hover:bg-indigo-700 transition-colors border border-indigo-700/50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
