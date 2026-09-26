"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import {
  LifeBuoy,
  Search,
  Plus,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  MessageSquare,
  Edit,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import api from "@/lib/api";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function ComplaintsDeskPage() {
  const { confirmDelete } = useConfirm();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // New Complaint Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [flats, setFlats] = useState<any[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    flatId: "",
    title: "",
    description: "",
    category: "PLUMBING",
    priority: "MEDIUM",
  });

  // Resolve / Update Status Modal
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState("IN_PROGRESS");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Full Edit Complaint Modal
  const [editingComplaint, setEditingComplaint] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "PLUMBING",
    priority: "MEDIUM",
    status: "OPEN",
    resolutionNotes: "",
  });

  const handleOpenEdit = (c: any) => {
    setEditingComplaint(c);
    setEditForm({
      title: c.title || c.subject || "",
      description: c.description || "",
      category: c.category || "PLUMBING",
      priority: c.priority || "MEDIUM",
      status: c.status || "OPEN",
      resolutionNotes: c.resolutionNotes || c.resolution || "",
    });
    setEditError(null);
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await api.put(`/complaints/${editingComplaint.id}`, {
        title: editForm.title.trim(),
        subject: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        priority: editForm.priority,
        status: editForm.status,
        resolutionNotes: editForm.resolutionNotes.trim() ? editForm.resolutionNotes.trim() : null,
      });

      if (res.data.success) {
        setEditingComplaint(null);
        fetchComplaints();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteComplaint = async (c: any) => {
    const confirmed = await confirmDelete({
      title: "Delete Complaint Ticket",
      itemName: `${c.complaintNumber ? `#${c.complaintNumber} — ` : ""}${c.title}`,
      itemType: "Helpdesk Ticket",
      message: `Are you sure you want to delete ticket ${c.complaintNumber || c.title}?`,
      confirmText: "Delete Ticket",
      dangerNote: "This complaint ticket, along with its resolution history and admin comments, will be permanently removed.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/complaints/${c.id}`);
      if (res.data.success) {
        fetchComplaints();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete complaint");
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (categoryFilter !== "ALL") params.category = categoryFilter;

      const res = await api.get("/complaints", { params });
      const list = res.data.data || [];
      setComplaints(list);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? list.length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFlats = async () => {
    try {
      const res = await api.get("/flats", { params: { limit: 100 } });
      const list = res.data?.data || [];
      setFlats(list);
      if (list.length > 0 && !formData.flatId) {
        setFormData((prev) => ({ ...prev, flatId: String(list[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load flats", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, pageSize, statusFilter, categoryFilter]);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);

    try {
      const res = await api.post("/complaints", {
        flatId: Number(formData.flatId),
        title: formData.title.trim(),
        description: formData.description.trim() ? formData.description.trim() : undefined,
        category: formData.category,
        priority: formData.priority,
      });

      if (res.data.success) {
        setIsAddOpen(false);
        setFormData({
          flatId: flats[0]?.id ? String(flats[0].id) : "",
          title: "",
          description: "",
          category: "PLUMBING",
          priority: "MEDIUM",
        });
        fetchComplaints();
      }
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to file complaint");
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateComplaintStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdateLoading(true);

    try {
      await api.patch(`/complaints/${selectedComplaint.id}/status`, {
        status: updateStatus,
        resolutionNotes: resolutionNotes.trim() ? resolutionNotes.trim() : undefined,
      });
      setSelectedComplaint(null);
      setResolutionNotes("");
      fetchComplaints();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Society Helpdesk & Complaints Desk
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Maintenance grievances, repair tickets, priority triage, and technician assignment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadFlats();
                setIsAddOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>File Complaint</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Tickets</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="LIFT">Lift & Elevator</option>
              <option value="SECURITY">Security</option>
              <option value="CLEANLINESS">Cleanliness & Waste</option>
              <option value="NOISE">Noise & Nuisance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Global Action Error Alert */}
        {actionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-500 hover:text-rose-800 font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Flat No</th>
                  <th className="py-3.5 px-4">Issue Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reported On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading complaints desk...
                    </td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No complaints found matching this filter.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                        {c.complaintNumber}
                      </td>

                      <td className="py-4 px-4 font-bold">
                        <Link
                          href={`/flats/${c.flatId}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs hover:bg-emerald-100 transition inline-flex items-center gap-1"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Flat {c.flatNumber || `#${c.flatId}`}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{c.title}</p>
                        {c.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm truncate">
                            {c.description}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                          {c.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.priority === "URGENT"
                            ? "bg-rose-100 text-rose-800 font-black"
                            : c.priority === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {c.priority}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {formatDate(c.createdAt)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-transparent hover:border-emerald-200"
                            title="Edit Complaint"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedComplaint(c);
                              setUpdateStatus(c.status);
                              setResolutionNotes(c.resolutionNotes || "");
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-semibold transition"
                            title="Quick Status Update"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Status</span>
                          </button>
                          <button
                            onClick={() => handleDeleteComplaint(c)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                            title="Delete Complaint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* File Complaint Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="File a Maintenance Complaint" maxWidth="md">
        <form onSubmit={handleCreateComplaint} className="space-y-4">
          {addError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {addError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Flat *</label>
              <select
                required
                value={formData.flatId}
                onChange={(e) => setFormData({ ...formData, flatId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {flats.map((f) => (
                  <option key={f.id} value={f.id}>
                    Flat {f.flatNumber} ({f.blockName || "Tower A"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="LIFT">Lift & Elevator</option>
                <option value="SECURITY">Security</option>
                <option value="CLEANLINESS">Cleanliness & Waste</option>
                <option value="NOISE">Noise & Nuisance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Emergency)</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Master bathroom tap leaking"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
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
              {addLoading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Complaint Status Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedComplaint(null)}
          title={`Update Ticket: ${selectedComplaint.complaintNumber}`}
          maxWidth="sm"
        >
          <form onSubmit={handleUpdateComplaintStatus} className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-900">{selectedComplaint.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Flat {selectedComplaint.flatNumber || selectedComplaint.flatId} • {selectedComplaint.category}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technician / Resolution Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Plumber visited, replaced washer in main faucet."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
              >
                {updateLoading ? "Saving..." : "Save Status"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Full Edit Complaint Details Modal */}
      <Modal
        isOpen={Boolean(editingComplaint)}
        onClose={() => setEditingComplaint(null)}
        title={`Edit Complaint Ticket: ${editingComplaint?.complaintNumber || ""}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateComplaint} className="space-y-4">
          {editError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {editError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="LIFT">Lift & Elevator</option>
                <option value="SECURITY">Security</option>
                <option value="CLEANLINESS">Cleanliness & Waste</option>
                <option value="NOISE">Noise & Nuisance</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issue Title / Subject *
              </label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              required
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution / Action Notes
            </label>
            <textarea
              rows={2}
              value={editForm.resolutionNotes}
              onChange={(e) => setEditForm({ ...editForm, resolutionNotes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Action taken or resolution notes..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingComplaint(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {editLoading ? "Saving..." : "Save Complaint Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
