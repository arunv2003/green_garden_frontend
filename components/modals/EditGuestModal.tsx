"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";

interface EditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  guest: any;
}

export const EditGuestModal: React.FC<EditGuestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  guest,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    status: "ACTIVE",
    fatherHusbandName: "",
    address: "",
    idProofType: "Aadhaar Card",
    idProofNumber: "",
    emergencyContact: "",
    password: "",
  });

  useEffect(() => {
    if (guest && isOpen) {
      setFormData({
        name: guest.name || "",
        email: guest.email || "",
        mobile: guest.mobile || "",
        status: guest.status || "ACTIVE",
        fatherHusbandName: guest.fatherHusbandName || "",
        address: guest.address || "",
        idProofType: guest.idProofType || "Aadhaar Card",
        idProofNumber: guest.idProofNumber || "",
        emergencyContact: guest.emergencyContact || "",
        password: "",
      });
      setError(null);
    }
  }, [guest, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        status: formData.status,
        fatherHusbandName: formData.fatherHusbandName.trim() || undefined,
        address: formData.address.trim() || undefined,
        idProofType: formData.idProofType,
        idProofNumber: formData.idProofNumber.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim() || undefined,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const res = await api.put(`/guests/${guest.id}`, payload);
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update guest");
    } finally {
      setLoading(false);
    }
  };

  if (!guest) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Guest: ${guest.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Father/Husband Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
              value={formData.fatherHusbandName}
              onChange={(e) =>
                setFormData({ ...formData, fatherHusbandName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Contact
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
              value={formData.emergencyContact}
              onChange={(e) =>
                setFormData({ ...formData, emergencyContact: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ID Proof Type
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
              value={formData.idProofType}
              onChange={(e) =>
                setFormData({ ...formData, idProofType: e.target.value })
              }
            >
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Passport">Passport</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Driving License">Driving License</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ID Proof Number
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
              value={formData.idProofNumber}
              onChange={(e) =>
                setFormData({ ...formData, idProofNumber: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Permanent Address
          </label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reset Password (leave empty to keep current)
          </label>
          <input
            type="password"
            placeholder="New password (optional)"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
