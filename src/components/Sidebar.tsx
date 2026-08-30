"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPayload, logout } from "@/lib/auth";
import { useSidebar } from "./SidebarContext";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  UserPlus,
  FileText,
  Settings,
  LogOut,
  Layers,
  ChevronLeft,
  ChevronRight,
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

function NavSection({
  title,
  items,
  collapsed,
}: {
  title: string;
  items: typeof mainNav;
  collapsed: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="mb-4">
      {!collapsed && (
        <h3 className="px-4 text-[10px] font-semibold text-indigo-200/60 uppercase tracking-wider mb-1.5">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-2.5 mx-2 rounded-lg text-sm transition-all duration-200 group relative ${
                active
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-indigo-100 hover:bg-indigo-800/60 hover:text-white"
              }`}
            >
              <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-white" : "text-indigo-300 group-hover:text-white"}`} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </div>
              {!collapsed && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-indigo-800/60 text-indigo-200 group-hover:bg-indigo-700 group-hover:text-white"
                  }`}
                >
                  {item.key}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const payload = typeof window !== "undefined" ? getPayload() : null;

  if (pathname === "/login") {
    return null;
  }

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-indigo-900 text-white flex flex-col h-screen transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="p-4 pb-3 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
              <span className="text-base font-bold text-white">N</span>
            </div>
            <div>
              <h1 className="text-base font-bold font-heading leading-tight">Noni Tura</h1>
              <p className="text-[11px] text-indigo-200/80">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/10 mx-auto">
            <span className="text-base font-bold text-white">N</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-indigo-200 hover:bg-indigo-800/60 hover:text-white transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toggle when collapsed */}
      {collapsed && (
        <button
          onClick={toggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-500 transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <NavSection title="Overview" items={mainNav} collapsed={collapsed} />
        <NavSection title="Staff & Patients" items={staffNav} collapsed={collapsed} />
        <NavSection title="Consent & Records" items={consentNav} collapsed={collapsed} />
      </nav>

      {/* Profile / Logout */}
      <div className={`p-3 mx-3 mb-3 rounded-2xl bg-indigo-800/40 border border-indigo-700/50 ${collapsed ? "text-center" : ""}`}>
        <div className={`flex items-center gap-3 mb-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
            {payload?.name?.charAt(0) || payload?.role?.charAt(0).toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{payload?.name || "Admin"}</p>
              <p className="text-xs text-indigo-200/80 capitalize">{payload?.role || "superadmin"}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-indigo-100 bg-indigo-800 hover:bg-indigo-700 transition-colors border border-indigo-700/50 ${collapsed ? "w-auto mx-auto" : "w-full"}`}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
