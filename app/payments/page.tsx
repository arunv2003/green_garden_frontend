"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import { PaymentReceiptModal } from "@/components/modals/PaymentReceiptModal";
import { Modal } from "@/components/ui/Modal";
import {
  CreditCard,
  Search,
  PlusCircle,
  Printer,
  Calendar,
  Building2,
  FileSpreadsheet,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";

import { Pagination } from "@/components/ui/Pagination";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function PaymentsPage() {
  const { confirmDelete } = useConfirm();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<number | null>(null);

  // Edit Payment State
  const [editingPayment, setEditingPayment] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    paymentMethod: "CASH",
    transactionId: "",
    status: "PAID",
    remarks: "",
  });

  const currentUser = getStoredUser();
  const isAccountant = currentUser?.role === "ACCOUNTANT";

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (methodFilter !== "ALL") params.paymentMethod = methodFilter;

      const res = await api.get("/payments", { params });
      setPayments(res.data.data || []);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? (res.data.data || []).length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }
    } catch (err) {
      console.error("Failed to load payments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (p: any) => {
    setEditingPayment(p);
    setEditForm({
      paymentMethod: p.paymentMethod || "CASH",
      transactionId: p.transactionId || "",
      status: p.status || "PAID",
      remarks: p.remarks || "",
    });
    setEditError(null);
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await api.put(`/payments/${editingPayment.id}`, {
        paymentMethod: editForm.paymentMethod,
        transactionId: editForm.transactionId.trim() ? editForm.transactionId.trim() : null,
        status: editForm.status,
        remarks: editForm.remarks.trim() ? editForm.remarks.trim() : null,
      });

      if (res.data.success) {
        setEditingPayment(null);
        fetchPayments();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update payment");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePayment = async (p: any) => {
    const confirmed = await confirmDelete({
      title: "Delete Payment Receipt",
      itemName: `Receipt #${p.receiptNumber} — Flat ${p.flatNumber || p.flatId} (${formatCurrency(p.amount)})`,
      itemType: "Payment Transaction",
      message: `Are you sure you want to delete payment receipt #${p.receiptNumber} (${formatCurrency(p.amount)})? Associated pending dues will be readjusted.`,
      confirmText: "Delete Payment",
      dangerNote: "Deleting this payment will recalculate dues and reverse credit applied to outstanding bills.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/payments/${p.id}`);
      if (res.data.success) {
        fetchPayments();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete payment");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, pageSize, methodFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPayments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const totalCollected = payments.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Payment Transactions
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Immutable ledger of all rent receipts, partial payments, and transaction records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-2 hidden sm:block">
              <span className="text-[11px] text-slate-400 block font-semibold uppercase">Total Displayed</span>
              <span className="text-xl font-black text-emerald-700">{formatCurrency(totalCollected)}</span>
            </div>

            {isAccountant && (
              <button
                onClick={() => setIsRecordOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search receipt #, guest, room, transaction ID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="ALL">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {actionError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Method & Ref</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Remaining Pending</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading payment transactions...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No payments found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {p.receiptNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/guests/${p.userId}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition"
                        >
                          {p.userName}
                        </Link>
                        <span className="text-[11px] text-slate-400 block">{p.userMobile}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <Link
                          href={`/rooms/${p.roomId}`}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 hover:bg-slate-200"
                        >
                          #{p.roomNumber}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {formatDate(p.paymentDate)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{p.paymentMethod}</span>
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px] block">
                          {p.transactionId || "—"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-700 text-sm">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        {formatCurrency(p.remainingPending)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedReceiptId(p.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg border border-emerald-200 transition text-xs"
                            title="Print / View Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                            title="Edit Payment"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(p)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                            title="Delete Payment"
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

      <RecordPaymentModal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        onSuccess={(id) => {
          fetchPayments();
          if (id) setSelectedReceiptId(id);
        }}
      />

      <PaymentReceiptModal
        isOpen={!!selectedReceiptId}
        onClose={() => setSelectedReceiptId(null)}
        paymentId={selectedReceiptId}
      />

      {/* Edit Payment Modal */}
      {editingPayment && (
        <Modal
          isOpen={Boolean(editingPayment)}
          onClose={() => setEditingPayment(null)}
          title={`Edit Payment #${editingPayment.receiptNumber}`}
        >
          <form onSubmit={handleUpdatePayment} className="space-y-4">
            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {editError}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                value={editForm.paymentMethod}
                onChange={(e) =>
                  setEditForm({ ...editForm, paymentMethod: e.target.value })
                }
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction / Reference ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
                value={editForm.transactionId}
                onChange={(e) =>
                  setEditForm({ ...editForm, transactionId: e.target.value })
                }
                placeholder="e.g. UPI Ref / Bank UTR"
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
                <option value="PAID">PAID</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="FAILED">FAILED</option>
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
                onClick={() => setEditingPayment(null)}
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
