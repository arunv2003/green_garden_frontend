"use client";

import React, { useState } from "react";
import { StatCard } from "../ui/StatCard";
import {
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Receipt,
  FileSpreadsheet,
  PlusCircle,
  ArrowUpRight,
  Printer,
  DollarSign,
  Wallet,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import api from "@/lib/api";

interface AccountantDashboardProps {
  stats: any;
  onOpenRecordPayment: () => void;
  onOpenGenerateBills?: () => void;
  onViewReceipt: (paymentId: number) => void;
  onReload: () => void;
}

export const AccountantDashboard: React.FC<AccountantDashboardProps> = ({
  stats,
  onOpenRecordPayment,
  onOpenGenerateBills,
  onViewReceipt,
  onReload,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
              Finance & Accounts Desk
            </span>
            <span className="text-xs text-slate-400">• Green Garden Society</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Society Financial Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintenance collections, operational expenses, net society balance, and bank receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/expenses"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </Link>
          {onOpenGenerateBills && (
            <button
              onClick={onOpenGenerateBills}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Monthly Bills</span>
            </button>
          )}
          <button
            onClick={onOpenRecordPayment}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Maintenance Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Society Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">
              Net Society Balance
            </span>
            <div className="p-2 bg-slate-700/50 rounded-xl text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono tracking-tight text-white">
              {formatCurrency(stats?.netBalance || 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Income ({formatCurrency(stats?.totalCollection || 0)}) – Expenses ({formatCurrency(stats?.totalExpenses || 0)})
            </p>
          </div>
        </div>

        {/* Maintenance Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              Total Maintenance Collected
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono text-emerald-700">
              {formatCurrency(stats?.totalCollection || 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Current Month: {formatCurrency(stats?.currentMonthCollection || 0)}
            </p>
          </div>
        </div>

        {/* Total Pending Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              Outstanding Dues
            </span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono text-rose-700">
              {formatCurrency(stats?.totalPending || 0)}
            </p>
            <p className="text-[11px] text-rose-500 font-semibold mt-1">
              {stats?.overdueCount || 0} bills past due date
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              Operational Expenses
            </span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black font-mono text-slate-900">
              {formatCurrency(stats?.totalExpenses || 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Security, AMC, Housekeeping
            </p>
          </div>
        </div>
      </div>

      {/* Recent Payments & Ledger Links */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Recent Payment Receipts</h3>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ledger"
              className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Monthly Ledger</span>
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/payments"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>All Payments</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Flat No</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Print Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!stats?.recentPayments || stats.recentPayments.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payments recorded yet.
                  </td>
                </tr>
              ) : (
                stats.recentPayments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Flat {p.flatNumber || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      {p.residentName || "Resident"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/payments/${p.id}/receipt`}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
