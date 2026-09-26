"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Pagination } from "@/components/ui/Pagination";
import { AddResidentModal } from "@/components/modals/AddResidentModal";
import { EditResidentModal } from "@/components/modals/EditResidentModal";
import {
  Users,
  Search,
  Plus,
  ArrowUpRight,
  Building2,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  UserCheck,
  Pencil,
  Trash2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function ResidentsPage() {
  const { confirmDelete } = useConfirm();
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [residentTypeFilter, setResidentTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDeleteResident = async (resident: any) => {
    const residentName = resident.userName || resident.name || "Resident";
    const confirmed = await confirmDelete({
      title: "Deactivate Resident",
      itemName: `${residentName}${resident.flat?.flatNumber ? ` (Flat ${resident.flat.flatNumber})` : ""}`,
      itemType: "Resident",
      message: `Are you sure you want to deactivate ${residentName}? This will set their status to Inactive.`,
      confirmText: "Deactivate Resident",
      dangerNote: "Their active occupancy record will be marked as inactive.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/residents/${resident.id}`);
      if (res.data.success) {
        fetchResidents();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to deactivate resident");
    }
  };

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (residentTypeFilter !== "ALL") params.residentType = residentTypeFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await api.get("/residents", { params });
      setResidents(res.data.data || []);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? (res.data.data || []).length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }
    } catch (err) {
      console.error("Failed to fetch residents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [page, pageSize, residentTypeFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchResidents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Society Residents Directory
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active owners and tenants residing in Green Garden Society with family & vehicle counts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Resident</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search resident name, mobile, flat..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={residentTypeFilter}
              onChange={(e) => setResidentTypeFilter(e.target.value)}
            >
              <option value="ALL">All Resident Types</option>
              <option value="OWNER">Owners Only</option>
              <option value="TENANT">Tenants Only</option>
            </select>

            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Residents</option>
              <option value="INACTIVE">Past / Inactive</option>
            </select>
          </div>
        </div>

        {/* Global Action Error Alert */}
        {actionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-500 hover:text-rose-800 font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Residents Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Flat No</th>
                  <th className="py-3.5 px-4">Resident Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Move-in Date</th>
                  <th className="py-3.5 px-4">Family & Vehicles</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Loading residents...
                    </td>
                  </tr>
                ) : residents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No residents found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  residents.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 font-bold">
                        <Link
                          href={`/flats/${r.flatId}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs hover:bg-emerald-100 transition inline-flex items-center gap-1"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Flat {r.flatNumber || `#${r.flatId}`}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900 text-sm">{r.fullName || r.userName || r.name || "Resident"}</p>
                        {(r.email || r.userEmail) && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{r.email || r.userEmail}</p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.residentType === "OWNER"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {r.residentType}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.mobile || r.userPhone || r.phone || "—"}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {r.moveInDate ? formatDate(r.moveInDate) : "—"}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-[11px] font-semibold">
                            {r.familyCount ?? 0} Family
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-[11px] font-semibold">
                            {r.vehicleCount ?? 0} Vehicles
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {r.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/flats/${r.flatId}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-semibold transition"
                            title="View Flat Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View </span>
                          </Link>
                          <button
                            onClick={() => setEditingResident(r)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-transparent hover:border-emerald-200"
                            title="Edit Resident Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteResident(r)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                            title="Deactivate / Move Out Resident"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <AddResidentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchResidents}
      />

      <EditResidentModal
        isOpen={Boolean(editingResident)}
        resident={editingResident}
        onClose={() => setEditingResident(null)}
        onSuccess={fetchResidents}
      />
    </AppLayout>
  );
}
