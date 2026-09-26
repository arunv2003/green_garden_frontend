"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";
import { ShieldAlert, UserCheck, RefreshCw, Lock, Sparkles, CheckCircle2 } from "lucide-react";

interface ChangeSecretaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentSecretary?: any;
}

export const ChangeSecretaryModal: React.FC<ChangeSecretaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentSecretary,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"UPDATE" | "REPLACE_NEW">("UPDATE");

  const [formData, setFormData] = useState({
    id: currentSecretary?.id || undefined,
    name: currentSecretary?.name || "",
    email: currentSecretary?.email || "",
    mobile: currentSecretary?.mobile || "",
    password: "",
    fatherHusbandName: currentSecretary?.fatherHusbandName || "",
    address: currentSecretary?.address || "",
    idProofType: currentSecretary?.idProofType || "Aadhaar Card",
    idProofNumber: currentSecretary?.idProofNumber || "",
    emergencyContact: currentSecretary?.emergencyContact || "",
  });

  useEffect(() => {
    if (currentSecretary) {
      setFormData({
        id: currentSecretary.id,
        name: currentSecretary.name || "",
        email: currentSecretary.email || "",
        mobile: currentSecretary.mobile || "",
        password: "",
        fatherHusbandName: currentSecretary.fatherHusbandName || "",
        address: currentSecretary.address || "",
        idProofType: currentSecretary.idProofType || "Aadhaar Card",
        idProofNumber: currentSecretary.idProofNumber || "",
        emergencyContact: currentSecretary.emergencyContact || "",
      });
    }
  }, [currentSecretary, isOpen]);

  const handleModeChange = (newMode: "UPDATE" | "REPLACE_NEW") => {
    setMode(newMode);
    setError(null);
    if (newMode === "REPLACE_NEW") {
      setFormData({
        id: undefined,
        name: "",
        email: "",
        mobile: "",
        password: "Secretary@123",
        fatherHusbandName: "",
        address: "",
        idProofType: "Aadhaar Card",
        idProofNumber: "",
        emergencyContact: "",
      });
    } else if (currentSecretary) {
      setFormData({
        id: currentSecretary.id,
        name: currentSecretary.name || "",
        email: currentSecretary.email || "",
        mobile: currentSecretary.mobile || "",
        password: "",
        fatherHusbandName: currentSecretary.fatherHusbandName || "",
        address: currentSecretary.address || "",
        idProofType: currentSecretary.idProofType || "Aadhaar Card",
        idProofNumber: currentSecretary.idProofNumber || "",
        emergencyContact: currentSecretary.emergencyContact || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.put("/staff/secretary", {
        ...formData,
        mode,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change secretary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "UPDATE" ? "Update Secretary Details" : "Assign & Replace Secretary"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleModeChange("UPDATE")}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              mode === "UPDATE"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Update Existing Secretary
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("REPLACE_NEW")}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              mode === "REPLACE_NEW"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Assign New Secretary
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {mode === "REPLACE_NEW" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Important:</span> Creating a new secretary will automatically deactivate the previous secretary ({currentSecretary?.name || "Sunita Verma"}). The new secretary will immediately take over room and check-in operations.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Secretary Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="e.g. Sunita Verma / New Secretary"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Official Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="e.g. secretary@greengarden.com"
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
              placeholder="e.g. 9876543210"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {mode === "UPDATE" ? "Reset / New Password (Optional)" : "Login Password *"}
            </label>
            <input
              type="text"
              required={mode === "REPLACE_NEW"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder={mode === "UPDATE" ? "Leave blank to keep unchanged" : "e.g. Secretary@123"}
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">ID Proof Type</label>
            <select
              value={formData.idProofType}
              onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
            >
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Passport">Passport</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">ID Proof Number</label>
            <input
              type="text"
              value={formData.idProofNumber}
              onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="e.g. 9123-4567-8901"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Father / Husband Name</label>
            <input
              type="text"
              value={formData.fatherHusbandName}
              onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              placeholder="e.g. Ramesh Verma"
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
            <label className="block text-slate-700 font-semibold mb-1">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
              placeholder="e.g. Green Garden Staff Quarters, Floor 1, Delhi"
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
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? "Saving..." : mode === "UPDATE" ? "Save Changes" : "Confirm New Secretary"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
