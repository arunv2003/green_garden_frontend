"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";

interface AddResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddResidentModal: React.FC<AddResidentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flats, setFlats] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    flatId: "",
    residentType: "OWNER" as "OWNER" | "TENANT",
    name: "",
    phone: "",
    email: "",
    moveInDate: new Date().toISOString().split("T")[0],
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  useEffect(() => {
    if (isOpen) {
      api.get("/flats", { params: { limit: 100 } }).then((res) => {
        const list = res.data?.data || [];
        setFlats(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, flatId: String(list[0].id) }));
        }
      }).catch((err) => console.error("Failed to load flats", err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanName = formData.name.trim();
      const cleanPhone = formData.phone.trim();
      const res = await api.post("/residents", {
        flatId: Number(formData.flatId),
        residentType: formData.residentType,
        fullName: cleanName,
        name: cleanName,
        mobile: cleanPhone,
        phone: cleanPhone,
        email: formData.email.trim() ? formData.email.trim() : undefined,
        moveInDate: formData.moveInDate,
        emergencyContactName: formData.emergencyContactName.trim() ? formData.emergencyContactName.trim() : undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim() ? formData.emergencyContactPhone.trim() : undefined,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
        setFormData({
          flatId: flats[0]?.id ? String(flats[0].id) : "",
          residentType: "OWNER",
          name: "",
          phone: "",
          email: "",
          moveInDate: new Date().toISOString().split("T")[0],
          emergencyContactName: "",
          emergencyContactPhone: "",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register resident");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Resident / Onboarding" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Flat / Unit *
            </label>
            <select
              required
              value={formData.flatId}
              onChange={(e) => setFormData({ ...formData, flatId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {flats.map((f) => (
                <option key={f.id} value={f.id}>
                  Flat {f.flatNumber} ({f.blockName || "Tower A"} - Floor {f.floorNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resident Type *
            </label>
            <select
              value={formData.residentType}
              onChange={(e) => setFormData({ ...formData, residentType: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
            >
              <option value="OWNER">Owner</option>
              <option value="TENANT">Tenant</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="resident@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Move-in Date *
            </label>
            <input
              type="date"
              required
              value={formData.moveInDate}
              onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Contact Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sunita Kumar"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register Resident"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
