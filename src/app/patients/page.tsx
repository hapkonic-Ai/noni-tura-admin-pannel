"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { Doctor, Patient } from "@/lib/types";
import { DataTable, Column } from "@/components/DataTable";
import { FileDown, User } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    blood_group: "",
    allergies: "",
    parent_name: "",
    parent_phone: "+91",
    doctor_id: "",
    hospital_id: "",
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiFetch(`/admin/patients${query}`);
      setPatients(data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    apiFetch("/admin/doctors?is_active=true")
      .then((data) => setDoctors(data || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/admin/patients", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          age: parseInt(form.age),
          hospital_id: form.hospital_id || undefined,
        }),
      });
      setShowForm(false);
      setForm({ name: "", age: "", gender: "", blood_group: "", allergies: "", parent_name: "", parent_phone: "+91", doctor_id: "", hospital_id: "" });
      fetchPatients();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const columns: Column<Patient>[] = [
    {
      key: "patient",
      header: "Patient",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-500">{p.parent_phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "ageGender",
      header: "Age / Gender",
      render: (p) => (
        <span className="text-sm text-gray-600">
          {p.age} yrs · <span className="capitalize">{p.gender}</span>
        </span>
      ),
    },
    { key: "parent", header: "Parent", render: (p) => p.parent_name },
    {
      key: "doctor",
      header: "Doctor",
      render: (p) => p.doctor?.name || "—",
    },
    {
      key: "bloodGroup",
      header: "Blood",
      render: (p) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">
          {p.blood_group || "—"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Registered",
      render: (p) => new Date(p.created_at).toLocaleDateString("en-IN"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Patients</h1>
          <p className="text-gray-500 mt-1">Manage patient records and bulk imports</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/patients/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Bulk Import
          </Link>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input required type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input required placeholder="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input placeholder="Blood Group" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input placeholder="Allergies" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input required placeholder="Parent Name" value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <input required placeholder="Parent Phone (+91...)" value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
            <select required value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <input placeholder="Hospital ID (optional)" value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">Create Patient</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors">Cancel</button>
          </div>
        </form>
      )}

      <DataTable
        title="Patients Directory"
        subtitle="All registered patients"
        data={patients}
        columns={columns}
        loading={loading}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search patients by name or phone..."
        actionButton={{ label: "Add Patient", onClick: () => setShowForm(!showForm) }}
        emptyText="No patients found."
        keyExtractor={(p) => p.id}
      />
    </div>
  );
}
