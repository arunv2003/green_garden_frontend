"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId?: number) => void;
  preselectedUserId?: number;
  preselectedRoomId?: number;
  preselectedStayId?: number;
  preselectedFlatId?: number;
  preselectedResidentId?: number;
  preselectedMaintenanceBillId?: number;
  preselectedAmount?: number | string;
  preselectedBillingMonth?: number;
  preselectedBillingYear?: number;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedUserId,
  preselectedRoomId,
  preselectedStayId,
  preselectedFlatId,
  preselectedResidentId,
  preselectedMaintenanceBillId,
  preselectedAmount,
  preselectedBillingMonth,
  preselectedBillingYear,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [residents, setResidents] = useState<any[]>([]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    userId: preselectedUserId || "",
    roomId: preselectedFlatId || preselectedRoomId || "",
    stayId: preselectedResidentId || preselectedStayId || "",
    flatId: preselectedFlatId || preselectedRoomId || "",
    residentId: preselectedResidentId || preselectedStayId || "",
    maintenanceBillId: preselectedMaintenanceBillId || "",
    billingMonth: preselectedBillingMonth || currentMonth,
    billingYear: preselectedBillingYear || currentYear,
    amount: preselectedAmount !== undefined && preselectedAmount !== null ? String(preselectedAmount) : "",
    paymentDate: todayStr,
    paymentMethod: "CASH",
    transactionId: "",
    remarks: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        userId: preselectedUserId || "",
        roomId: preselectedFlatId || preselectedRoomId || "",
        stayId: preselectedResidentId || preselectedStayId || "",
        flatId: preselectedFlatId || preselectedRoomId || "",
        residentId: preselectedResidentId || preselectedStayId || "",
        maintenanceBillId: preselectedMaintenanceBillId || "",
        billingMonth: preselectedBillingMonth || currentMonth,
        billingYear: preselectedBillingYear || currentYear,
        amount: preselectedAmount !== undefined && preselectedAmount !== null ? String(preselectedAmount) : "",
        paymentDate: todayStr,
        paymentMethod: "CASH",
        transactionId: "",
        remarks: "",
      });
      loadResidents();
    }
  }, [
    isOpen,
    preselectedMaintenanceBillId,
    preselectedResidentId,
    preselectedFlatId,
    preselectedStayId,
    preselectedRoomId,
    preselectedUserId,
    preselectedAmount,
    preselectedBillingMonth,
    preselectedBillingYear,
  ]);

  const loadResidents = async () => {
    try {
      const res = await api.get("/residents");
      const list = res.data.data || [];
      setResidents(list);

      const targetResidentId = preselectedResidentId || preselectedStayId;
      const targetUserId = preselectedUserId;
      const targetRoomId = preselectedFlatId || preselectedRoomId;

      const found = list.find(
        (r: any) =>
          (targetResidentId && (r.id === targetResidentId || r.stayId === targetResidentId)) ||
          (targetUserId && r.userId === targetUserId) ||
          (targetRoomId && (r.flatId === targetRoomId || r.roomId === targetRoomId))
      );

      if (found) {
        setFormData((prev) => ({
          ...prev,
          userId: found.userId || prev.userId,
          roomId: found.flatId || found.roomId || prev.roomId || 1,
          flatId: found.flatId || found.roomId || prev.flatId || 1,
          stayId: found.stayId || found.id || prev.stayId,
          residentId: found.id || found.stayId || prev.residentId,
          amount: prev.amount || (Number(found.totalPending || 0) > 0 ? found.totalPending.toString() : ""),
        }));
      }
    } catch (err) {
      console.error("Failed to load residents for payment modal", err);
    }
  };

  const handleResidentSelect = (selectedIdStr: string) => {
    const sId = parseInt(selectedIdStr, 10);
    const r = residents.find((item) => item.id === sId || item.stayId === sId);
    if (r) {
      setFormData((prev) => ({
        ...prev,
        stayId: r.stayId || r.id,
        residentId: r.id || r.stayId,
        userId: r.userId,
        roomId: r.flatId || r.roomId || 1,
        flatId: r.flatId || r.roomId || 1,
        amount: Number(r.totalPending || 0) > 0 ? r.totalPending.toString() : prev.amount,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/payments", {
        userId: formData.userId ? Number(formData.userId) : undefined,
        roomId: formData.roomId ? Number(formData.roomId) : (formData.flatId ? Number(formData.flatId) : undefined),
        stayId: formData.stayId ? Number(formData.stayId) : (formData.residentId ? Number(formData.residentId) : undefined),
        flatId: formData.flatId ? Number(formData.flatId) : (formData.roomId ? Number(formData.roomId) : undefined),
        residentId: formData.residentId ? Number(formData.residentId) : (formData.stayId ? Number(formData.stayId) : undefined),
        maintenanceBillId: formData.maintenanceBillId ? Number(formData.maintenanceBillId) : undefined,
        billingMonth: Number(formData.billingMonth),
        billingYear: Number(formData.billingYear),
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId ? formData.transactionId.trim() : undefined,
        remarks: formData.remarks ? formData.remarks.trim() : undefined,
      });

      if (res.data.success) {
        onSuccess(res.data.data.id);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Rent Payment" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Resident & Flat / Room *
          </label>
          <select
            required
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            value={formData.stayId}
            onChange={(e) => handleResidentSelect(e.target.value)}
          >
            <option value="">-- Choose Active Resident --</option>
            {residents.map((r, idx) => {
              const uniqueKey = r.id ? `res-${r.id}` : r.stayId ? `stay-${r.stayId}` : `idx-${idx}`;
              const val = String(r.id || r.stayId || "");
              const name = r.fullName || r.userName || "Resident";
              const unit = r.flatNumber ? `Flat ${r.flatNumber}` : r.roomNumber ? `Room ${r.roomNumber}` : `#${r.flatId || r.roomId || ""}`;
              const pending = r.totalPending !== undefined ? ` (Pending: ₹${r.totalPending})` : "";
              return (
                <option key={uniqueKey} value={val}>
                  {name} — {unit}{pending}
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Month *</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              value={formData.billingMonth}
              onChange={(e) => setFormData({ ...formData, billingMonth: parseInt(e.target.value, 10) })}
            >
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Year *</label>
            <input
              type="number"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.billingYear}
              onChange={(e) => setFormData({ ...formData, billingYear: parseInt(e.target.value, 10) || currentYear })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid (₹) *</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 5000"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-semibold text-emerald-700"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date *</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              <option value="CARD">Debit / Credit Card</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction / Ref ID</label>
            <input
              type="text"
              placeholder="Optional for Cash"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono text-xs"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Remarks</label>
          <input
            type="text"
            placeholder="Partial payment, second installment..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.stayId || !formData.amount}
            className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs disabled:opacity-50"
          >
            {loading ? "Recording..." : "Record & Generate Receipt"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
