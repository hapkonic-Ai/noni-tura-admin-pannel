"use client";

import { useState } from "react";
import Link from "next/link";
import { apiUpload } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";

export default function PatientImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imported: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiUpload("/admin/patients/bulk-import", formData);
      setResult(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/patients" className="text-indigo-600 hover:underline text-sm">← Back to Patients</Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Bulk Import Patients</h1>

      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <p className="text-sm text-gray-600 mb-4">
          Upload an Excel (.xlsx) or CSV file. Required columns:
          <code className="bg-gray-100 px-1 rounded">name</code>,
          <code className="bg-gray-100 px-1 rounded">age</code>,
          <code className="bg-gray-100 px-1 rounded">gender</code>,
          <code className="bg-gray-100 px-1 rounded">parent_name</code>,
          <code className="bg-gray-100 px-1 rounded">parent_phone</code>.<br />
          Provide either <code className="bg-gray-100 px-1 rounded">doctor_id</code> or <code className="bg-gray-100 px-1 rounded">doctor_phone</code>.
          Optional: <code className="bg-gray-100 px-1 rounded">blood_group</code>,
          <code className="bg-gray-100 px-1 rounded">allergies</code>,
          <code className="bg-gray-100 px-1 rounded">hospital_id</code>,
          <code className="bg-gray-100 px-1 rounded">hospital_name</code>.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded text-sm">
            Imported {result.imported} of {result.total} patients.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-700"
          />
          <button
            type="submit"
            disabled={!file || loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import Patients"}
          </button>
        </form>
      </div>
    </div>
  );
}
