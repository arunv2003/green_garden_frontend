"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";

interface EditFlatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  flat: any | null;
}

export const EditFlatModal: React.FC<EditFlatModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  flat,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    blockId: "",
    flatNumber: "",
    floorNumber: 1,
    flatType: "2 BHK",
    areaSqFt: 1250,
    monthlyMaintenance: 2500,
    intercomNumber: "",
    occupancyStatus: "VACANT",
  });

  useEffect(() => {
    if (isOpen && flat) {
      setFormData({
        blockId: flat.blockId ? String(flat.blockId) : "",
        flatNumber: flat.flatNumber || "",
        floorNumber: flat.floorNumber || 1,
        flatType: flat.flatType || "2 BHK",
        areaSqFt: flat.areaSqFt || flat.areaSqft || 1200,
        monthlyMaintenance: flat.monthlyMaintenance || 2500,
        intercomNumber: flat.intercomNumber || "",
        occupancyStatus: flat.occupancyStatus || "VACANT",
      });

      api
        .get("/society")
        .then((res) => {
          if (res.data?.data?.blocks) {
            setBlocks(res.data.data.blocks);
          }
        })
        .catch((err) => console.error("Error fetching blocks", err));
    }
  }, [isOpen, flat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flat) return;
    setError(null);
    setLoading(true);

    try {
      const res = await api.put(`/flats/${flat.id}`, {
        blockId: formData.blockId ? Number(formData.blockId) : undefined,
        flatNumber: formData.flatNumber.trim(),
        floorNumber: Number(formData.floorNumber),
        flatType: formData.flatType,
        areaSqFt: Number(formData.areaSqFt) || 0,
        monthlyMaintenance: Number(formData.monthlyMaintenance) || 0,
        intercomNumber: formData.intercomNumber ? formData.intercomNumber.trim() : undefined,
        occupancyStatus: formData.occupancyStatus,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update flat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Flat ${flat?.flatNumber || ""}`} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Flat / Unit Number *
            </label>
            <input
              type="text"
              required
              value={formData.flatNumber}
              onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              placeholder="e.g. A-402, 101"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tower / Block
            </label>
            <select
              value={formData.blockId}
              onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="">Select Block</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code || b.blockCode || "Block"})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Floor No.</label>
            <input
              type="number"
              min="0"
              value={formData.floorNumber}
              onChange={(e) => setFormData({ ...formData, floorNumber: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Configuration</label>
            <select
              value={formData.flatType}
              onChange={(e) => setFormData({ ...formData, flatType: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="1 RK">1 RK</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Duplex">Duplex</option>
              <option value="Studio">Studio</option>
              <option value="Shop / Commercial">Shop / Commercial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Super Area (Sq.Ft)</label>
            <input
              type="number"
              value={formData.areaSqFt}
              onChange={(e) => setFormData({ ...formData, areaSqFt: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Maintenance Charge (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.monthlyMaintenance}
              onChange={(e) =>
                setFormData({ ...formData, monthlyMaintenance: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Occupancy Status
            </label>
            <select
              value={formData.occupancyStatus}
              onChange={(e) => setFormData({ ...formData, occupancyStatus: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            >
              <option value="VACANT">Vacant</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Intercom Number (Optional)
          </label>
          <input
            type="text"
            value={formData.intercomNumber}
            onChange={(e) => setFormData({ ...formData, intercomNumber: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. 104"
          />
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
            {loading ? "Saving Changes..." : "Save Flat Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
