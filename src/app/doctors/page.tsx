"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { Doctor } from "@/lib/types";
import { DataTable, Column } from "@/components/DataTable";
import { ToggleLeft, ToggleRight } from "lucide-react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "+91",
    specialty: "",
    hospital_id: "",
    hospital_name: "",
    is_active: true,
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch(`/admin/doctors${query}`);
      setDoctors(data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload: Record<string, string | boolean> = { ...form };
      if (!payload.hospital_id) delete payload.hospital_id;
      if (!payload.hospital_name) delete payload.hospital_name;
      await apiFetch("/admin/doctors", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setShowForm(false);
      setForm({ name: "", phone: "+91", specialty: "", hospital_id: "", hospital_name: "", is_active: true });
      fetchDoctors();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await apiFetch(`/admin/doctors/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !current }),
      });
      fetchDoctors();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const columns: Column<Doctor>[] = [
    {
      key: "name",
      header: "Doctor",
      render: (d) => (
        <div>
          <p className="font-medium text-gray-900">{d.name}</p>
          <p className="text-xs text-gray-500">{d.phone}</p>
        </div>
      ),
    },
    { key: "specialty", header: "Specialty", render: (d) => d.specialty },
    {
      key: "hospital",
      header: "Hospital",
      render: (d) => d.hospital?.name || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (d) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            d.is_active
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
          }`}
        >
          {d.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (d) => (
        <button
          onClick={() => toggleStatus(d.id, d.is_active)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {d.is_active ? (
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Doctors</h1>
          <p className="text-gray-500 mt-1">Manage surgeon accounts and approvals</p>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input required placeholder="Phone (+91...)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input required placeholder="Specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input placeholder="Hospital ID (optional)" value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input placeholder="Or Hospital Name (auto-create)" value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <label className="flex items-center gap-2 px-3">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">Create Doctor</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <DataTable
        title="Doctors Directory"
        subtitle="All registered surgeons and specialists"
        data={doctors}
        columns={columns}
        loading={loading}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search doctors by name or phone..."
        actionButton={{ label: "Add Doctor", onClick: () => setShowForm(!showForm) }}
        emptyText="No doctors found."
        keyExtractor={(d) => d.id}
      />
    </div>
  );
}
