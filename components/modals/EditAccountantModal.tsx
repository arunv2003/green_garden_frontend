"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";

interface EditAccountantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountant: any;
}

export const EditAccountantModal: React.FC<EditAccountantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accountant,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "ACCOUNTANT",
    password: "",
    status: "ACTIVE",
    fatherHusbandName: "",
    address: "",
    idProofType: "PAN Card",
    idProofNumber: "",
    emergencyContact: "",
  });

  useEffect(() => {
    if (accountant) {
      setFormData({
        name: accountant.name || "",
        email: accountant.email || "",
        mobile: accountant.mobile || "",
        role: accountant.role || "ACCOUNTANT",
        password: "",
        status: accountant.status || "ACTIVE",
        fatherHusbandName: accountant.fatherHusbandName || "",
        address: accountant.address || "",
        idProofType: accountant.idProofType || "PAN Card",
        idProofNumber: accountant.idProofNumber || "",
        emergencyContact: accountant.emergencyContact || "",
      });
    }
  }, [accountant, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountant) return;
    setError(null);
    setLoading(true);

    try {
      const res = await api.put(`/staff/accountant/${accountant.id}`, formData);
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Staff Member Profile" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Role Selection */}
          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-bold mb-1.5">Role *</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  formData.role === "ACCOUNTANT"
                    ? "bg-indigo-50/90 border-indigo-300 text-indigo-950 ring-2 ring-indigo-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <input
                  type="radio"
                  name="editRole"
                  value="ACCOUNTANT"
                  checked={formData.role === "ACCOUNTANT"}
                  onChange={() => setFormData({ ...formData, role: "ACCOUNTANT" })}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs block text-slate-900">Accountant</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Finance, receipts, and payments
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  formData.role === "SECRETARY"
                    ? "bg-teal-50/90 border-teal-300 text-teal-950 ring-2 ring-teal-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                }`}
              >
                <input
                  type="radio"
                  name="editRole"
                  value="SECRETARY"
                  checked={formData.role === "SECRETARY"}
                  onChange={() => setFormData({ ...formData, role: "SECRETARY" })}
                  className="mt-0.5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-bold text-xs block text-slate-900">Secretary</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Operations, room assignment, and check-in/out
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Mobile Number *</label>
            <input
              type="text"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Reset Password (Optional)
            </label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="Leave blank to keep unchanged"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">ID Proof Number</label>
            <input
              type="text"
              value={formData.idProofNumber}
              onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">Permanent Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
