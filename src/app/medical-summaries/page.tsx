"use client";

import { useState } from "react";
import { apiFetch, downloadFile } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { Patient } from "@/lib/types";

export default function MedicalSummariesPage() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchPatients = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/admin/patients?search=${encodeURIComponent(search)}`);
      setPatients(data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const download = async (patient: Patient) => {
    setError("");
    try {
      await downloadFile(
        `/admin/patients/${patient.id}/summary-pdf`,
        `medical_summary_${patient.name.replace(/\s+/g, "_")}_${patient.id}.pdf`
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Medical Summary Downloads</h1>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search patient by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md p-2"
          />
          <button
            onClick={searchPatients}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Search
          </button>
        </div>

        {patients.length > 0 && (
          <ul className="mt-4 border rounded-md divide-y">
            {patients.map((p) => (
              <li
                key={p.id}
                className="p-3 flex justify-between items-center hover:bg-gray-50"
              >
                <span>{p.name} — {p.parent_phone}</span>
                <button
                  onClick={() => download(p)}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  Download Summary PDF
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
