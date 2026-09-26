"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { AddGuestModal } from "@/components/modals/AddGuestModal";
import { EditGuestModal } from "@/components/modals/EditGuestModal";
import { CheckInModal } from "@/components/modals/CheckInModal";
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  Mail,
  Building2,
  Calendar,
  ArrowUpRight,
  LogIn,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";
import { getStoredUser } from "@/lib/auth";
import { useConfirm } from "@/components/providers/ConfirmProvider";

import { Pagination } from "@/components/ui/Pagination";

export default function GuestsPage() {
  const { confirmDelete } = useConfirm();
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [checkInUserId, setCheckInUserId] = useState<number | null>(null);
  const [editingGuest, setEditingGuest] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentUser = getStoredUser();
  const isSecretary = currentUser?.role === "SECRETARY";

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await api.get("/guests", { params });
      setGuests(res.data.data || []);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? (res.data.data || []).length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }
    } catch (err) {
      console.error("Failed to load guests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuest = async (g: any) => {
    const confirmed = await confirmDelete({
      title: "Deactivate Guest",
      itemName: `${g.name}${g.phone ? ` (${g.phone})` : ""}`,
      itemType: "Guest Profile",
      message: `Are you sure you want to deactivate or delete guest "${g.name}"?`,
      confirmText: "Deactivate Guest",
      dangerNote: "Guest records will be marked inactive. Existing past invoices and history will remain intact.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/guests/${g.id}`);
      if (res.data.success) {
        fetchGuests();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete guest");
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [page, pageSize, statusFilter]);

  // Debounce search so typing queries backend after short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchGuests();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Guest Directory
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered guests, identity documents, room assignments, and contact records.
            </p>
          </div>

          {isSecretary && (
            <button
              onClick={() => setIsAddGuestOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Guest</span>
            </button>
          )}
        </div>

        {actionError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-rose-500 hover:text-rose-800 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, mobile, email, or room..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Guests</option>
            <option value="INACTIVE">Inactive Guests</option>
          </select>
        </div>

        {/* Guests Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Guest Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Current Stay</th>
                  <th className="py-3.5 px-4">ID Proof</th>
                  <th className="py-3.5 px-4">Pending Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading guests...
                    </td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No guests found.
                    </td>
                  </tr>
                ) : (
                  guests.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/guests/${g.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition"
                        >
                          {g.name}
                        </Link>
                        {g.fatherHusbandName && (
                          <span className="text-[11px] text-slate-400 block">
                            s/o {g.fatherHusbandName}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {g.mobile}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" /> {g.email || "No Email"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {g.activeStay ? (
                          <div>
                            <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                              <Building2 className="w-3 h-3 text-slate-500" /> Room{" "}
                              {g.activeStay.roomNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Rent: {formatCurrency(g.activeStay.monthlyRent)}/mo
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not Assigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-700">{g.idProofType || "N/A"}</p>
                        <p className="text-[11px] text-slate-400">
                          {g.idProofNumber || "Not recorded"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {g.totalPendingAmount > 0 ? (
                          <span className="font-bold text-red-600">
                            {formatCurrency(g.totalPendingAmount)}
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-600">All Clear</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={g.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!g.activeStay && isSecretary && (
                            <button
                              onClick={() => setCheckInUserId(g.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] border border-emerald-200 transition"
                            >
                              <LogIn className="w-3 h-3" />
                              <span>Assign Room</span>
                            </button>
                          )}
                          <button
                            onClick={() => setEditingGuest(g)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                            title="Edit Guest"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(g)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                            title="Delete Guest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/guests/${g.id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="View Full Profile"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <AddGuestModal
        isOpen={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        onSuccess={fetchGuests}
      />

      <EditGuestModal
        isOpen={Boolean(editingGuest)}
        onClose={() => setEditingGuest(null)}
        onSuccess={fetchGuests}
        guest={editingGuest}
      />

      {checkInUserId && (
        <CheckInModal
          isOpen={!!checkInUserId}
          onClose={() => setCheckInUserId(null)}
          onSuccess={() => {
            fetchGuests();
            setCheckInUserId(null);
          }}
          preselectedUserId={checkInUserId}
        />
      )}
    </AppLayout>
  );
}
