"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import {
  ShieldCheck,
  Search,
  Plus,
  Building2,
  Phone,
  Clock,
  LogOut,
  UserCheck,
  Car,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import api from "@/lib/api";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function VisitorsGatePage() {
  const { confirmDelete } = useConfirm();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [insideCount, setInsideCount] = useState(0);

  // Add Visitor Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [flats, setFlats] = useState<any[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    flatId: "",
    visitorName: "",
    visitorPhone: "",
    purpose: "Guest Visit",
    vehicleNumber: "",
  });

  // Edit Visitor Modal state
  const [editingVisitor, setEditingVisitor] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    flatId: "",
    visitorName: "",
    mobile: "",
    purpose: "Guest Visit",
    vehicleNumber: "",
    status: "INSIDE",
  });

  const handleOpenEdit = (v: any) => {
    setEditingVisitor(v);
    setEditForm({
      flatId: v.flatId ? String(v.flatId) : "",
      visitorName: v.visitorName || "",
      mobile: v.visitorPhone || v.mobile || "",
      purpose: v.purpose || "Guest Visit",
      vehicleNumber: v.vehicleNumber || "",
      status: v.status || "INSIDE",
    });
    setEditError(null);
  };

  const handleUpdateVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisitor) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await api.put(`/visitors/${editingVisitor.id}`, {
        flatId: Number(editForm.flatId),
        visitorName: editForm.visitorName.trim(),
        mobile: editForm.mobile.trim(),
        purpose: editForm.purpose.trim(),
        vehicleNumber: editForm.vehicleNumber.trim() ? editForm.vehicleNumber.trim() : null,
        status: editForm.status,
      });

      if (res.data.success) {
        setEditingVisitor(null);
        fetchVisitors();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update visitor");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteVisitor = async (v: any) => {
    const confirmed = await confirmDelete({
      title: "Delete Visitor Log",
      itemName: `${v.visitorName} (${v.purpose || "Visitor"}) — Flat ${v.flatNumber || v.flatId || "Gate"}`,
      itemType: "Visitor Entry Log",
      message: `Are you sure you want to delete the visitor log for ${v.visitorName}?`,
      confirmText: "Delete Visitor Log",
      dangerNote: "This gate entry record will be permanently deleted from visitor audit logs.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/visitors/${v.id}`);
      if (res.data.success) {
        fetchVisitors();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete visitor log");
    }
  };

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await api.get("/visitors", { params });
      const list = res.data.data || [];
      setVisitors(list);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? list.length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }

      // Also get inside count
      const insideRes = await api.get("/visitors", { params: { status: "INSIDE", limit: 100 } });
      setInsideCount(insideRes.data?.meta?.total || (insideRes.data?.data || []).length);
    } catch (err) {
      console.error("Failed to load visitors", err);
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
    fetchVisitors();
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchVisitors();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRecordExit = async (id: number) => {
    const ok = await confirmDelete({
      title: "Record Visitor Exit",
      message: "Are you sure you want to mark this visitor as exited through the society gate?",
      confirmText: "Confirm Exit",
      dangerNote: "This will log the departure timestamp for this visitor record.",
    });
    if (!ok) return;
    try {
      await api.patch(`/visitors/${id}/exit`);
      fetchVisitors();
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to record visitor exit");
    }
  };

  const handleCreateVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);

    try {
      const res = await api.post("/visitors", {
        flatId: Number(formData.flatId),
        visitorName: formData.visitorName.trim(),
        visitorPhone: formData.visitorPhone.trim(),
        purpose: formData.purpose.trim() ? formData.purpose.trim() : undefined,
        vehicleNumber: formData.vehicleNumber.trim() ? formData.vehicleNumber.trim() : undefined,
      });

      if (res.data.success) {
        setIsAddOpen(false);
        setFormData({
          flatId: flats[0]?.id ? String(flats[0].id) : "",
          visitorName: "",
          visitorPhone: "",
          purpose: "Guest Visit",
          vehicleNumber: "",
        });
        fetchVisitors();
      }
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to log visitor");
    } finally {
      setAddLoading(false);
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
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Society Security & Visitors Gate
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time gate pass log, visitor entries, exit checkouts, and guest vehicle tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Inside Counter */}
            <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold text-amber-800">
                {insideCount} Inside Society
              </span>
            </div>

            <button
              onClick={() => {
                loadFlats();
                setIsAddOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Visitor Entry</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search visitor name, phone, flat..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Visitors</option>
              <option value="INSIDE">Currently Inside</option>
              <option value="EXITED">Exited</option>
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

        {/* Visitors Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Visitor</th>
                  <th className="py-3.5 px-4">Flat Visited</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Entry Time</th>
                  <th className="py-3.5 px-4">Exit Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading visitors log...
                    </td>
                  </tr>
                ) : visitors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No visitors recorded for this selection.
                    </td>
                  </tr>
                ) : (
                  visitors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900 text-sm">{v.visitorName}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{v.visitorPhone}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold">
                        <Link
                          href={`/flats/${v.flatId}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs hover:bg-emerald-100 transition inline-flex items-center gap-1"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Flat {v.flatNumber || `#${v.flatId}`}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-4 text-slate-700 font-medium">
                        {v.purpose || "Guest Visit"}
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600">
                        {v.vehicleNumber ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Car className="w-3 h-3 text-slate-400" /> {v.vehicleNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        <p className="font-medium text-slate-800">{formatDate(v.entryTime)}</p>
                        <p className="text-[11px] text-slate-400">{formatTime(v.entryTime)}</p>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {v.exitTime ? (
                          <>
                            <p className="font-medium text-slate-800">{formatDate(v.exitTime)}</p>
                            <p className="text-[11px] text-slate-400">{formatTime(v.exitTime)}</p>
                          </>
                        ) : (
                          <span className="text-amber-600 font-semibold text-[11px] italic">Still Inside</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          v.status === "INSIDE"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {v.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {v.status === "INSIDE" ? (
                            <button
                              onClick={() => handleRecordExit(v.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition"
                              title="Check-Out Visitor"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Out</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic px-1">Exited</span>
                          )}
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-transparent hover:border-emerald-200"
                            title="Edit Visitor Entry"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVisitor(v)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                            title="Delete Visitor Record"
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

      {/* Log Visitor Entry Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log Visitor Entry at Gate" maxWidth="sm">
        <form onSubmit={handleCreateVisitor} className="space-y-4">
          {addError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {addError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Flat to Visit *</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Verma"
              value={formData.visitorName}
              onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile"
              value={formData.visitorPhone}
              onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose</label>
              <input
                type="text"
                placeholder="e.g. Delivery / Family"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Plate No</label>
              <input
                type="text"
                placeholder="e.g. DL 01 AB 1234"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none uppercase font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
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
              {addLoading ? "Logging Entry..." : "Confirm Gate Entry"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Visitor Modal */}
      <Modal
        isOpen={Boolean(editingVisitor)}
        onClose={() => setEditingVisitor(null)}
        title={`Edit Visitor Entry: ${editingVisitor?.visitorName || ""}`}
        maxWidth="sm"
      >
        <form onSubmit={handleUpdateVisitor} className="space-y-4">
          {editError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {editError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Flat Visited *
            </label>
            <select
              required
              value={editForm.flatId}
              onChange={(e) => setEditForm({ ...editForm, flatId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="">Select Flat</option>
              {flats.map((f) => (
                <option key={f.id} value={f.id}>
                  Flat {f.flatNumber} ({f.blockName || "Block"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Visitor Name *
              </label>
              <input
                type="text"
                required
                value={editForm.visitorName}
                onChange={(e) => setEditForm({ ...editForm, visitorName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
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
                <option value="INSIDE">INSIDE</option>
                <option value="EXITED">EXITED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={editForm.mobile}
              onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose</label>
              <input
                type="text"
                value={editForm.purpose}
                onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Plate No
              </label>
              <input
                type="text"
                value={editForm.vehicleNumber}
                onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none uppercase font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingVisitor(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {editLoading ? "Saving..." : "Save Visitor Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
