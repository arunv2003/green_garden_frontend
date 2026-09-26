"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";

interface EditResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resident: any | null;
}

export const EditResidentModal: React.FC<EditResidentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  resident,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    residentType: "OWNER" as "OWNER" | "TENANT",
    name: "",
    phone: "",
    email: "",
    moveInDate: "",
    status: "ACTIVE",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  useEffect(() => {
    if (isOpen && resident) {
      setFormData({
        residentType: resident.residentType || "OWNER",
        name: resident.fullName || resident.userName || resident.name || "",
        phone: resident.mobile || resident.userPhone || resident.phone || "",
        email: resident.email || resident.userEmail || "",
        moveInDate: resident.moveInDate ? resident.moveInDate.split("T")[0] : "",
        status: resident.status || "ACTIVE",
        emergencyContactName: resident.emergencyContactName || "",
        emergencyContactPhone: resident.emergencyContactPhone || "",
      });
      setError(null);
    }
  }, [isOpen, resident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident) return;
    setError(null);
    setLoading(true);

    try {
      const cleanName = formData.name.trim();
      const cleanPhone = formData.phone.trim();
      const res = await api.put(`/residents/${resident.id}`, {
        residentType: formData.residentType,
        fullName: cleanName,
        name: cleanName,
        mobile: cleanPhone,
        phone: cleanPhone,
        email: formData.email.trim() ? formData.email.trim() : undefined,
        moveInDate: formData.moveInDate || undefined,
        status: formData.status,
        emergencyContactName: formData.emergencyContactName.trim()
          ? formData.emergencyContactName.trim()
          : undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim()
          ? formData.emergencyContactPhone.trim()
          : undefined,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update resident details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Resident: ${resident?.userName || resident?.name || ""}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resident Type *
            </label>
            <select
              value={formData.residentType}
              onChange={(e) =>
                setFormData({ ...formData, residentType: e.target.value as "OWNER" | "TENANT" })
              }
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="OWNER">Owner</option>
              <option value="TENANT">Tenant</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive (Moved Out)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            placeholder="Resident full name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
              placeholder="10-digit mobile"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="user@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Move-In Date</label>
          <input
            type="date"
            value={formData.moveInDate}
            onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={formData.emergencyContactName}
              onChange={(e) =>
                setFormData({ ...formData, emergencyContactName: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Relative or guardian"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) =>
                setFormData({ ...formData, emergencyContactPhone: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              placeholder="Emergency phone"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition disabled:opacity-50"
          >
            {loading ? "Saving Changes..." : "Save Resident Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
