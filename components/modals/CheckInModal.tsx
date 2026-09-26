"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "@/lib/api";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedUserId?: number;
  preselectedRoomId?: number;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedUserId,
  preselectedRoomId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [guests, setGuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 8);

  const [formData, setFormData] = useState({
    userId: preselectedUserId || "",
    roomId: preselectedRoomId || "",
    checkInDate: todayStr,
    checkInTime: nowTime,
    monthlyRent: "",
    securityDeposit: "",
    startingMeter: "",
    remarks: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [guestsRes, roomsRes] = await Promise.all([
        api.get("/guests"),
        api.get("/rooms"),
      ]);

      // Filter guests that don't have an active stay
      const unassignedGuests = guestsRes.data.data.filter((g: any) => !g.activeStay);
      setGuests(unassignedGuests);

      // Filter available rooms
      const availableRooms = roomsRes.data.data.filter(
        (r: any) => r.availableSlots > 0 && r.status !== "MAINTENANCE" && r.status !== "INACTIVE"
      );
      setRooms(availableRooms);

      if (preselectedUserId) setFormData((prev) => ({ ...prev, userId: preselectedUserId }));
      if (preselectedRoomId) {
        const foundRoom = roomsRes.data.data.find((r: any) => r.id === preselectedRoomId);
        if (foundRoom) {
          setFormData((prev) => ({
            ...prev,
            roomId: preselectedRoomId,
            monthlyRent: foundRoom.monthlyRent,
            securityDeposit: foundRoom.securityDeposit,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load options", err);
    }
  };

  const handleRoomChange = (roomIdStr: string) => {
    const selectedRoomId = parseInt(roomIdStr, 10);
    const room = rooms.find((r) => r.id === selectedRoomId);
    setFormData((prev) => ({
      ...prev,
      roomId: selectedRoomId || "",
      monthlyRent: room ? room.monthlyRent : prev.monthlyRent,
      securityDeposit: room ? room.securityDeposit : prev.securityDeposit,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/stays/check-in", {
        userId: Number(formData.userId),
        roomId: Number(formData.roomId),
        checkInDate: formData.checkInDate,
        checkInTime: formData.checkInTime,
        monthlyRent: Number(formData.monthlyRent),
        securityDeposit: formData.securityDeposit ? Number(formData.securityDeposit) : 0,
        startingMeter: formData.startingMeter || undefined,
        remarks: formData.remarks || undefined,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Room Check-In" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Guest *</label>
            <select
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            >
              <option value="">-- Choose Unassigned Guest --</option>
              {guests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.mobile})
                </option>
              ))}
            </select>
            {guests.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                No unassigned guests found. Register a new guest first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Room *</label>
            <select
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              value={formData.roomId}
              onChange={(e) => handleRoomChange(e.target.value)}
            >
              <option value="">-- Choose Available Room --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber} ({r.roomType}, Floor {r.floor}) — {r.availableSlots} bed(s) available
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in Date *</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.checkInDate}
              onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in Time *</label>
            <input
              type="time"
              required
              step="1"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.checkInTime}
              onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Agreed Monthly Rent (₹) *</label>
            <input
              type="number"
              required
              min="1"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Security Deposit (₹)</label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.securityDeposit}
              onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Starting Meter Reading</label>
            <input
              type="text"
              placeholder="e.g. MTR-101-5020"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.startingMeter}
              onChange={(e) => setFormData({ ...formData, startingMeter: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Note</label>
            <input
              type="text"
              placeholder="Advance payment agreement, key handed over..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
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
            disabled={loading || !formData.userId || !formData.roomId}
            className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs disabled:opacity-50"
          >
            {loading ? "Recording Check-in..." : "Confirm Check-In"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
