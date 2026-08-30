"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, downloadFile } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { ConsentForm, Patient } from "@/lib/types";
import { DataTable, Column } from "@/components/DataTable";
import { ChevronLeft, Download, FileText, User } from "lucide-react";

export default function ConsentFormsPage() {
  const [search, setSearch] = useState("");
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
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

  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setSearch(patient.name);
    setTableLoading(true);
    try {
      const data = await apiFetch(`/admin/patients/${patient.id}/consent-forms`);
      setConsentForms(data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setTableLoading(false);
    }
  };

  const backToPatients = () => {
    setSelectedPatient(null);
    setConsentForms([]);
    setSearch("");
  };

  const download = async (consentId: string) => {
    try {
      await downloadFile(`/admin/consent-forms/${consentId}/download`, `consent_${consentId}.pdf`);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const consentColumns: Column<ConsentForm>[] = [
    {
      key: "consentNumber",
      header: "Consent #",
      render: (cf) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-900 font-mono text-xs">{cf.consent_number || cf.id.slice(0, 8)}</span>
        </div>
      ),
    },
    { key: "formType", header: "Form Type", render: (cf) => cf.form_type },
    {
      key: "status",
      header: "Status",
      render: (cf) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
            cf.status === "signed"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
              : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
          }`}
        >
          {cf.status}
        </span>
      ),
    },
    {
      key: "generated",
      header: "Generated",
      render: (cf) => new Date(cf.generated_at).toLocaleDateString("en-IN"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (cf) => (
        <button
          onClick={() => download(cf.id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" /> PDF
        </button>
      ),
    },
  ];

  const patientColumns: Column<Patient>[] = [
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
      header: "",
      render: (p) => (
        <button
          onClick={() => selectPatient(p)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View Forms
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {selectedPatient && (
          <button
            onClick={backToPatients}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">
            {selectedPatient ? `Consent Forms · ${selectedPatient.name}` : "Consent Forms"}
          </h1>
          <p className="text-gray-500 mt-1">
            {selectedPatient
              ? "Download consent forms for selected patient"
              : "Select a patient to view and download consent forms"}
          </p>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!selectedPatient ? (
        <DataTable
          title="Patients"
          subtitle="All patients · click View Forms or type to filter"
          data={patients}
          columns={patientColumns}
          loading={loading}
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search patient by name or phone..."
          emptyText="No patients found."
          keyExtractor={(p) => p.id}
        />
      ) : (
        <DataTable
          title="Consent Forms"
          subtitle="Download signed and pending consent forms"
          data={consentForms}
          columns={consentColumns}
          loading={tableLoading}
          emptyText="No consent forms found for this patient."
          keyExtractor={(cf) => cf.id}
        />
      )}
    </div>
  );
}
