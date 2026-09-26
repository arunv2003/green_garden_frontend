"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import {
  FileSpreadsheet,
  Search,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  DollarSign,
  Printer,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";

export default function LedgerPage() {
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [expandedFlatIds, setExpandedFlatIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const params: any = {
        year: selectedYear,
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/ledger", { params });
      const list = res.data.data || [];
      setLedgers(list);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? list.length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }
      // Auto-expand first 2 flats
      if (list.length > 0 && expandedFlatIds.length === 0) {
        const initialIds = list.slice(0, 2).map((l: any) => l.flat?.id).filter(Boolean);
        setExpandedFlatIds(initialIds);
      }
    } catch (err) {
      console.error("Failed to load ledger", err);
      setLedgers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedYear, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchLedger();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleExpand = (flatId: number) => {
    setExpandedFlatIds((prev) =>
      prev.includes(flatId) ? prev.filter((id) => id !== flatId) : [...prev, flatId]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Society Monthly Maintenance Ledger ({selectedYear})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Flat-wise monthly billing statement, maintenance payments received, and outstanding dues audit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-semibold">Financial Year:</label>
            <select
              className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            >
              <option value="2027">2027</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Flat Number (e.g. A-101) or resident name..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Ledgers Accordion Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 animate-pulse">
              Computing monthly society ledgers...
            </div>
          ) : ledgers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              No ledger records found for {selectedYear}.
            </div>
          ) : (
            ledgers.map((l) => {
              const flatId = l.flat?.id;
              if (!flatId) return null;

              const isExpanded = expandedFlatIds.includes(flatId);
              const activeMonths = l.months ? l.months.filter((m: any) => m.status !== "N/A") : [];

              return (
                <div
                  key={flatId}
                  className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden transition"
                >
                  {/* Accordion Bar */}
                  <div
                    onClick={() => toggleExpand(flatId)}
                    className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-mono font-black text-sm">
                        {l.flat.flatNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/flats/${flatId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-slate-900 hover:text-emerald-700 transition text-sm inline-flex items-center gap-1"
                          >
                            <span>Flat {l.flat.flatNumber}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {l.flat.blockName || "Tower A"} • {l.flat.flatType}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {l.resident ? (
                            <span>
                              <strong>Resident:</strong> {l.resident.fullName || l.resident.name} ({l.resident.residentType || "Resident"})
                              {l.resident.mobile && ` • ${l.resident.mobile}`}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Vacant Unit</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Quick Financial Totals Strip */}
                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Total Invoiced
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          {formatCurrency(l.summary?.totalBilled || 0)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Total Collected
                        </span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {formatCurrency(l.summary?.totalPaid || 0)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Outstanding Dues
                        </span>
                        <span
                          className={`font-bold font-mono ${
                            (l.summary?.totalPending || 0) > 0 ? "text-rose-600 font-black" : "text-emerald-700"
                          }`}
                        >
                          {formatCurrency(l.summary?.totalPending || 0)}
                        </span>
                      </div>

                      <div className="text-slate-400 p-1 rounded-lg hover:bg-slate-100 transition">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Monthly Statement Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-2.5 px-4">Billing Month</th>
                              <th className="py-2.5 px-4 text-right">Maintenance Charge</th>
                              <th className="py-2.5 px-4 text-right">Paid Amount</th>
                              <th className="py-2.5 px-4 text-right">Pending Dues</th>
                              <th className="py-2.5 px-4 text-right">Bill Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {activeMonths.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-slate-400">
                                  No maintenance invoices generated for Flat {l.flat.flatNumber} in {l.year}.
                                </td>
                              </tr>
                            ) : (
                              activeMonths.map((m: any) => (
                                <tr key={m.month} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-4 font-bold text-slate-800">
                                    {m.monthName} {l.year}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800">
                                    {formatCurrency(m.billAmount)}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-emerald-700">
                                    {formatCurrency(m.paidAmount)}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono font-bold">
                                    <span
                                      className={
                                        m.pendingAmount > 0 ? "text-rose-600" : "text-emerald-700"
                                      }
                                    >
                                      {formatCurrency(m.pendingAmount)}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-right">
                                    <Badge status={m.status} />
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                          {/* Grand Totals Footer */}
                          <tfoot className="bg-slate-50/90 border-t border-slate-200 font-bold text-xs">
                            <tr>
                              <td className="py-2.5 px-4 text-slate-900">Total for Year {l.year}</td>
                              <td className="py-2.5 px-4 text-right font-mono text-slate-900">
                                {formatCurrency(l.summary?.totalBilled || 0)}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono text-emerald-700">
                                {formatCurrency(l.summary?.totalPaid || 0)}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono text-rose-600">
                                {formatCurrency(l.summary?.totalPending || 0)}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <span className="text-[11px] text-slate-400">Statement Audited</span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="rounded-2xl border border-slate-200/80 shadow-xs"
        />
      </div>
    </AppLayout>
  );
}
