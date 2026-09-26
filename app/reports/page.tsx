"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building2,
  Users,
  CreditCard,
  FileSpreadsheet,
  Wallet,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"monthly" | "flats" | "residents">("monthly");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const fetchReport = async () => {
    try {
      setLoading(true);
      let endpoint = "/reports/monthly";
      if (activeTab === "flats") endpoint = "/reports/room-revenue";
      if (activeTab === "residents") endpoint = "/reports/guest-ledger";

      const res = await api.get(endpoint, {
        params: { year: selectedYear },
      });

      const responseData = res.data.data;

      if (activeTab === "monthly") {
        if (responseData?.monthlyBreakdown) {
          setData(responseData.monthlyBreakdown);
          setSummary(responseData.summary || null);
        } else if (Array.isArray(responseData)) {
          setData(responseData);
        } else {
          setData([]);
        }
      } else {
        if (Array.isArray(responseData)) {
          setData(responseData);
        } else if (responseData?.items && Array.isArray(responseData.items)) {
          setData(responseData.items);
        } else {
          setData([]);
        }
      }
    } catch (err) {
      console.error("Failed to load report", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, selectedYear]);

  const handleExportCsv = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL||"https://green-garden-backend.vercel.app" || "http://localhost:5007/api";
    window.open(
      `${backendUrl}/reports/export-csv?type=${activeTab}&year=${selectedYear}`,
      "_blank"
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Society Financial & Audit Reports
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Monthly cash flow, maintenance collections, operational spend, and flat-wise balances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Financial Summary Cards for Monthly View */}
        {activeTab === "monthly" && summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Net Balance</span>
                <Wallet className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black font-mono mt-1 text-white">{formatCurrency(summary.netBalance || 0)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Total Income – Total Expenses</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Collected</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-black font-mono text-emerald-700 mt-1">{formatCurrency(summary.totalCollection || 0)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Maintenance Receipts ({selectedYear})</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Operational Expenses</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xl font-black font-mono text-slate-900 mt-1">{formatCurrency(summary.totalExpenses || 0)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Security, AMC, Housekeeping</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Dues</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-xl font-black font-mono text-rose-700 mt-1">{formatCurrency(summary.pendingMaintenance || 0)}</p>
              <p className="text-[10px] text-rose-500 font-semibold mt-0.5">{summary.overdueCount || 0} overdue invoices</p>
            </div>
          </div>
        )}

        {/* Tab Navigation & Year Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("monthly")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === "monthly"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly Statement</span>
            </button>

            <button
              onClick={() => setActiveTab("flats")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === "flats"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Flat-wise Revenue</span>
            </button>

            <button
              onClick={() => setActiveTab("residents")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === "residents"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Resident Balances</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pr-2">
            <label className="text-xs text-slate-500 font-semibold">Financial Year:</label>
            <select
              className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            >
              <option value="2027">2027</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* Report Content Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === "monthly" && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Billing Month</th>
                    <th className="py-3.5 px-4 text-right">Maintenance Invoiced</th>
                    <th className="py-3.5 px-4 text-right">Collections</th>
                    <th className="py-3.5 px-4 text-right">Pending Dues</th>
                    <th className="py-3.5 px-4 text-right">Expenses</th>
                    <th className="py-3.5 px-4 text-right">Net Cashflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Generating collection statement...
                      </td>
                    </tr>
                  ) : !Array.isArray(data) || data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No financial records found for year {selectedYear}.
                      </td>
                    </tr>
                  ) : (
                    data.map((row) => (
                      <tr key={row.month || row.monthNumber || row.monthName} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {row.monthName} {selectedYear}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                          {formatCurrency(row.maintenanceBilled ?? row.totalBilled ?? 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(row.maintenanceCollected ?? row.totalPaid ?? 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                          {formatCurrency(row.maintenancePending ?? row.totalPending ?? 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                          {formatCurrency(row.expenses ?? 0)}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-mono font-black ${
                          (row.netCashflow ?? 0) >= 0 ? "text-emerald-700" : "text-rose-600"
                        }`}>
                          {formatCurrency(row.netCashflow ?? ((row.maintenanceCollected ?? 0) - (row.expenses ?? 0)))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {(activeTab === "flats" || activeTab === "residents") && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Flat No</th>
                    <th className="py-3.5 px-4">Tower & Type</th>
                    <th className="py-3.5 px-4">Resident</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Total Invoiced</th>
                    <th className="py-3.5 px-4 text-right">Total Collected</th>
                    <th className="py-3.5 px-4 text-right">Pending Dues</th>
                    <th className="py-3.5 px-4 text-right">Recovery Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Loading breakdown...
                      </td>
                    </tr>
                  ) : !Array.isArray(data) || data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No flat revenue records found.
                      </td>
                    </tr>
                  ) : (
                    data.map((r) => (
                      <tr key={r.flatId || r.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                          Flat {r.flatNumber || r.roomNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {r.blockName || "Tower A"} • {r.flatType || r.roomType || "2 BHK"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {r.residentName || r.guestName || "Vacant"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.occupancyStatus === "OCCUPIED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                          }`}>
                            {r.occupancyStatus || "VACANT"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                          {formatCurrency(r.totalBilled || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(r.totalCollected || r.totalPaid || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                          {formatCurrency(r.totalPending || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700 font-mono">
                          {r.collectionRate != null ? `${r.collectionRate}%` : "100%"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
