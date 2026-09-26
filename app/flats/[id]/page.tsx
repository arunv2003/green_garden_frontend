"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import {
  Building2,
  ArrowLeft,
  Users,
  Car,
  Receipt,
  CreditCard,
  ShieldCheck,
  LifeBuoy,
  Phone,
  Mail,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import api from "@/lib/api";

export default function FlatDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "maintenance" | "payments" | "visitors" | "complaints">("overview");

  const fetchFlatDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/flats/${id}`);
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to load flat 360 profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFlatDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </AppLayout>
    );
  }

  if (!data?.flat) {
    return (
      <AppLayout>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-slate-600">Flat not found or has been removed.</p>
          <Link
            href="/flats"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Flats Directory
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { flat, familyMembers = [], vehicles = [], maintenanceBills = [], payments = [], visitors = [], complaints = [] } = data;
  const currentResident = data.currentResident || data.currentTenant || data.currentOwner;
  const residentName = currentResident?.fullName || currentResident?.name;
  const residentPhone = currentResident?.mobile || currentResident?.phone;

  const totalPendingMaintenance = maintenanceBills.reduce((sum: number, b: any) => sum + Number(b.pendingAmount || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/flats"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Flats Directory</span>
          </Link>
        </div>

        {/* Flat Hero Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 font-mono font-black text-xl">
                {flat.flatNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                    Flat {flat.flatNumber}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      flat.occupancyStatus === "OCCUPIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : flat.occupancyStatus === "VACANT"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {flat.occupancyStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>{flat.blockName || "Tower A"}</span>
                  <span>• Floor {flat.floorNumber}</span>
                  <span>• {flat.flatType}</span>
                  <span>• {flat.areaSqFt ? `${flat.areaSqFt} Sq.Ft` : "Standard"}</span>
                  {flat.intercomNumber && <span>• Intercom #{flat.intercomNumber}</span>}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Maintenance</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatCurrency(flat.monthlyMaintenance || 0)}
                </span>
              </div>
              <div className={`border rounded-xl px-4 py-2 text-right ${
                totalPendingMaintenance > 0 ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                <span className="text-[10px] uppercase font-bold block">Outstanding Dues</span>
                <span className="text-base font-extrabold font-mono">
                  {formatCurrency(totalPendingMaintenance)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 mt-6 -mb-6 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === "overview"
                  ? "bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Resident, Family & Vehicles</span>
            </button>

            <button
              onClick={() => setActiveTab("maintenance")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === "maintenance"
                  ? "bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Maintenance Bills ({maintenanceBills.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === "payments"
                  ? "bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Receipts ({payments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("visitors")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === "visitors"
                  ? "bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Visitors Log ({visitors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("complaints")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === "complaints"
                  ? "bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Complaints ({complaints.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Resident, Family & Vehicles */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Resident Profile */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Current Resident</span>
                </h3>
                {currentResident && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    currentResident.residentType === "OWNER" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {currentResident.residentType}
                  </span>
                )}
              </div>

              {currentResident && residentName ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-black text-slate-900">{residentName}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {residentPhone || "No phone"}
                    </p>
                    {currentResident.email && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentResident.email}
                      </p>
                    )}
                  </div>

                  <div className="text-xs space-y-2 text-slate-600 pt-1">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Move-in Date:</span>
                      <span className="font-semibold text-slate-800">{formatDate(currentResident.moveInDate)}</span>
                    </div>
                    {currentResident.emergencyContactName && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400">Emergency Contact:</span>
                        <span className="font-semibold text-slate-800">
                          {currentResident.emergencyContactName} ({currentResident.emergencyContactPhone || "N/A"})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  This flat is currently vacant. No resident assigned.
                </div>
              )}
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Family Members ({familyMembers.length})</span>
                </h3>
              </div>

              {familyMembers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No family members registered for this flat.
                </div>
              ) : (
                <div className="space-y-2.5">
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
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-600" />
                  <span>Registered Vehicles ({vehicles.length})</span>
                </h3>
              </div>

              {vehicles.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No vehicles registered for this flat.
                </div>
              ) : (
                <div className="space-y-2.5">
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
                          Slot: {v.parkingSlot}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Maintenance Bills */}
        {activeTab === "maintenance" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Maintenance Invoices & Dues</h3>
              <span className="text-xs text-slate-500">All monthly bills generated for this flat</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Billing Period</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Pending</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceBills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No maintenance bills generated yet.
                      </td>
                    </tr>
                  ) : (
                    maintenanceBills.map((b: any) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {new Date(b.billYear, b.billMonth - 1).toLocaleString("en-US", { month: "long" })} {b.billYear}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{formatDate(b.dueDate)}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{formatCurrency(b.totalAmount)}</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-700">{formatCurrency(b.paidAmount || 0)}</td>
                        <td className="py-3.5 px-4 font-mono text-rose-700 font-bold">{formatCurrency(b.pendingAmount || 0)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.status === "PARTIAL"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Payments */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Payment History & Receipts</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No payments recorded for this flat yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{formatDate(p.paymentDate)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            (p.paymentMethod || p.paymentMode) === "UPI"
                              ? "bg-purple-100 text-purple-800"
                              : (p.paymentMethod || p.paymentMode) === "BANK_TRANSFER"
                              ? "bg-blue-100 text-blue-800"
                              : (p.paymentMethod || p.paymentMode) === "CARD"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {p.paymentMethod || p.paymentMode || "CASH"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-mono text-xs font-medium">
                          {p.transactionId || p.transactionRef || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/payments/${p.id}/receipt`}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold"
                          >
                            <span>View Receipt</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Visitors Log */}
        {activeTab === "visitors" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Gate Visitor History for Flat {flat.flatNumber}</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Visitor Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Entry Time</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visitors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No visitors recorded for this flat.
                      </td>
                    </tr>
                  ) : (
                    visitors.map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{v.visitorName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{v.visitorPhone}</td>
                        <td className="py-3.5 px-4 text-slate-700">{v.purpose || "General"}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{v.vehicleNumber || "None"}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(v.entryTime)} {formatTime(v.entryTime)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            v.status === "INSIDE" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Complaints */}
        {activeTab === "complaints" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Complaints & Helpdesk Tickets</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Filed On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No complaints filed for this flat.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{c.complaintNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{c.title}</td>
                        <td className="py-3.5 px-4 text-slate-600">{c.category}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.priority === "URGENT" || c.priority === "HIGH"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            c.status === "RESOLVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{formatDate(c.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
