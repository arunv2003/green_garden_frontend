"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stayId: number;
  guestName: string;
  roomNumber: string;
  pendingAmount: number;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  stayId,
  guestName,
  roomNumber,
  pendingAmount,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 8);

  const [formData, setFormData] = useState({
    checkOutDate: todayStr,
    checkOutTime: nowTime,
    checkOutReason: "Completed Lease / Moving Out",
    securityDepositAdjustment: 0,
    remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post(`/stays/${stayId}/check-out`, {
        ...formData,
        securityDepositAdjustment: Number(formData.securityDepositAdjustment),
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Check-out failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Guest Check-Out" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-700">
          <p>
            <strong>Guest:</strong> {guestName}
          </p>
          <p>
            <strong>Room:</strong> {roomNumber}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-semibold">
            <span>Outstanding Pending Rent:</span>
            <span className={pendingAmount > 0 ? "text-rose-600 font-bold" : "text-emerald-600"}>
              {formatCurrency(pendingAmount)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Check-out Date *</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.checkOutDate}
              onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Check-out Time *</label>
            <input
              type="time"
              required
              step="1"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.checkOutTime}
              onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Checkout</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            value={formData.checkOutReason}
            onChange={(e) => setFormData({ ...formData, checkOutReason: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Security Deposit Adjustment / Refund (₹)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            value={formData.securityDepositAdjustment}
            onChange={(e) =>
              setFormData({ ...formData, securityDepositAdjustment: parseFloat(e.target.value) || 0 })
            }
          />
          <p className="text-[11px] text-slate-500 mt-0.5">
            Amount deducted for damages/dues or refunded to the guest.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Final Remarks</label>
          <textarea
            rows={2}
            placeholder="Key returned, room condition verified..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
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
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-xs disabled:opacity-50"
          >
            {loading ? "Processing..." : "Complete Check-Out"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
