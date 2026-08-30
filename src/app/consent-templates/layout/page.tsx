"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { ConsentLayoutTemplate } from "@/lib/types";

const defaultHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: Arial, sans-serif; font-size: 11pt; }
    h1 { text-align: center; font-size: 16pt; }
    .section { margin-top: 1cm; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <h1>{{ hospital_name }}</h1>
  <p><strong>Patient:</strong> {{ patient_name }} ({{ age }}/{{ gender }})</p>
  <p><strong>Procedure:</strong> {{ procedure }}</p>
  <div class="section">
    <p class="label">Diagnosis</p>
    <p>{{ diagnosis }}</p>
  </div>
</body>
</html>`;

export default function ConsentLayoutTemplatesPage() {
  const [templates, setTemplates] = useState<ConsentLayoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ConsentLayoutTemplate | null>(null);
  const [form, setForm] = useState({ name: "", html: defaultHtml, is_default: false });
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/consent-layout-templates");
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

  const startEdit = (template: ConsentLayoutTemplate) => {
    setEditing(template);
    setForm({ name: template.name, html: template.html, is_default: template.is_default });
    setPreviewHtml(null);
  };

  const reset = () => {
    setEditing(null);
    setForm({ name: "", html: defaultHtml, is_default: false });
    setPreviewHtml(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await apiFetch(`/admin/consent-layout-templates/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch("/admin/consent-layout-templates", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      reset();
      fetchTemplates();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this layout template?")) return;
    try {
      await apiFetch(`/admin/consent-layout-templates/${id}`, { method: "DELETE" });
      fetchTemplates();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const preview = async () => {
    setError("");
    try {
      const res = await apiFetch(`/admin/consent-layout-templates/${editing?.id}/preview`, {
        method: "POST",
      });
      setPreviewHtml(res.html);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Consent Layout Templates</h1>
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
        <input required placeholder="Template Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded w-full" />
        <textarea required value={form.html} onChange={(e) => setForm({ ...form, html: e.target.value })} className="border p-2 rounded w-full font-mono text-xs" rows={12} />
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
          <span>Default Layout</span>
        </label>
        <div className="space-x-2">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            {editing ? "Update Layout" : "Create Layout"}
          </button>
          {editing && (
            <>
              <button type="button" onClick={preview} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                Preview
              </button>
              <button type="button" onClick={reset} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                Cancel
              </button>
            </>
          )}
        </div>
      </form>

      {previewHtml && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="font-bold mb-2">Preview</h2>
          <iframe srcDoc={previewHtml} className="w-full h-96 border rounded" />
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Name</th>
                <th className="text-left p-3 text-sm font-medium">Default</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3">{t.is_default ? "Yes" : "No"}</td>
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
