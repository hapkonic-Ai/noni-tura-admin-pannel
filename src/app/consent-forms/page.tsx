"use client";

import { useState } from "react";
import { apiFetch, downloadFile } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { ConsentForm, Patient } from "@/lib/types";

export default function ConsentFormsPage() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([]);
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

  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setPatients([]);
    setSearch(patient.name);
    setLoading(true);
    try {
      const data = await apiFetch(`/admin/patients/${patient.id}/consent-forms`);
      setConsentForms(data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const download = async (consentId: string) => {
    try {
      await downloadFile(`/admin/consent-forms/${consentId}/download`, `consent_${consentId}.pdf`);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Download Consent Forms</h1>
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
                onClick={() => selectPatient(p)}
                className="p-3 cursor-pointer hover:bg-gray-50"
              >
                {p.name} — {p.parent_phone}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedPatient && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold">Consent Forms for {selectedPatient.name}</h2>
          </div>
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Consent #</th>
                <th className="text-left p-3 text-sm font-medium">Type</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Generated</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {consentForms.map((cf) => (
                <tr key={cf.id} className="border-t">
                  <td className="p-3">{cf.consent_number || cf.id}</td>
                  <td className="p-3">{cf.form_type}</td>
                  <td className="p-3 capitalize">{cf.status}</td>
                  <td className="p-3">{new Date(cf.generated_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => download(cf.id)}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
              {consentForms.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={5}>No consent forms found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
