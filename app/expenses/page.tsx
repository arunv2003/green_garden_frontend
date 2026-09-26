"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import {
  DollarSign,
  Search,
  Plus,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  PieChart,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function ExpensesPage() {
  const { confirmDelete } = useConfirm();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpensesSum, setTotalExpensesSum] = useState(0);

  // Add Expense Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "SECURITY",
    title: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMode: "BANK_TRANSFER",
    paidTo: "",
    notes: "",
  });

  // Edit Expense Modal
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    category: "SECURITY",
    title: "",
    amount: "",
    expenseDate: "",
    paymentMode: "BANK_TRANSFER",
    paidTo: "",
    notes: "",
  });

  const handleOpenEdit = (e: any) => {
    setEditingExpense(e);
    setEditForm({
      category: e.category || "SECURITY",
      title: e.title || "",
      amount: e.amount || "",
      expenseDate: e.expenseDate ? e.expenseDate.split("T")[0] : "",
      paymentMode: e.paymentMode || "BANK_TRANSFER",
      paidTo: e.paidTo || "",
      notes: e.notes || e.description || "",
    });
    setEditError(null);
  };

  const handleUpdateExpense = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editingExpense) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await api.put(`/expenses/${editingExpense.id}`, {
        category: editForm.category,
        title: editForm.title.trim(),
        amount: parseFloat(editForm.amount),
        expenseDate: editForm.expenseDate,
        paymentMode: editForm.paymentMode,
        paidTo: editForm.paidTo.trim() ? editForm.paidTo.trim() : null,
        description: editForm.notes.trim() ? editForm.notes.trim() : null,
      });

      if (res.data.success) {
        setEditingExpense(null);
        fetchExpenses();
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update expense");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteExpense = async (e: any) => {
    const confirmed = await confirmDelete({
      title: "Delete Expense Record",
      itemName: `${e.title} (${formatCurrency(e.amount)}) — ${e.category || "General"}`,
      itemType: "Society Expense",
      message: `Are you sure you want to delete the expense record "${e.title}"?`,
      confirmText: "Delete Expense",
      dangerNote: "This expense voucher will be permanently removed from financial reports and expense logs.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/expenses/${e.id}`);
      if (res.data.success) {
        fetchExpenses();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete expense");
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (categoryFilter !== "ALL") params.category = categoryFilter;

      const res = await api.get("/expenses", { params });
      const list = res.data.data || [];
      setExpenses(list);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? list.length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }

      // Sum
      const sum = list.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);
      setTotalExpensesSum(sum);
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, pageSize, categoryFilter]);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);

    try {
      const res = await api.post("/expenses", {
        category: formData.category,
        title: formData.title.trim(),
        amount: Number(formData.amount),
        expenseDate: formData.expenseDate,
        paymentMode: formData.paymentMode,
        paidTo: formData.paidTo.trim() ? formData.paidTo.trim() : undefined,
        notes: formData.notes.trim() ? formData.notes.trim() : undefined,
      });

      if (res.data.success) {
        setIsAddOpen(false);
        setFormData({
          category: "SECURITY",
          title: "",
          amount: "",
          expenseDate: new Date().toISOString().split("T")[0],
          paymentMode: "BANK_TRANSFER",
          paidTo: "",
          notes: "",
        });
        fetchExpenses();
      }
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to record expense");
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
                <DollarSign className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Society Operational Expenses
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track building maintenance expenditures, vendor salaries, electricity, lifts, and housekeeping payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Expense Categories</option>
              <option value="SECURITY">Security Guard Services</option>
              <option value="HOUSEKEEPING">Housekeeping & Cleaning</option>
              <option value="ELECTRICITY">Electricity & Diesel GenSet</option>
              <option value="WATER">Water Supply & Tankers</option>
              <option value="LIFT_AMC">Lift & Elevator AMC</option>
              <option value="GARDENING">Gardening & Landscaping</option>
              <option value="REPAIRS">Civil & Plumbing Repairs</option>
              <option value="LEGAL">Audit & Legal Fees</option>
              <option value="OTHER">Other Contingency</option>
            </select>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Filtered Page Expenses</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">
              {formatCurrency(totalExpensesSum)}
            </span>
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

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Expense Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Paid To (Vendor)</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading society expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No expense records found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {formatDate(e.expenseDate)}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900">
                        {e.title}
                        {e.notes && (
                          <span className="text-[11px] text-slate-400 block font-normal mt-0.5">
                            {e.notes}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                          {e.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-700 font-medium">
                        {e.paidTo || "—"}
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-mono text-[11px]">
                        {e.paymentMode}
                      </td>

                      <td className="py-4 px-4 text-right font-mono font-black text-slate-900 text-sm">
                        {formatCurrency(e.amount)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(e)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-transparent hover:border-emerald-200"
                            title="Edit Expense"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                            title="Delete Expense"
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

      {/* Record Expense Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record Operational Expense" maxWidth="md">
        <form onSubmit={handleRecordExpense} className="space-y-4">
          {addError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {addError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="SECURITY">Security Guard Services</option>
                <option value="HOUSEKEEPING">Housekeeping & Cleaning</option>
                <option value="ELECTRICITY">Electricity & Diesel GenSet</option>
                <option value="WATER">Water Supply & Tankers</option>
                <option value="LIFT_AMC">Lift & Elevator AMC</option>
                <option value="GARDENING">Gardening & Landscaping</option>
                <option value="REPAIRS">Civil & Plumbing Repairs</option>
                <option value="LEGAL">Audit & Legal Fees</option>
                <option value="OTHER">Other Contingency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title / Purpose *</label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Lift Maintenance AMC - Johnson Lifts"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 15000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI / QR</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paid To (Vendor / Agency)</label>
            <input
              type="text"
              placeholder="e.g. Apex Security Solutions Pvt Ltd"
              value={formData.paidTo}
              onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Bill Reference</label>
            <textarea
              rows={2}
              placeholder="Invoice number or payment reference..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {addLoading ? "Recording..." : "Record Expense"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        title={`Edit Expense: ${editingExpense?.title || ""}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateExpense} className="space-y-4">
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
                <option value="SECURITY">Security Services</option>
                <option value="CLEANING">Housekeeping & Cleaning</option>
                <option value="ELECTRICITY">Common Area Electricity</option>
                <option value="WATER">Water Supply & Pump</option>
                <option value="LIFT_MAINTENANCE">Lift AMC & Repair</option>
                <option value="GARDENING">Gardening & Landscaping</option>
                <option value="REPAIRS">Civil & Plumbing Repairs</option>
                <option value="ADMINISTRATIVE">Admin, Audit & Legal</option>
                <option value="OTHER">Other Operational Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={editForm.expenseDate}
                onChange={(e) => setEditForm({ ...editForm, expenseDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Title / Purpose *
            </label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-bold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Mode
              </label>
              <select
                value={editForm.paymentMode}
                onChange={(e) => setEditForm({ ...editForm, paymentMode: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI / QR</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paid To (Vendor / Agency)
            </label>
            <input
              type="text"
              value={editForm.paidTo}
              onChange={(e) => setEditForm({ ...editForm, paidTo: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Bill Reference
            </label>
            <textarea
              rows={2}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingExpense(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {editLoading ? "Saving..." : "Save Expense Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
