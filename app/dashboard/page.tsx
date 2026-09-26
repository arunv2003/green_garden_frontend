"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SecretaryDashboard } from "@/components/dashboard/SecretaryDashboard";
import { AccountantDashboard } from "@/components/dashboard/AccountantDashboard";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AddFlatModal } from "@/components/modals/AddFlatModal";
import { AddResidentModal } from "@/components/modals/AddResidentModal";
import { GenerateMaintenanceBillsModal } from "@/components/modals/GenerateMaintenanceBillsModal";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import { PaymentReceiptModal } from "@/components/modals/PaymentReceiptModal";
import api from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddFlatOpen, setIsAddFlatOpen] = useState(false);
  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
  const [isGenerateBillsOpen, setIsGenerateBillsOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [receiptPaymentId, setReceiptPaymentId] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const role = stats?.role || "SECRETARY";

  return (
    <AppLayout>
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-24 bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      ) : (
        <>
          {role === "SECRETARY" && (
            <SecretaryDashboard
              stats={stats}
              onOpenAddFlat={() => setIsAddFlatOpen(true)}
              onOpenAddResident={() => setIsAddResidentOpen(true)}
            />
          )}

          {role === "ACCOUNTANT" && (
            <AccountantDashboard
              stats={stats}
              onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
              onOpenGenerateBills={() => setIsGenerateBillsOpen(true)}
              onViewReceipt={(id) => setReceiptPaymentId(id)}
              onReload={fetchStats}
            />
          )}

          {role === "USER" && <UserDashboard stats={stats} />}
        </>
      )}

      {/* Society Modals */}
      <AddFlatModal
        isOpen={isAddFlatOpen}
        onClose={() => setIsAddFlatOpen(false)}
        onSuccess={fetchStats}
      />
      <AddResidentModal
        isOpen={isAddResidentOpen}
        onClose={() => setIsAddResidentOpen(false)}
        onSuccess={fetchStats}
      />
      <GenerateMaintenanceBillsModal
        isOpen={isGenerateBillsOpen}
        onClose={() => setIsGenerateBillsOpen(false)}
        onSuccess={fetchStats}
      />
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onSuccess={(id) => {
          fetchStats();
          if (id) setReceiptPaymentId(id);
        }}
      />
      <PaymentReceiptModal
        isOpen={!!receiptPaymentId}
        onClose={() => setReceiptPaymentId(null)}
        paymentId={receiptPaymentId}
      />
    </AppLayout>
  );
}
