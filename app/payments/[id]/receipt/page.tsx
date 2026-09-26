"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, CheckCircle2, Building2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import api from "@/lib/api";

export default function StandaloneReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params?.id;

  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      loadReceipt();
    }
  }, [paymentId]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/payments/${paymentId}/receipt`);
      setReceipt(res.data.data);
    } catch (err) {
      console.error("Failed to load receipt", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !receipt) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500 text-sm animate-pulse">
        Generating official receipt document...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center">
      {/* Top action bar (hidden in print) */}
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between no-print">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="receipt-container bg-white w-full max-w-2xl rounded-2xl border border-slate-200 p-8 shadow-xl space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Building2 className="w-7 h-7" />
              <h1 className="text-xl font-black tracking-wider">
                {receipt.societyName || "GREEN GARDEN RESIDENTIAL SOCIETY"}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {receipt.tagline || "Maintenance & Resident Services"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {receipt.address || "Lucknow, Uttar Pradesh"}
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase rounded border border-emerald-200">
              Official Maintenance Receipt
            </span>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
              {receipt.receiptNumber}
            </span>
            <p className="text-xs text-slate-500 mt-2">
              Date: <strong>{formatDate(receipt.paymentDate)}</strong>
            </p>
          </div>
        </div>

        {/* Resident & Flat Info */}
        <div className="grid grid-cols-2 gap-4 py-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="space-y-1">
            <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              Resident Details
            </p>
            <p className="text-sm font-bold text-slate-900">{receipt.residentName || receipt.guestName}</p>
            <p className="text-slate-600">Mobile: {receipt.residentMobile || receipt.guestMobile || "—"}</p>
            {receipt.residentEmail && <p className="text-slate-600">Email: {receipt.residentEmail}</p>}
          </div>

          <div className="space-y-1 text-right">
            <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              Flat & Billing Period
            </p>
            <p className="text-sm font-bold text-emerald-800 font-mono">
              Flat {receipt.flatNumber || receipt.roomNumber} ({receipt.blockName || "Tower A"})
            </p>
            <p className="text-slate-700 font-semibold">Period: {receipt.billingPeriod}</p>
            <p className="text-slate-500 font-mono">
              Mode: <span className="font-semibold text-slate-800">{receipt.paymentMethod}</span>
              {receipt.transactionId && ` (Ref: ${receipt.transactionId})`}
            </p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr>
                <td className="py-2.5 px-4">Previous Pending Dues Brought Forward</td>
                <td className="py-2.5 px-4 text-right font-mono font-semibold">
                  {formatCurrency(receipt.previousPending || 0)}
                </td>
              </tr>
              <tr className="bg-emerald-50/40 text-emerald-950 font-bold">
                <td className="py-3 px-4 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Amount Paid In This Transaction</span>
                </td>
                <td className="py-3 px-4 text-right text-base font-black font-mono text-emerald-700">
                  {formatCurrency(receipt.currentPayment || receipt.amount)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 text-slate-500">Remaining Balance Pending After Payment</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">
                  {formatCurrency(receipt.remainingPending || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer & Signature */}
        <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
          <div>
            <p className="text-slate-400 text-[11px]">Authorized Receiver:</p>
            <p className="font-bold text-slate-800 mt-0.5">{receipt.receivedBy || "Society Accountant"}</p>
            <p className="text-[10px] text-slate-400 italic mt-1">Computer generated receipt. Valid without physical signature.</p>
          </div>

          <div className="text-right">
            <div className="h-10 border-b border-dashed border-slate-400 w-36 mb-1"></div>
            <p className="text-[11px] font-bold text-slate-600">Accounts Department</p>
          </div>
        </div>
      </div>
    </div>
  );
}
