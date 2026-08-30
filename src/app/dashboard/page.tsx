"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Stethoscope,
  UserPlus,
  ShieldCheck,
  ArrowUpRight,
  Activity,
  FileText,
  Calendar,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";

interface DashboardStats {
  doctors: number;
  nurses: number;
  patients: number;
  pendingDoctors: number;
}

const statCards = [
  {
    label: "Total Doctors",
    key: "doctors" as const,
    href: "/doctors",
    icon: Stethoscope,
    light: "bg-violet-50 text-violet-600",
  },
  {
    label: "Total Nurses",
    key: "nurses" as const,
    href: "/nurses",
    icon: Users,
    light: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Total Patients",
    key: "patients" as const,
    href: "/patients",
    icon: UserPlus,
    light: "bg-amber-50 text-amber-600",
  },
  {
    label: "Pending Doctors",
    key: "pendingDoctors" as const,
    href: "/doctors",
    icon: ShieldCheck,
    light: "bg-rose-50 text-rose-600",
  },
];

const sourceBars = [
  { label: "Direct", value: 64, color: "bg-violet-500" },
  { label: "Referral", value: 92, color: "bg-cyan-400" },
  { label: "Online", value: 48, color: "bg-orange-400" },
  { label: "Walk-in", value: 76, color: "bg-violet-500" },
  { label: "Campaign", value: 56, color: "bg-cyan-400" },
  { label: "Others", value: 38, color: "bg-orange-400" },
];

const recentActions = [
  { label: "Create new doctor account", href: "/doctors", icon: Stethoscope },
  { label: "Register a nurse", href: "/nurses", icon: Users },
  { label: "Add patient records", href: "/patients", icon: UserPlus },
  { label: "Manage consent forms", href: "/consent-forms", icon: FileText },
  { label: "Download medical summaries", href: "/medical-summaries", icon: FileText },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    doctors: 0,
    nurses: 0,
    patients: 0,
    pendingDoctors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [doctors, nurses, patients, pending] = await Promise.all([
          apiFetch("/admin/doctors?limit=1"),
          apiFetch("/admin/nurses?limit=1"),
          apiFetch("/admin/patients?limit=1"),
          apiFetch("/admin/doctors/pending"),
        ]);
        setStats({
          doctors: Array.isArray(doctors) ? doctors.length : 0,
          nurses: Array.isArray(nurses) ? nurses.length : 0,
          patients: Array.isArray(patients) ? patients.length : 0,
          pendingDoctors: Array.isArray(pending) ? pending.length : 0,
        });
      } catch (err: unknown) {
        setError(getErrorMessage(err) || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-gray-500">
          <Activity className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your hospital operations</p>
        </div>
        <Link
          href="/doctors"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          Review Pending Doctors
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2 font-heading">
                    {value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${card.light}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-indigo-600 font-medium">
                <span>View details</span>
                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-heading">Patient Sources</h2>
              <p className="text-sm text-gray-500">Where patients are coming from</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" /> Direct</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Online</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400" /> Referral</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-48 px-2">
            {sourceBars.map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full bg-gray-100 rounded-t-xl relative h-40 overflow-hidden">
                  <div
                    className={`absolute bottom-0 left-0 right-0 ${bar.color} rounded-t-xl transition-all duration-700`}
                    style={{ height: `${bar.value}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 font-heading">Quick Actions</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            {recentActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors group"
                >
                  <div className="p-2 bg-gray-100 group-hover:bg-indigo-100 rounded-lg text-gray-500 group-hover:text-indigo-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                  <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-heading">Manage your hospital staff</h2>
            <p className="text-indigo-100 text-sm mt-1">Create doctors, nurses, and patient records in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/doctors"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              Doctors
            </Link>
            <Link
              href="/nurses"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              Nurses
            </Link>
            <Link
              href="/patients"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              Patients
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
