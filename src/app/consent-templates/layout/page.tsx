"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { ConsentLayoutTemplate, LayoutBlock, LayoutStyles } from "@/lib/types";
import {
  Layout,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Save,
  Play,
  X,
  FileText,
  Building2,
  Stethoscope,
  User,
  Users,
  CheckSquare,
  PenTool,
  MoveVertical,
  GalleryVerticalEnd,
  Hash,
  Baby,
} from "lucide-react";

const BLOCK_CATALOG: {
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  defaultTitle: string;
}[] = [
  { type: "header", label: "Hospital Header", icon: <Building2 size={16} />, description: "Hospital name, address, contact, reg no.", defaultTitle: "Hospital Header" },
  { type: "title", label: "Document Title", icon: <FileText size={16} />, description: "Main title and subtitle.", defaultTitle: "Informed Consent" },
  { type: "metadata", label: "Metadata", icon: <Hash size={16} />, description: "Consent number, version, status.", defaultTitle: "Consent Metadata" },
  { type: "patient_info", label: "Patient Info", icon: <Baby size={16} />, description: "Name, UHID, age/gender, ward.", defaultTitle: "Patient Information" },
  { type: "guardian_info", label: "Guardian Info", icon: <Users size={16} />, description: "Parent name, relationship, phone.", defaultTitle: "Parent / Guardian Information" },
  { type: "doctor_info", label: "Doctor Info", icon: <Stethoscope size={16} />, description: "Doctor name, qualification, reg no.", defaultTitle: "Treating Doctor Information" },
  { type: "clinical_info", label: "Clinical Info", icon: <GalleryVerticalEnd size={16} />, description: "Diagnosis, procedure, risks, etc.", defaultTitle: "Clinical Information" },
  { type: "consent_clauses", label: "Consent Clauses", icon: <CheckSquare size={16} />, description: "Numbered informed consent clauses.", defaultTitle: "Consent Clauses" },
  { type: "doctor_declaration", label: "Doctor Declaration", icon: <PenTool size={16} />, description: "Doctor declaration box.", defaultTitle: "Doctor Declaration" },
  { type: "guardian_declaration", label: "Guardian Declaration", icon: <User size={16} />, description: "Guardian declaration box.", defaultTitle: "Parent / Guardian Declaration" },
  { type: "signature_section", label: "Signatures", icon: <Type size={16} />, description: "Signature blocks.", defaultTitle: "Signatures" },
  { type: "custom_text", label: "Custom Text", icon: <AlignLeft size={16} />, description: "Free text section.", defaultTitle: "Custom Section" },
  { type: "spacer", label: "Spacer", icon: <MoveVertical size={16} />, description: "Vertical spacing.", defaultTitle: "Spacer" },
  { type: "page_break", label: "Page Break", icon: <Layout size={16} />, description: "Start a new page.", defaultTitle: "Page Break" },
];

const DEFAULT_STYLES: LayoutStyles = {
  page_size: "A4",
  page_margins: "18mm 16mm 28mm 16mm",
  primary_color: "#1a4d8f",
  font_family: "DejaVu Sans, Arial, sans-serif",
  font_size: "10.5pt",
  line_height: "1.5",
  section_spacing: "12px",
  border_style: "solid",
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function createBlock(type: string): LayoutBlock {
  const catalog = BLOCK_CATALOG.find((b) => b.type === type);
  return {
    id: generateId(),
    type,
    title: catalog?.defaultTitle || type,
    visible: true,
    content: "",
    height: "12px",
    align: "left",
    columns: 1,
  };
}

function defaultBlocks(): LayoutBlock[] {
  return [
    "header",
    "title",
    "metadata",
    "patient_info",
    "guardian_info",
    "doctor_info",
    "clinical_info",
    "consent_clauses",
    "doctor_declaration",
    "guardian_declaration",
    "signature_section",
  ].map(createBlock);
}

export default function ConsentLayoutTemplatesPage() {
  const [templates, setTemplates] = useState<ConsentLayoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ConsentLayoutTemplate | null>(null);
  const [name, setName] = useState("");
  const [blocks, setBlocks] = useState<LayoutBlock[]>(defaultBlocks());
  const [styles, setStyles] = useState<LayoutStyles>(DEFAULT_STYLES);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId) || null,
    [blocks, selectedBlockId]
  );

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

  const reset = () => {
    setEditing(null);
    setName("");
    setBlocks(defaultBlocks());
    setStyles(DEFAULT_STYLES);
    setSelectedBlockId(null);
    setPreviewHtml(null);
    setPreviewOpen(false);
  };

  const startEdit = (template: ConsentLayoutTemplate) => {
    setEditing(template);
    setName(template.name);
    setBlocks((template.blocks_json as LayoutBlock[]) || defaultBlocks());
    setStyles((template.styles_json as LayoutStyles) || DEFAULT_STYLES);
    setSelectedBlockId(null);
    setPreviewHtml(null);
    setPreviewOpen(false);
  };

  const updateBlock = (id: string, patch: Partial<LayoutBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const addBlock = (type: string) => {
    const block = createBlock(type);
    setBlocks((prev) => [...prev, block]);
    setSelectedBlockId(block.id);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Template name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: name.trim(),
        blocks_json: blocks,
        styles_json: styles,
        is_default: editing ? editing.is_default : false,
      };
      if (editing) {
        await apiFetch(`/admin/consent-layout-templates/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/admin/consent-layout-templates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      reset();
      fetchTemplates();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!editing) {
      setError("Save the template first to preview a stored layout.");
      return;
    }
    setError("");
    try {
      const res = await apiFetch(`/admin/consent-layout-templates/${editing.id}/preview`, {
        method: "POST",
      });
      setPreviewHtml(res.html);
      setPreviewOpen(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this layout template?")) return;
    try {
      await apiFetch(`/admin/consent-layout-templates/${id}`, { method: "DELETE" });
      if (editing?.id === id) reset();
      fetchTemplates();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Consent Layout Templates</h1>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => {
                reset();
                setEditing({ id: "", name: "", is_default: false, created_at: "", updated_at: "" } as ConsentLayoutTemplate);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={18} /> New Layout
            </button>
          ) : (
            <button
              onClick={reset}
              className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              <X size={18} /> Cancel
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm border border-red-200">
          {error}
        </div>
      )}

      {!editing ? (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-500">Loading templates...</p>
          ) : templates.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <p className="mb-4">No layout templates yet.</p>
              <button
                onClick={() => setEditing({ id: "", name: "", is_default: false, created_at: "", updated_at: "" } as ConsentLayoutTemplate)}
                className="text-indigo-600 hover:underline"
              >
                Create your first layout
              </button>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Default</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Updated</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 text-gray-900 font-medium">{t.name}</td>
                    <td className="p-3 text-gray-600">{t.is_default ? "Yes" : "No"}</td>
                    <td className="p-3 text-gray-600 text-sm">{new Date(t.updated_at).toLocaleString()}</td>
                    <td className="p-3 space-x-3">
                      <button onClick={() => startEdit(t)} className="text-indigo-600 hover:underline text-sm">
                        Edit
                      </button>
                      <button onClick={() => deleteTemplate(t.id)} className="text-red-600 hover:underline text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Palette */}
          <div className="w-64 bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Plus size={18} /> Add Blocks
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {BLOCK_CATALOG.map((block) => (
                <button
                  key={block.type}
                  onClick={() => addBlock(block.type)}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition group"
                >
                  <span className="text-gray-500 group-hover:text-indigo-600 mt-0.5">{block.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{block.label}</div>
                    <div className="text-xs text-gray-500">{block.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border flex flex-col min-h-0">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template name"
                className="font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 w-64"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreview}
                  disabled={!editing?.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  <Play size={16} /> Preview
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Save size={16} /> {saving ? "Saving..." : editing?.id ? "Update" : "Save"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {blocks.length === 0 ? (
                <div className="text-center text-gray-400 py-12 border-2 border-dashed rounded-lg">
                  Click a block on the left to add it here
                </div>
              ) : (
                blocks.map((block, index) => {
                  const catalog = BLOCK_CATALOG.find((b) => b.type === block.type);
                  const isSelected = selectedBlockId === block.id;
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`relative group rounded-lg border p-3 transition cursor-pointer ${
                        isSelected ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 bg-white"
                      } ${!block.visible ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{catalog?.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{block.title}</div>
                            <div className="text-xs text-gray-500">{catalog?.label}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBlock(block.id, { visible: !block.visible });
                            }}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                            title={block.visible ? "Hide" : "Show"}
                          >
                            {block.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(index, -1);
                            }}
                            disabled={index === 0}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(index, 1);
                            }}
                            disabled={index === blocks.length - 1}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-30"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlock(block.id);
                            }}
                            className="p-1.5 rounded hover:bg-red-100 text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Properties */}
          <div className="w-72 bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-800">Properties</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {selectedBlock ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Block</label>
                    <div className="text-sm text-gray-800 font-medium">
                      {BLOCK_CATALOG.find((b) => b.type === selectedBlock.type)?.label || selectedBlock.type}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Title</label>
                    <input
                      value={selectedBlock.title || ""}
                      onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Visible</label>
                    <button
                      onClick={() => updateBlock(selectedBlock.id, { visible: !selectedBlock.visible })}
                      className={`w-11 h-6 rounded-full transition relative ${selectedBlock.visible ? "bg-indigo-600" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${selectedBlock.visible ? "translate-x-5" : ""}`}
                      />
                    </button>
                  </div>
                  {selectedBlock.type === "custom_text" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Content</label>
                      <textarea
                        value={selectedBlock.content || ""}
                        onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                        rows={6}
                        placeholder="Type plain text or insert {{ variable_name }} placeholders."
                        className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use {"{{ patient_name }}"} style placeholders for dynamic values.
                      </p>
                    </div>
                  )}
                  {selectedBlock.type === "spacer" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Height</label>
                      <input
                        value={selectedBlock.height || "12px"}
                        onChange={(e) => updateBlock(selectedBlock.id, { height: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                      />
                    </div>
                  )}
                  {!["header", "footer", "metadata", "spacer", "page_break"].includes(selectedBlock.type) && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Alignment</label>
                      <div className="flex rounded-lg border overflow-hidden">
                        {(["left", "center", "right"] as const).map((align) => (
                          <button
                            key={align}
                            onClick={() => updateBlock(selectedBlock.id, { align })}
                            className={`flex-1 py-2 flex justify-center ${
                              selectedBlock.align === align ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {align === "left" && <AlignLeft size={16} />}
                            {align === "center" && <AlignCenter size={16} />}
                            {align === "right" && <AlignRight size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Select a block on the canvas to edit its settings.</p>
              )}

              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Global Styles</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styles.primary_color || "#1a4d8f"}
                        onChange={(e) => setStyles((s) => ({ ...s, primary_color: e.target.value }))}
                        className="h-9 w-14 border rounded cursor-pointer"
                      />
                      <input
                        value={styles.primary_color || "#1a4d8f"}
                        onChange={(e) => setStyles((s) => ({ ...s, primary_color: e.target.value }))}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Page Size</label>
                    <select
                      value={styles.page_size || "A4"}
                      onChange={(e) => setStyles((s) => ({ ...s, page_size: e.target.value as "A4" | "Letter" }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Page Margins</label>
                    <input
                      value={styles.page_margins || ""}
                      onChange={(e) => setStyles((s) => ({ ...s, page_margins: e.target.value }))}
                      placeholder="18mm 16mm 28mm 16mm"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Font Family</label>
                    <input
                      value={styles.font_family || ""}
                      onChange={(e) => setStyles((s) => ({ ...s, font_family: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Font Size</label>
                    <input
                      value={styles.font_size || ""}
                      onChange={(e) => setStyles((s) => ({ ...s, font_size: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Line Height</label>
                    <input
                      value={styles.line_height || ""}
                      onChange={(e) => setStyles((s) => ({ ...s, line_height: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Section Spacing</label>
                    <input
                      value={styles.section_spacing || ""}
                      onChange={(e) => setStyles((s) => ({ ...s, section_spacing: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Border Style</label>
                    <select
                      value={styles.border_style || "solid"}
                      onChange={(e) => setStyles((s) => ({ ...s, border_style: e.target.value as any }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewOpen && previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-800">Preview</h2>
              <button onClick={() => setPreviewOpen(false)} className="p-2 rounded hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4 bg-gray-100">
              <iframe srcDoc={previewHtml} className="w-full h-full bg-white rounded-lg shadow" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
