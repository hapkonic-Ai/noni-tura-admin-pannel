"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { Doctor, Patient } from "@/lib/types";

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <div className="space-x-2">
          <Link href="/patients/import" className="inline-block bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
            Bulk Import
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {showForm ? "Cancel" : "Add Patient"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Search patients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md border border-gray-300 rounded-md p-2"
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" />
            <input required type="number" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="border p-2 rounded" />
            <input required placeholder="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Blood Group" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Allergies" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="border p-2 rounded" />
            <input required placeholder="Parent Name" value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} className="border p-2 rounded" />
            <input required placeholder="Parent Phone (+91...)" value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} className="border p-2 rounded" />
            <select required value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} className="border p-2 rounded">
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <input placeholder="Hospital ID (optional)" value={form.hospital_id} onChange={(e) => setForm({ ...form, hospital_id: e.target.value })} className="border p-2 rounded" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Patient</button>
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
                <th className="text-left p-3 text-sm font-medium">Age / Gender</th>
                <th className="text-left p-3 text-sm font-medium">Parent</th>
                <th className="text-left p-3 text-sm font-medium">Doctor</th>
                <th className="text-left p-3 text-sm font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-t">
                  <td className="p-3">{patient.name}</td>
                  <td className="p-3">{patient.age} / {patient.gender}</td>
                  <td className="p-3">{patient.parent_name}<br/><span className="text-gray-500 text-xs">{patient.parent_phone}</span></td>
                  <td className="p-3">{patient.doctor?.name || "—"}</td>
                  <td className="p-3">{new Date(patient.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
