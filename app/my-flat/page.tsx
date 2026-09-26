"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Building2,
  Users,
  Car,
  Receipt,
  CreditCard,
  ShieldCheck,
  LifeBuoy,
  Phone,
  Mail,
  Calendar,
  Plus,
  ArrowUpRight,
  AlertCircle,
  Home,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import api from "@/lib/api";

export default function MyFlatPage() {
  const [loading, setLoading] = useState(true);
  const [flatData, setFlatData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals for adding family member and vehicle
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  const [familyForm, setFamilyForm] = useState({
    name: "",
    relationship: "Spouse",
    age: "",
    phone: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: "",
    vehicleType: "CAR" as "CAR" | "BIKE" | "SCOOTER" | "OTHER",
    vehicleModel: "",
    parkingSlot: "",
  });

  const fetchMyFlat = async () => {
    try {
      setLoading(true);
      setError(null);
      // First get resident profile for current user
      const resRes = await api.get("/residents", { params: { limit: 1 } });
      const residents = resRes.data?.data || [];
      if (residents.length === 0) {
        setError("No resident profile mapped to your account. Please contact Society Secretary.");
        return;
      }
      const myFlatId = residents[0].flatId;
      const flatRes = await api.get(`/flats/${myFlatId}`);
      setFlatData(flatRes.data.data);
    } catch (err: any) {
      console.error("Failed to load my flat", err);
      setError("Unable to load flat details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFlat();
  }, []);

  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatData?.currentResident?.id) return;
    try {
      await api.post(`/residents/${flatData.currentResident.id}/family`, {
        name: familyForm.name.trim(),
        relationship: familyForm.relationship,
        age: familyForm.age ? Number(familyForm.age) : undefined,
        phone: familyForm.phone.trim() ? familyForm.phone.trim() : undefined,
      });
      setIsAddFamilyOpen(false);
      setFamilyForm({ name: "", relationship: "Spouse", age: "", phone: "" });
      fetchMyFlat();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add family member");
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatData?.currentResident?.id) return;
    try {
      await api.post(`/residents/${flatData.currentResident.id}/vehicles`, {
        vehicleNumber: vehicleForm.vehicleNumber.trim(),
        vehicleType: vehicleForm.vehicleType,
        vehicleModel: vehicleForm.vehicleModel.trim() ? vehicleForm.vehicleModel.trim() : undefined,
        parkingSlot: vehicleForm.parkingSlot.trim() ? vehicleForm.parkingSlot.trim() : undefined,
      });
      setIsAddVehicleOpen(false);
      setVehicleForm({ vehicleNumber: "", vehicleType: "CAR", vehicleModel: "", parkingSlot: "" });
      fetchMyFlat();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add vehicle");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
            <div className="h-64 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !flatData) {
    return (
      <AppLayout>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto mt-12">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Resident Profile Not Found</h2>
          <p className="text-xs text-slate-500">{error || "Your user is not currently linked to an active flat."}</p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { flat, currentResident, familyMembers = [], vehicles = [], maintenanceBills = [] } = flatData;
  const totalPending = maintenanceBills.reduce((sum: number, b: any) => sum + Number(b.pendingAmount || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Flat Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 font-mono font-black text-xl">
                {flat.flatNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    Flat {flat.flatNumber}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    currentResident?.residentType === "OWNER" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {currentResident?.residentType || "Resident"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>{flat.blockName || "Tower A"}</span>
                  <span>• Floor {flat.floorNumber}</span>
                  <span>• {flat.flatType}</span>
                  <span>• {flat.areaSqFt} Sq.Ft</span>
                  {flat.intercomNumber && <span>• Intercom #{flat.intercomNumber}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`border rounded-xl px-5 py-2.5 text-right ${
                totalPending > 0 ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                <span className="text-[10px] uppercase font-bold block">Current Maintenance Dues</span>
                <span className="text-xl font-extrabold font-mono">
                  {formatCurrency(totalPending)}
                </span>
              </div>

              <Link
                href="/maintenance"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Maintenance</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column: Family Members & Vehicles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Family Members */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Family Members ({familyMembers.length})</h3>
              </div>
              <button
                onClick={() => setIsAddFamilyOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            {familyMembers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No other family members registered.</p>
            ) : (
              <div className="space-y-2">
                {familyMembers.map((m: any) => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {m.relationship} {m.age ? `• ${m.age} yrs` : ""}
                      </p>
                    </div>
                    {m.phone && (
                      <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                        {m.phone}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicles */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <Car className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Registered Vehicles ({vehicles.length})</h3>
              </div>
              <button
                onClick={() => setIsAddVehicleOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle</span>
              </button>
            </div>

            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No vehicles registered yet.</p>
            ) : (
              <div className="space-y-2">
                {vehicles.map((v: any) => (
                  <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-900">{v.vehicleNumber}</p>
                      <p className="text-[11px] text-slate-500">
                        {v.vehicleType} {v.vehicleModel ? `• ${v.vehicleModel}` : ""}
                      </p>
                    </div>
                    {v.parkingSlot && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                        Parking: {v.parkingSlot}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Family Modal */}
        {isAddFamilyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-slate-900">Add Family Member</h3>
              <form onSubmit={handleAddFamily} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={familyForm.name}
                    onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship *</label>
                    <select
                      value={familyForm.relationship}
                      onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      value={familyForm.age}
                      onChange={(e) => setFamilyForm({ ...familyForm, age: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={familyForm.phone}
                    onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFamilyOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {isAddVehicleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-slate-900">Register Vehicle</h3>
              <form onSubmit={handleAddVehicle} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Plate Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UP 32 AB 1234"
                    value={vehicleForm.vehicleNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg uppercase font-mono outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                    <select
                      value={vehicleForm.vehicleType}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                    >
                      <option value="CAR">Car / 4-Wheeler</option>
                      <option value="BIKE">Motorcycle / Bike</option>
                      <option value="SCOOTER">Scooter / 2-Wheeler</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Model / Make</label>
                    <input
                      type="text"
                      placeholder="e.g. Honda City"
                      value={vehicleForm.vehicleModel}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleModel: e.target.value })}
                      className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parking Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. P-12"
                    value={vehicleForm.parkingSlot}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, parkingSlot: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddVehicleOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                  >
                    Register Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
