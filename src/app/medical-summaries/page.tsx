"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, downloadFile } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { Patient } from "@/lib/types";
import { DataTable, Column } from "@/components/DataTable";
import { Download, FileText, Search, User } from "lucide-react";

export default function MedicalSummariesPage() {
  const [search, setSearch] = useState("");
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch("/admin/patients");
        setAllPatients(data || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const patients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allPatients;
    return allPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.parent_phone.toLowerCase().includes(query) ||
        p.parent_name.toLowerCase().includes(query)
    );
  }, [search, allPatients]);

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
    { key: "parent", header: "Parent Name", render: (p) => p.parent_name },
    {
      key: "doctor",
      header: "Doctor",
      render: (p) => p.doctor?.name || "—",
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
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <button
          onClick={() => download(p)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Summary PDF
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Medical Summaries</h1>
        <p className="text-gray-500 mt-1">Download overall medical summary PDFs for patients</p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <DataTable
        title="Patients"
        subtitle="All patients · type to filter by name or phone"
        data={patients}
        columns={columns}
        loading={loading}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search patient by name or phone..."
        emptyText="No patients found."
        keyExtractor={(p) => p.id}
      />
    </div>
  );
}
