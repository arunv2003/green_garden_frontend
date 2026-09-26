"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";

interface AddFlatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddFlatModal: React.FC<AddFlatModalProps> = ({ isOpen, onClose, onSuccess }) => {
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
    if (isOpen) {
      api.get("/society").then((res) => {
        if (res.data?.data?.blocks) {
          setBlocks(res.data.data.blocks);
          if (res.data.data.blocks.length > 0) {
            setFormData((prev) => ({ ...prev, blockId: String(res.data.data.blocks[0].id) }));
          }
        }
      }).catch((err) => console.error("Error fetching blocks", err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/flats", {
        blockId: Number(formData.blockId),
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
        setFormData({
          blockId: blocks[0]?.id ? String(blocks[0].id) : "",
          flatNumber: "",
          floorNumber: 1,
          flatType: "2 BHK",
          areaSqFt: 1250,
          monthlyMaintenance: 2500,
          intercomNumber: "",
          occupancyStatus: "VACANT",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create flat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Flat / Unit" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tower / Block *
            </label>
            <select
              required
              value={formData.blockId}
              onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code || b.blockCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Flat / Unit Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. A-101, B-402"
              value={formData.flatNumber}
              onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Floor Number *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={formData.floorNumber}
              onChange={(e) => setFormData({ ...formData, floorNumber: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Flat Type *
            </label>
            <select
              value={formData.flatType}
              onChange={(e) => setFormData({ ...formData, flatType: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Studio">Studio</option>
              <option value="Shop / Commercial">Shop / Commercial</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Super Built-up Area (Sq. Ft.)
            </label>
            <input
              type="number"
              min="100"
              value={formData.areaSqFt}
              onChange={(e) => setFormData({ ...formData, areaSqFt: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Maintenance Charge (₹) *
            </label>
            <input
              type="number"
              min="0"
              required
              placeholder="e.g. 2500"
              value={formData.monthlyMaintenance}
              onChange={(e) => setFormData({ ...formData, monthlyMaintenance: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Intercom Extension Number
            </label>
            <input
              type="text"
              placeholder="e.g. 101"
              value={formData.intercomNumber}
              onChange={(e) => setFormData({ ...formData, intercomNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Status
            </label>
            <select
              value={formData.occupancyStatus}
              onChange={(e) => setFormData({ ...formData, occupancyStatus: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="VACANT">Vacant</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            </select>
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
            {loading ? "Creating Flat..." : "Create Flat"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
