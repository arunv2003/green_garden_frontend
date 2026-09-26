"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";
import { Users, UserCheck, ShieldCheck } from "lucide-react";

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialRole?: "USER" | "ACCOUNTANT" | "SECRETARY";
}

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = "USER",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: initialRole,
    password: initialRole === "SECRETARY" ? "Secretary@123" : initialRole === "ACCOUNTANT" ? "Accountant@123" : "User@123",
    fatherHusbandName: "",
    address: "",
    idProofType: initialRole === "ACCOUNTANT" ? "PAN Card" : "Aadhaar Card",
    idProofNumber: "",
    emergencyContact: "",
    joiningDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        role: initialRole,
        password: initialRole === "SECRETARY" ? "Secretary@123" : initialRole === "ACCOUNTANT" ? "Accountant@123" : "User@123",
        idProofType: initialRole === "ACCOUNTANT" ? "PAN Card" : "Aadhaar Card",
      }));
      setError(null);
    }
  }, [isOpen, initialRole]);

  const handleRoleChange = (newRole: "USER" | "ACCOUNTANT" | "SECRETARY") => {
    setFormData((prev) => {
      let defaultPass = "User@123";
      let defaultId = "Aadhaar Card";
      if (newRole === "SECRETARY") {
        defaultPass = "Secretary@123";
      } else if (newRole === "ACCOUNTANT") {
        defaultPass = "Accountant@123";
        defaultId = "PAN Card";
      }

      return {
        ...prev,
        role: newRole,
        password: defaultPass,
        idProofType: defaultId,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/guests", formData);
      if (res.data.success) {
        onSuccess();
        onClose();
        setFormData({
          name: "",
          email: "",
          mobile: "",
          role: initialRole,
          password: initialRole === "SECRETARY" ? "Secretary@123" : initialRole === "ACCOUNTANT" ? "Accountant@123" : "User@123",
          fatherHusbandName: "",
          address: "",
          idProofType: initialRole === "ACCOUNTANT" ? "PAN Card" : "Aadhaar Card",
          idProofNumber: "",
          emergencyContact: "",
          joiningDate: new Date().toISOString().slice(0, 10),
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user account");
    } finally {
      setLoading(false);
    }
  };

  const modalTitle =
    formData.role === "SECRETARY"
      ? "Create Secretary Account"
      : formData.role === "ACCOUNTANT"
      ? "Create Accountant Account"
      : "Register New Resident / Guest";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Role Selection Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Account Type / Role *</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "USER", label: "Guest / Resident", icon: Users, desc: "Room tenant", activeClass: "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 text-emerald-950" },
              { id: "ACCOUNTANT", label: "Accountant", icon: UserCheck, desc: "Billing & Ledger", activeClass: "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20 text-indigo-950" },
              { id: "SECRETARY", label: "Secretary", icon: ShieldCheck, desc: "Management Admin", activeClass: "bg-purple-50 border-purple-400 ring-2 ring-purple-500/20 text-purple-950" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleChange(r.id as any)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  formData.role === r.id
                    ? r.activeClass
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <r.icon className="w-3.5 h-3.5" />
                  <span>{r.label}</span>
                </div>
                <span className="text-[10px] text-slate-500">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
            <input
              type="tel"
              required
              placeholder="10 digit mobile"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="user@example.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Login Password *</label>
            <input
              type="text"
              required
              placeholder="Secret password"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Father's / Husband's Name</label>
            <input
              type="text"
              placeholder="Optional"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.fatherHusbandName}
              onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact No</label>
            <input
              type="tel"
              placeholder="Family / Guardian contact"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ID Proof Type</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              value={formData.idProofType}
              onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
            >
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Passport">Passport</option>
              <option value="Driving License">Driving License</option>
              <option value="Voter ID">Voter ID</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ID Proof Number</label>
            <input
              type="text"
              placeholder="e.g. 1234-5678-9012"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.idProofNumber}
              onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Address</label>
          <textarea
            rows={2}
            placeholder="Street address, city, state, pin code..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
            className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs disabled:opacity-50"
          >
            {loading ? "Registering..." : `Create ${formData.role === "USER" ? "Guest" : formData.role === "ACCOUNTANT" ? "Accountant" : "Secretary"}`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const AddUserModal = AddGuestModal;
