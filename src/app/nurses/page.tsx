"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { Doctor, Nurse } from "@/lib/types";

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nurses</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "Add Nurse"}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" />
            <input required placeholder="Phone (+91...)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border p-2 rounded" />
            <select required value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} className="border p-2 rounded">
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
              ))}
            </select>
            <input placeholder="Hospital ID (optional)" value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} className="border p-2 rounded" />
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <span>Active</span>
            </label>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Nurse</button>
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
                <th className="text-left p-3 text-sm font-medium">Doctor</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nurses.map((nurse) => (
                <tr key={nurse.id} className="border-t">
                  <td className="p-3">{nurse.name}</td>
                  <td className="p-3">{nurse.phone}</td>
                  <td className="p-3">{nurse.doctor?.name || "—"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${nurse.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {nurse.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(nurse.id, nurse.is_active)}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      {nurse.is_active ? "Deactivate" : "Activate"}
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
