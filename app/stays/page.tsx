"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CheckInModal } from "@/components/modals/CheckInModal";
import { CheckOutModal } from "@/components/modals/CheckOutModal";
import {
  Compass,
  Search,
  PlusCircle,
  Building2,
  Calendar,
  LogIn,
  LogOut,
  Clock,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import { useConfirm } from "@/components/providers/ConfirmProvider";

import { Pagination } from "@/components/ui/Pagination";

export default function StaysPage() {
  const { confirmDelete } = useConfirm();
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkOutStay, setCheckOutStay] = useState<any | null>(null);

  // Edit Stay state
  const [editingStay, setEditingStay] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    monthlyRent: "",
    checkInDate: "",
    checkOutDate: "",
    status: "ACTIVE",
    remarks: "",
  });

  const currentUser = getStoredUser();
  const isSecretary = currentUser?.role === "SECRETARY";

  const fetchStays = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await api.get("/stays", { params });
      setStays(res.data.data || []);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? (res.data.data || []).length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }
    } catch (err) {
      console.error("Failed to load stays", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (s: any) => {
    setEditingStay(s);
    setEditForm({
      monthlyRent: String(s.monthlyRent || ""),
      checkInDate: s.checkInDate ? s.checkInDate.split("T")[0] : "",
      checkOutDate: s.checkOutDate ? s.checkOutDate.split("T")[0] : "",
      status: s.status || "ACTIVE",
      remarks: s.remarks || "",
    });
    setEditError(null);
  };

  const handleUpdateStay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStay) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await api.put(`/stays/${editingStay.id}`, {
        monthlyRent: parseFloat(editForm.monthlyRent) || 0,
        checkInDate: editForm.checkInDate || undefined,
        checkOutDate: editForm.checkOutDate ? editForm.checkOutDate : null,
        status: editForm.status,
        remarks: editForm.remarks.trim() ? editForm.remarks.trim() : null,
      });

      if (res.data.success) {
        setEditingStay(null);
        fetchStays();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update stay record");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteStay = async (s: any) => {
    const confirmed = await confirmDelete({
      title: "Delete Stay Record",
      itemName: `Stay #${s.id} — ${s.userName || "Guest"} (Flat ${s.flatNumber || s.flatId})`,
      itemType: "Stay Booking",
      message: `Are you sure you want to delete stay record #${s.id} for guest ${s.userName}?`,
      confirmText: "Delete Stay Record",
      dangerNote: "This will remove the stay record. Associated room occupancy and billing entries may need to be checked.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/stays/${s.id}`);
      if (res.data.success) {
        fetchStays();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete stay record");
    }
  };

  useEffect(() => {
    fetchStays();
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchStays();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Stay Logs & Historical Records
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Immutable log of: <strong>"Kaun kab aaya?"</strong> and <strong>"Kaun kab gaya?"</strong>
            </p>
          </div>

          {isSecretary && (
            <button
              onClick={() => setIsCheckInOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Record New Check-In</span>
            </button>
          )}
        </div>

        {actionError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by guest, room, mobile..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Stays</option>
            <option value="ACTIVE">Active Stays Only</option>
            <option value="COMPLETED">Completed Check-Outs</option>
          </select>
        </div>

        {/* Stays Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Arrival (Check-In)</th>
                  <th className="py-3.5 px-4">Departure (Check-Out)</th>
                  <th className="py-3.5 px-4">Monthly Rent</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading stay records...
                    </td>
                  </tr>
                ) : stays.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No stay records found.
                    </td>
                  </tr>
                ) : (
                  stays.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/guests/${s.userId}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition"
                        >
                          {s.userName}
                        </Link>
                        <span className="text-[11px] text-slate-500 block">{s.userMobile}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <Link
                          href={`/rooms/${s.roomId}`}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 hover:bg-slate-200"
                        >
                          #{s.roomNumber}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-semibold text-slate-800">{formatDate(s.checkInDate)}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {formatTime(s.checkInTime)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {s.checkOutDate ? (
                          <>
                            <span className="font-semibold text-slate-800">
                              {formatDate(s.checkOutDate)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {formatTime(s.checkOutTime)}
                            </span>
                          </>
                        ) : (
                          <span className="text-emerald-600 font-semibold italic text-[11px]">
                            Currently Staying
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {formatCurrency(s.monthlyRent)}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={s.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status === "ACTIVE" && isSecretary && (
                            <button
                              onClick={() => setCheckOutStay(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Check Out</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                            title="Edit Stay"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStay(s)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                            title="Delete Stay"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/guests/${s.userId}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Dossier"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSuccess={fetchStays}
      />

      {checkOutStay && (
        <CheckOutModal
          isOpen={!!checkOutStay}
          onClose={() => setCheckOutStay(null)}
          onSuccess={() => {
            fetchStays();
            setCheckOutStay(null);
          }}
          stayId={checkOutStay.id}
          guestName={checkOutStay.userName}
          roomNumber={checkOutStay.roomNumber}
          pendingAmount={0}
        />
      )}

      {/* Edit Stay Modal */}
      {editingStay && (
        <Modal
          isOpen={Boolean(editingStay)}
          onClose={() => setEditingStay(null)}
          title={`Edit Stay Record #${editingStay.id} (${editingStay.userName})`}
        >
          <form onSubmit={handleUpdateStay} className="space-y-4">
            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {editError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                value={editForm.monthlyRent}
                onChange={(e) =>
                  setEditForm({ ...editForm, monthlyRent: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Check-In Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                  value={editForm.checkInDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, checkInDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Check-Out Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                  value={editForm.checkOutDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, checkOutDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: e.target.value })
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remarks
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                value={editForm.remarks}
                onChange={(e) =>
                  setEditForm({ ...editForm, remarks: e.target.value })
                }
                placeholder="Optional notes or remarks"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStay(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
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
