"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { GenerateMaintenanceBillsModal } from "@/components/modals/GenerateMaintenanceBillsModal";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import {
  Receipt,
  Search,
  Plus,
  ArrowUpRight,
  Building2,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function MaintenanceBillsPage() {
  const { confirmDelete } = useConfirm();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  // Edit Bill Modal
  const [editingBill, setEditingBill] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    baseAmount: "",
    additionalCharges: "",
    lateFee: "",
    discount: "",
    dueDate: "",
    status: "UNPAID",
    remarks: "",
  });

  const handleOpenEdit = (b: any) => {
    setEditingBill(b);
    setEditForm({
      baseAmount: String(b.baseAmount || 0),
      additionalCharges: String(b.additionalCharges || 0),
      lateFee: String(b.lateFee || 0),
      discount: String(b.discount || 0),
      dueDate: b.dueDate ? b.dueDate.split("T")[0] : "",
      status: b.status || "UNPAID",
      remarks: b.remarks || "",
    });
    setEditError(null);
  };

  const handleUpdateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await api.put(`/maintenance/bills/${editingBill.id}`, {
        baseAmount: parseFloat(editForm.baseAmount) || 0,
        additionalCharges: parseFloat(editForm.additionalCharges) || 0,
        lateFee: parseFloat(editForm.lateFee) || 0,
        discount: parseFloat(editForm.discount) || 0,
        dueDate: editForm.dueDate || undefined,
        status: editForm.status,
        remarks: editForm.remarks.trim() ? editForm.remarks.trim() : null,
      });

      if (res.data.success) {
        setEditingBill(null);
        fetchBills();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update bill");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteBill = async (b: any) => {
    const confirmed = await confirmDelete({
      title: "Delete Maintenance Bill",
      itemName: `Bill #${b.id} — Flat ${b.flatNumber || b.flatId} (${formatCurrency(b.amount)})`,
      itemType: "Maintenance Bill",
      message: `Are you sure you want to delete maintenance bill #${b.id} for Flat ${b.flatNumber || b.flatId}?`,
      confirmText: "Delete Bill",
      dangerNote: "This will remove the bill invoice. Any associated unpaid pending balance calculations will be recalculated.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/maintenance/bills/${b.id}`);
      if (res.data.success) {
        fetchBills();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete bill");
    }
  };

  // Stats
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalCollected: 0,
    totalPending: 0,
  });

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (monthFilter !== "ALL") params.month = Number(monthFilter);
      if (yearFilter !== "ALL") params.year = Number(yearFilter);

      const res = await api.get("/maintenance", { params });
      const list = res.data.data || [];
      setBills(list);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? list.length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }

      // Calculate totals
      const billed = list.reduce((sum: number, b: any) => sum + Number(b.totalAmount || 0), 0);
      const collected = list.reduce((sum: number, b: any) => sum + Number(b.paidAmount || 0), 0);
      const pending = list.reduce((sum: number, b: any) => sum + Number(b.pendingAmount || 0), 0);
      setStats({ totalBilled: billed, totalCollected: collected, totalPending: pending });
    } catch (err) {
      console.error("Failed to load maintenance bills", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [page, pageSize, statusFilter, monthFilter, yearFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchBills();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenPayment = (bill: any) => {
    setSelectedBill(bill);
    setIsRecordPaymentOpen(true);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Society Maintenance Invoices
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated monthly maintenance assessment, collections, outstanding dues, and payment tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Monthly Bills</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Invoiced</p>
              <p className="text-xl font-black text-slate-900 font-mono">{formatCurrency(stats.totalBilled)}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Collected</p>
              <p className="text-xl font-black text-emerald-700 font-mono">{formatCurrency(stats.totalCollected)}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Outstanding Dues</p>
              <p className="text-xl font-black text-rose-700 font-mono">{formatCurrency(stats.totalPending)}</p>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search flat, resident, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="ALL">All Months</option>
              {monthNames.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="ALL">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>

        {actionError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Maintenance Bills Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Flat No</th>
                  <th className="py-3.5 px-4">Resident</th>
                  <th className="py-3.5 px-4">Billing Month</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Base Charge</th>
                  <th className="py-3.5 px-4">Prev Dues</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Paid</th>
                  <th className="py-3.5 px-4">Pending</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      Loading maintenance bills...
                    </td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      No maintenance invoices found for this selection.
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 font-bold">
                        <Link
                          href={`/flats/${bill.flatId}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs hover:bg-emerald-100 transition inline-flex items-center gap-1"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Flat {bill.flatNumber || `#${bill.flatId}`}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-4">
                        {bill.residentName ? (
                          <div>
                            <div className="font-bold text-slate-900">{bill.residentName}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              {bill.residentType && (
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                                  bill.residentType === "OWNER"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}>
                                  {bill.residentType}
                                </span>
                              )}
                              {(bill.residentPhone || bill.residentMobile) && (
                                <span className="font-mono text-slate-400">
                                  {bill.residentPhone || bill.residentMobile}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 italic">
                            Vacant Flat
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {bill.billingMonth}
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {bill.dueDate ? formatDate(bill.dueDate) : "-"}
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-600">
                        {formatCurrency(bill.baseAmount)}
                      </td>

                      <td className="py-4 px-4 font-mono">
                        {Number(bill.previousDues || 0) > 0 ? (
                          <span className="font-bold text-amber-700">
                            {formatCurrency(bill.previousDues)}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {formatCurrency(0)}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(bill.totalAmount)}
                      </td>

                      <td className="py-4 px-4 font-mono text-emerald-700">
                        {formatCurrency(bill.paidAmount || 0)}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-rose-700">
                        {formatCurrency(bill.pendingAmount || 0)}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          bill.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : bill.status === "PARTIAL"
                            ? "bg-blue-100 text-blue-800"
                            : bill.status === "OVERDUE"
                            ? "bg-rose-100 text-rose-800 font-black"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {bill.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {bill.pendingAmount > 0 ? (
                            <button
                              onClick={() => handleOpenPayment(bill)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                            </span>
                          )}
                          <button
                            onClick={() => handleOpenEdit(bill)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                            title="Edit Bill"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBill(bill)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                            title="Delete Bill"
                          >
                            <Trash2 className="w-4 h-4" />
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

      <GenerateMaintenanceBillsModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={fetchBills}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onSuccess={() => {
          fetchBills();
        }}
        preselectedFlatId={selectedBill?.flatId}
        preselectedResidentId={selectedBill?.residentId}
        preselectedRoomId={selectedBill?.flatId}
        preselectedStayId={selectedBill?.residentId}
        preselectedMaintenanceBillId={selectedBill?.id}
        preselectedAmount={selectedBill?.pendingAmount}
        preselectedBillingMonth={selectedBill?.billingMonth}
        preselectedBillingYear={selectedBill?.billingYear}
      />

      {/* Edit Bill Modal */}
      {editingBill && (
        <Modal
          isOpen={Boolean(editingBill)}
          onClose={() => setEditingBill(null)}
          title={`Edit Maintenance Bill #${editingBill.id}`}
        >
          <form onSubmit={handleUpdateBill} className="space-y-4">
            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {editError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base Maintenance Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                value={editForm.baseAmount}
                onChange={(e) =>
                  setEditForm({ ...editForm, baseAmount: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Addl Charges (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                  value={editForm.additionalCharges}
                  onChange={(e) =>
                    setEditForm({ ...editForm, additionalCharges: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Late Fee (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                  value={editForm.lateFee}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lateFee: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                  value={editForm.discount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, discount: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dueDate: e.target.value })
                  }
                />
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
                  <option value="UNPAID">UNPAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PAID">PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>
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
                onClick={() => setEditingBill(null)}
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
