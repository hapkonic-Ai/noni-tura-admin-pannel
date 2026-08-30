"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { Doctor, Nurse } from "@/lib/types";
import { DataTable, Column } from "@/components/DataTable";
import { ToggleLeft, ToggleRight } from "lucide-react";

export default function NursesPage() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "+91",
    doctor_id: "",
    hospital_id: "",
    is_active: true,
  });

  const fetchNurses = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/nurses");
      setNurses(data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNurses();
    apiFetch("/admin/doctors?is_active=true")
      .then((data) => setDoctors(data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/admin/nurses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ name: "", phone: "+91", doctor_id: "", hospital_id: "", is_active: true });
      fetchNurses();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await apiFetch(`/admin/nurses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !current }),
      });
      fetchNurses();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const columns: Column<Nurse>[] = [
    {
      key: "name",
      header: "Nurse",
      render: (n) => (
        <div>
          <p className="font-medium text-gray-900">{n.name}</p>
          <p className="text-xs text-gray-500">{n.phone}</p>
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Assigned Doctor",
      render: (n) => n.doctor?.name || "—",
    },
    {
      key: "hospital",
      header: "Hospital",
      render: (n) => n.hospital?.name || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (n) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            n.is_active
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
          }`}
        >
          {n.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (n) => (
        <button
          onClick={() => toggleStatus(n.id, n.is_active)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {n.is_active ? (
            <>
              <ToggleRight className="w-4 h-4" /> Deactivate
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" /> Activate
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Nurses</h1>
        <p className="text-gray-500 mt-1">Manage nursing staff assignments</p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input required placeholder="Phone (+91...)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <select required value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
              ))}
            </select>
            <input placeholder="Hospital ID (optional)" value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <label className="flex items-center gap-2 px-3">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">Create Nurse</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <DataTable
        title="Nurses Directory"
        subtitle="All registered nursing staff"
        data={nurses}
        columns={columns}
        loading={loading}
        actionButton={{ label: "Add Nurse", onClick: () => setShowForm(!showForm) }}
        emptyText="No nurses found."
        keyExtractor={(n) => n.id}
      />
    </div>
  );
}
