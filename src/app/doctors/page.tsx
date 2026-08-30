"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { Doctor } from "@/lib/types";

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "Add Doctor"}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Search doctors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md border border-gray-300 rounded-md p-2"
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" />
            <input required placeholder="Phone (+91...)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border p-2 rounded" />
            <input required placeholder="Specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Hospital ID (optional)" value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Or Hospital Name (auto-create)" value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} className="border p-2 rounded" />
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <span>Active</span>
            </label>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Doctor</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Name</th>
                <th className="text-left p-3 text-sm font-medium">Phone</th>
                <th className="text-left p-3 text-sm font-medium">Specialty</th>
                <th className="text-left p-3 text-sm font-medium">Hospital</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="border-t">
                  <td className="p-3">{doctor.name}</td>
                  <td className="p-3">{doctor.phone}</td>
                  <td className="p-3">{doctor.specialty}</td>
                  <td className="p-3">{doctor.hospital?.name || "—"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${doctor.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {doctor.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(doctor.id, doctor.is_active)}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      {doctor.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
