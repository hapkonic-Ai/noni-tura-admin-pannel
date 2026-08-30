"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { ConsentContentTemplate } from "@/lib/types";

const emptyForm = {
  name: "",
  procedure: "",
  procedure_description: "",
  anesthesia: "",
  risks: "",
  benefits: "",
  alternatives: "",
  possible_complications: "",
  material_risks: "",
  post_op_care: "",
  expected_recovery: "",
  statutory_reference: "",
  is_active: true,
};

export default function ConsentContentTemplatesPage() {
  const [templates, setTemplates] = useState<ConsentContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ConsentContentTemplate | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/consent-content-templates");
      setTemplates(data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const startEdit = (template: ConsentContentTemplate) => {
    setEditing(template);
    setForm({
      name: template.name,
      procedure: template.procedure,
      procedure_description: template.procedure_description || "",
      anesthesia: (template.anesthesia || []).join("\n"),
      risks: (template.risks || []).join("\n"),
      benefits: (template.benefits || []).join("\n"),
      alternatives: (template.alternatives || []).join("\n"),
      possible_complications: (template.possible_complications || []).join("\n"),
      material_risks: template.material_risks || "",
      post_op_care: template.post_op_care || "",
      expected_recovery: template.expected_recovery || "",
      statutory_reference: template.statutory_reference || "",
      is_active: template.is_active,
    });
  };

  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const toPayload = () => ({
    ...form,
    anesthesia: form.anesthesia.split("\n").map((s) => s.trim()).filter(Boolean),
    risks: form.risks.split("\n").map((s) => s.trim()).filter(Boolean),
    benefits: form.benefits.split("\n").map((s) => s.trim()).filter(Boolean),
    alternatives: form.alternatives.split("\n").map((s) => s.trim()).filter(Boolean),
    possible_complications: form.possible_complications.split("\n").map((s) => s.trim()).filter(Boolean),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = toPayload();
      if (editing) {
        await apiFetch(`/admin/consent-content-templates/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/admin/consent-content-templates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      reset();
      fetchTemplates();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await apiFetch(`/admin/consent-content-templates/${id}`, { method: "DELETE" });
      fetchTemplates();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Consent Content Templates</h1>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="Template Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Procedure" value={form.procedure} onChange={(e) => setForm({ ...form, procedure: e.target.value })} className="border p-2 rounded" />
          <textarea placeholder="Procedure Description" value={form.procedure_description} onChange={(e) => setForm({ ...form, procedure_description: e.target.value })} className="border p-2 rounded md:col-span-2" rows={2} />
          <textarea placeholder="Anesthesia (one per line)" value={form.anesthesia} onChange={(e) => setForm({ ...form, anesthesia: e.target.value })} className="border p-2 rounded" rows={3} />
          <textarea placeholder="Risks (one per line)" value={form.risks} onChange={(e) => setForm({ ...form, risks: e.target.value })} className="border p-2 rounded" rows={3} />
          <textarea placeholder="Benefits (one per line)" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} className="border p-2 rounded" rows={3} />
          <textarea placeholder="Alternatives (one per line)" value={form.alternatives} onChange={(e) => setForm({ ...form, alternatives: e.target.value })} className="border p-2 rounded" rows={3} />
          <textarea placeholder="Possible Complications (one per line)" value={form.possible_complications} onChange={(e) => setForm({ ...form, possible_complications: e.target.value })} className="border p-2 rounded" rows={3} />
          <textarea placeholder="Material Risks" value={form.material_risks} onChange={(e) => setForm({ ...form, material_risks: e.target.value })} className="border p-2 rounded" rows={3} />
          <textarea placeholder="Post-op Care" value={form.post_op_care} onChange={(e) => setForm({ ...form, post_op_care: e.target.value })} className="border p-2 rounded" rows={3} />
          <textarea placeholder="Expected Recovery" value={form.expected_recovery} onChange={(e) => setForm({ ...form, expected_recovery: e.target.value })} className="border p-2 rounded" rows={3} />
          <textarea placeholder="Statutory Reference" value={form.statutory_reference} onChange={(e) => setForm({ ...form, statutory_reference: e.target.value })} className="border p-2 rounded md:col-span-2" rows={2} />
          <label className="flex items-center space-x-2 md:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span>Active</span>
          </label>
        </div>
        <div className="space-x-2">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            {editing ? "Update Template" : "Create Template"}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Name</th>
                <th className="text-left p-3 text-sm font-medium">Procedure</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3">{t.procedure}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${t.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {t.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => startEdit(t)} className="text-indigo-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => deleteTemplate(t.id)} className="text-red-600 hover:underline text-sm">Delete</button>
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
