"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";
import { UserCheck, ShieldCheck, Mail, Phone, Lock, FileText, MapPin, PhoneCall } from "lucide-react";

interface AddAccountantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAccountantModal: React.FC<AddAccountantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "ACCOUNTANT",
    password: "Accountant@123",
    fatherHusbandName: "",
    address: "",
    idProofType: "PAN Card",
    idProofNumber: "",
    emergencyContact: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/staff/accountant", formData);
      if (res.data.success) {
        onSuccess();
        onClose();
        setFormData({
          name: "",
          email: "",
          mobile: "",
          role: "ACCOUNTANT",
          password: "Accountant@123",
          fatherHusbandName: "",
          address: "",
          idProofType: "PAN Card",
          idProofNumber: "",
          emergencyContact: "",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create staff member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Staff Member" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Role Selection */}
          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-bold mb-1.5">Select Role *</label>
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
                  name="role"
                  value="ACCOUNTANT"
                  checked={formData.role === "ACCOUNTANT"}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      role: "ACCOUNTANT",
                      password: formData.password === "Secretary@123" ? "Accountant@123" : formData.password,
                    })
                  }
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-xs block text-slate-900">Accountant</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Financial officer: handles payments, billing, and receipts.
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
                  name="role"
                  value="SECRETARY"
                  checked={formData.role === "SECRETARY"}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      role: "SECRETARY",
                      password: formData.password === "Accountant@123" ? "Secretary@123" : formData.password,
                    })
                  }
                  className="mt-0.5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-bold text-xs block text-slate-900">Secretary</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Operations head: room assignment, guest check-in & check-out.
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
              placeholder="e.g. Vikas Gupta"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Official Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="e.g. vikas@greengarden.com"
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
              placeholder="e.g. 9876543299"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Initial Password *</label>
            <input
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">ID Proof Type</label>
            <select
              value={formData.idProofType}
              onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
            >
              <option value="PAN Card">PAN Card</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">ID Proof Number</label>
            <input
              type="text"
              value={formData.idProofNumber}
              onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="e.g. ABCDE1234F"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Father / Husband Name</label>
            <input
              type="text"
              value={formData.fatherHusbandName}
              onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="e.g. Ramesh Gupta"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Emergency Contact</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="e.g. 9876543200"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">Permanent Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
              placeholder="e.g. Sector 12, Dwarka, New Delhi"
            />
          </div>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>New accountant will have full access to financial books, ledgers, billing runs, and reports.</span>
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
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? "Creating Accountant..." : "Create Accountant"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
