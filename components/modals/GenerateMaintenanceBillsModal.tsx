"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";

interface GenerateMaintenanceBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GenerateMaintenanceBillsModal: React.FC<GenerateMaintenanceBillsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  
  // Default due date to 10th of the billing month
  const defaultDueDate = new Date(now.getFullYear(), now.getMonth(), 10).toISOString().split("T")[0];
  const [dueDate, setDueDate] = useState(defaultDueDate);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/maintenance/generate", {
        billingMonth: Number(month),
        billingYear: Number(year),
        month: Number(month),
        year: Number(year),
        dueDate,
      });

      if (res.data.success) {
        alert(res.data.message || "Maintenance bills generated successfully!");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate maintenance bills");
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Monthly Maintenance Bills" maxWidth="sm">
      <form onSubmit={handleGenerate} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <p className="text-xs text-slate-500">
          This automated action will generate maintenance invoices for all currently occupied flats in Green Garden Society for the selected month, rolling forward any unpaid previous dues.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Year</label>
            <input
              type="number"
              min="2020"
              max="2030"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-[10px] text-slate-400 block mt-1">Bills unpaid after this date will show as Overdue.</span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
          >
            {loading ? "Generating Bills..." : "Generate Bills for All Flats"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
