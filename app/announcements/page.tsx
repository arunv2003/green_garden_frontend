"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import {
  Megaphone,
  Plus,
  Pin,
  Calendar,
  AlertCircle,
  Tag,
  Clock,
  Sparkles,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function AnnouncementsPage() {
  const { confirmDelete } = useConfirm();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Post Notice Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    isPinned: false,
    expiresAt: "",
  });

  // Edit Notice Modal
  const [editingNotice, setEditingNotice] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    isPinned: false,
    expiresAt: "",
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryFilter !== "ALL") params.category = categoryFilter;

      const res = await api.get("/announcements", { params });
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error("Failed to load announcements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [categoryFilter]);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);

    try {
      const res = await api.post("/announcements", {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        isPinned: formData.isPinned,
        expiresAt: formData.expiresAt ? formData.expiresAt : undefined,
      });

      if (res.data.success) {
        setIsAddOpen(false);
        setFormData({
          title: "",
          content: "",
          category: "GENERAL",
          isPinned: false,
          expiresAt: "",
        });
        fetchAnnouncements();
      }
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to post circular");
    } finally {
      setAddLoading(false);
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingNotice(item);
    setEditForm({
      title: item.title || "",
      content: item.content || item.description || "",
      category: item.category || "GENERAL",
      isPinned: Boolean(item.isPinned),
      expiresAt: item.expiresAt ? item.expiresAt.split("T")[0] : "",
    });
    setEditError(null);
  };

  const handleUpdateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await api.put(`/announcements/${editingNotice.id}`, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        category: editForm.category,
        isPinned: editForm.isPinned,
        expiresAt: editForm.expiresAt ? editForm.expiresAt : null,
      });

      if (res.data.success) {
        setEditingNotice(null);
        fetchAnnouncements();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update circular");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteNotice = async (item: any) => {
    const confirmed = await confirmDelete({
      title: "Delete Notice Announcement",
      itemName: item.title,
      itemType: "Notice / Announcement",
      message: `Are you sure you want to delete notice "${item.title}"?`,
      confirmText: "Delete Notice",
      dangerNote: "This announcement will be permanently removed from resident noticeboards and dashboards.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/announcements/${item.id}`);
      if (res.data.success) {
        fetchAnnouncements();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete notice");
    }
  };

  const filtered = announcements.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.title?.toLowerCase().includes(q) || (a.content || a.description)?.toLowerCase().includes(q);
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Megaphone className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Society Notice Board & Circulars
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official circulars, general body meeting notices, water shutdown alerts, and society announcements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Notice</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search circulars and notices..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="GENERAL">General Notice</option>
              <option value="MAINTENANCE">Maintenance / Utility</option>
              <option value="EVENT">Society Event</option>
              <option value="EMERGENCY">Emergency Notice</option>
              <option value="RULES">By-laws & Rules</option>
            </select>
          </div>
        </div>

        {actionError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Notices Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
            No notices published matching your filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition hover:shadow-md space-y-3 relative ${
                  item.isPinned ? "border-amber-300 bg-gradient-to-br from-amber-50/30 to-white" : "border-slate-200/80"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.category === "EMERGENCY"
                        ? "bg-rose-100 text-rose-800 font-black"
                        : item.category === "MAINTENANCE"
                        ? "bg-blue-100 text-blue-800"
                        : item.category === "EVENT"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {item.category}
                    </span>

                    {item.isPinned && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(item.createdAt)}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition"
                      title="Edit Notice"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(item)}
                      className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600 transition"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {item.content}
                </p>

                {item.expiresAt && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Valid until: {formatDate(item.expiresAt)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Notice Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Publish Circular / Notice" maxWidth="md">
        <form onSubmit={handlePostNotice} className="space-y-4">
          {addError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {addError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="GENERAL">General Notice</option>
                <option value="MAINTENANCE">Maintenance / Utility Shutdown</option>
                <option value="EVENT">Society Event / Festival</option>
                <option value="EMERGENCY">Emergency / Security</option>
                <option value="RULES">By-laws & Guidelines</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Overhead Tank Cleaning & Water Supply Schedule"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Circular Content *</label>
            <textarea
              rows={4}
              required
              placeholder="Full details of the announcement..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinnedCheck"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isPinnedCheck" className="text-xs font-semibold text-slate-700 select-none">
              Pin to top of the notice board
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {addLoading ? "Publishing..." : "Publish Notice"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Notice Modal */}
      {editingNotice && (
        <Modal
          isOpen={Boolean(editingNotice)}
          onClose={() => setEditingNotice(null)}
          title="Edit Circular / Notice"
          maxWidth="md"
        >
          <form onSubmit={handleUpdateNotice} className="space-y-4">
            {editError && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                {editError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Category *</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="GENERAL">General Notice</option>
                  <option value="MAINTENANCE">Maintenance / Utility Shutdown</option>
                  <option value="EVENT">Society Event / Festival</option>
                  <option value="EMERGENCY">Emergency / Security</option>
                  <option value="RULES">By-laws & Guidelines</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={editForm.expiresAt}
                  onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Circular Content *</label>
              <textarea
                rows={4}
                required
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinnedEditCheck"
                checked={editForm.isPinned}
                onChange={(e) => setEditForm({ ...editForm, isPinned: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isPinnedEditCheck" className="text-xs font-semibold text-slate-700 select-none">
                Pin to top of the notice board
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingNotice(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
