"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { CheckOutModal } from "@/components/modals/CheckOutModal";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import { PaymentReceiptModal } from "@/components/modals/PaymentReceiptModal";
import {
  Users,
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  History,
  Phone,
  Mail,
  MapPin,
  FileText,
  LogOut,
  Printer,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";

export default function GuestProfilePage() {
  const params = useParams();
  const router = useRouter();
  const guestId = params?.id;

  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [receiptId, setReceiptId] = useState<number | null>(null);

  const currentUser = getStoredUser();
  const isSecretary = currentUser?.role === "SECRETARY";
  const isAccountant = currentUser?.role === "ACCOUNTANT";

  const fetchGuest = async () => {
    if (!guestId) return;
    try {
      setLoading(true);
      const res = await api.get(`/guests/${guestId}`);
      setGuest(res.data.data);
    } catch (err) {
      console.error("Failed to load guest profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuest();
  }, [guestId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-12 text-center text-slate-400 animate-pulse">
          Loading guest record & stay dossier...
        </div>
      </AppLayout>
    );
  }

  if (!guest) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-slate-500">Guest not found.</p>
          <button
            onClick={() => router.push("/guests")}
            className="mt-3 px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
          >
            Back to Guests
          </button>
        </div>
      </AppLayout>
    );
  }

  const currentStay = guest.currentStay;
  const summary = guest.financialSummary;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/guests")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Guest Directory</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStay && isAccountant && (
              <button
                onClick={() => setIsRecordPaymentOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            {currentStay && isSecretary && (
              <button
                onClick={() => setIsCheckOutOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Check Out Guest</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Card & Active Stay Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{guest.name}</h1>
                <p className="text-xs text-slate-500">
                  {guest.fatherHusbandName ? `Relation: ${guest.fatherHusbandName}` : "Resident Guest"}
                </p>
              </div>
              <Badge status={guest.status} />
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <p className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{guest.mobile}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{guest.email}</span>
              </p>
              <p className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{guest.address || "Address not specified"}</span>
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <p>
                  <strong>ID Proof:</strong> {guest.idProofType} ({guest.idProofNumber || "N/A"})
                </p>
                <p>
                  <strong>Emergency Contact:</strong> {guest.emergencyContact || "N/A"}
                </p>
                <p>
                  <strong>Joined:</strong> {formatDate(guest.joiningDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Current Stay Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Room Stay
                </span>
                {currentStay && <Badge status="ACTIVE" />}
              </div>

              {currentStay ? (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Room Number</span>
                    <Link
                      href={`/rooms/${currentStay.roomId}`}
                      className="text-lg font-black text-emerald-800 font-mono hover:underline"
                    >
                      Room #{currentStay.roomNumber}
                    </Link>
                    <span className="text-[10px] text-slate-500 block">
                      Floor {currentStay.floor} • {currentStay.roomType}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Check-In Date</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {formatDate(currentStay.checkInDate)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {formatTime(currentStay.checkInTime)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Agreed Monthly Rent</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {formatCurrency(currentStay.monthlyRent)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Deposit: {formatCurrency(currentStay.securityDeposit)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Starting Meter</span>
                    <span className="font-mono text-slate-700">
                      {currentStay.startingMeter || "N/A"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Guest is currently not assigned to any room.
                </div>
              )}
            </div>

            {/* Financial Summary Strip */}
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[11px] text-slate-500 font-semibold uppercase block">Total Billed</span>
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(summary?.totalBilled || 0)}
                </span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-semibold uppercase block">Total Paid</span>
                <span className="text-base font-bold text-emerald-800">
                  {formatCurrency(summary?.totalPaid || 0)}
                </span>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <span className="text-[11px] text-rose-700 font-semibold uppercase block">Total Pending</span>
                <span className="text-base font-bold text-rose-800">
                  {formatCurrency(summary?.totalPending || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Bills Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Monthly Rent Invoices</h2>
            <span className="text-xs text-slate-500">
              {guest.bills?.length || 0} billing records
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase text-[11px]">
                  <th className="pb-2">Month / Year</th>
                  <th className="pb-2">Bill Amount</th>
                  <th className="pb-2">Paid</th>
                  <th className="pb-2">Pending Due</th>
                  <th className="pb-2">Due Date</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guest.bills && guest.bills.length > 0 ? (
                  guest.bills.map((b: any) => {
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-800">
                          {monthNames[b.billingMonth - 1]} {b.billingYear}
                          {b.isProrated && (
                            <span className="ml-2 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-normal">
                              Prorated
                            </span>
                          )}
                        </td>
                        <td className="py-3 font-semibold text-slate-800">{formatCurrency(b.billAmount)}</td>
                        <td className="py-3 font-semibold text-emerald-700">{formatCurrency(b.paidAmount)}</td>
                        <td className="py-3 font-bold text-rose-600">{formatCurrency(b.pendingAmount)}</td>
                        <td className="py-3 text-slate-600">{formatDate(b.dueDate)}</td>
                        <td className="py-3 text-right">
                          <Badge status={b.status} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No monthly billing records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Payment Transactions</h2>
            <span className="text-xs text-slate-500">{guest.payments?.length || 0} payments recorded</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase text-[11px]">
                  <th className="pb-2">Receipt #</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Ref/Txn</th>
                  <th className="pb-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guest.payments && guest.payments.length > 0 ? (
                  guest.payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-800">{p.receiptNumber}</td>
                      <td className="py-3 text-slate-600">{formatDate(p.paymentDate)}</td>
                      <td className="py-3 font-bold text-emerald-700 text-sm">{formatCurrency(p.amount)}</td>
                      <td className="py-3 text-slate-700 font-medium">{p.paymentMethod}</td>
                      <td className="py-3 font-mono text-[11px] text-slate-500">
                        {p.transactionId || "—"}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setReceiptId(p.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Check Out Modal */}
      {currentStay && (
        <CheckOutModal
          isOpen={isCheckOutOpen}
          onClose={() => setIsCheckOutOpen(false)}
          onSuccess={() => {
            fetchGuest();
            setIsCheckOutOpen(false);
          }}
          stayId={currentStay.id}
          guestName={guest.name}
          roomNumber={currentStay.roomNumber}
          pendingAmount={summary?.totalPending || 0}
        />
      )}

      {/* Record Payment Modal */}
      {currentStay && (
        <RecordPaymentModal
          isOpen={isRecordPaymentOpen}
          onClose={() => setIsRecordPaymentOpen(false)}
          onSuccess={(newId) => {
            fetchGuest();
            setIsRecordPaymentOpen(false);
            if (newId) setReceiptId(newId);
          }}
          preselectedUserId={guest.id}
          preselectedRoomId={currentStay.roomId}
          preselectedStayId={currentStay.id}
        />
      )}

      <PaymentReceiptModal
        isOpen={!!receiptId}
        onClose={() => setReceiptId(null)}
        paymentId={receiptId}
      />
    </AppLayout>
  );
}
