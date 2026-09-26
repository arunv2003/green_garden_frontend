"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { AddFlatModal } from "@/components/modals/AddFlatModal";
import { EditFlatModal } from "@/components/modals/EditFlatModal";
import {
  Building2,
  Search,
  Plus,
  ArrowUpRight,
  Home,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Pencil,
  Trash2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function FlatsPage() {
  const { confirmDelete } = useConfirm();
  const [flats, setFlats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [blockFilter, setBlockFilter] = useState("ALL");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<any | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDeleteFlat = async (flat: any) => {
    const confirmed = await confirmDelete({
      title: "Deactivate Flat",
      itemName: `Flat ${flat.flatNumber}${flat.block?.name ? ` (${flat.block.name})` : ""}`,
      itemType: "Flat / Unit",
      message: `Are you sure you want to deactivate Flat ${flat.flatNumber}?`,
      confirmText: "Deactivate Flat",
      dangerNote: "Deactivating this flat will prevent new residents or bookings until reactivated.",
    });
    if (!confirmed) {
      return;
    }
    setActionError(null);
    try {
      const res = await api.delete(`/flats/${flat.id}`);
      if (res.data.success) {
        fetchFlats();
        fetchBlocksAndStats();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete flat");
    }
  };

  // Summary counts
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    vacant: 0,
  });

  const fetchFlats = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.occupancyStatus = statusFilter;
      if (blockFilter !== "ALL") params.blockId = blockFilter;

      const res = await api.get("/flats", { params });
      setFlats(res.data.data || []);
      if (res.data.meta) {
        setTotalItems(res.data.meta.total ?? (res.data.data || []).length);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }
    } catch (err) {
      console.error("Failed to fetch flats", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocksAndStats = async () => {
    try {
      const societyRes = await api.get("/society");
      if (societyRes.data?.data?.blocks) {
        setBlocks(societyRes.data.data.blocks);
      }

      // Fetch all flats briefly for high-level counter
      const allFlatsRes = await api.get("/flats", { params: { limit: 100 } });
      const allList = allFlatsRes.data?.data || [];
      setStats({
        total: allFlatsRes.data?.meta?.total || allList.length,
        occupied: allList.filter((f: any) => f.occupancyStatus === "OCCUPIED").length,
        vacant: allList.filter((f: any) => f.occupancyStatus === "VACANT").length,
      });
    } catch (err) {
      console.error("Error loading blocks or stats", err);
    }
  };

  useEffect(() => {
    fetchBlocksAndStats();
  }, []);

  useEffect(() => {
    fetchFlats();
  }, [page, pageSize, statusFilter, blockFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchFlats();
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
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Flats & Units Directory
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete inventory of towers, floors, flats, occupancy status, and current resident profiles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Flat</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Flats</p>
              <p className="text-xl font-black text-slate-900">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Occupied</p>
              <p className="text-xl font-black text-teal-700">{stats.occupied}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vacant</p>
              <p className="text-xl font-black text-amber-700">{stats.vacant}</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Flat Number (e.g. A-101)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
            >
              <option value="ALL">All Towers</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="VACANT">Vacant</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
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

        {/* Flats Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Flat No</th>
                  <th className="py-3.5 px-4">Tower & Floor</th>
                  <th className="py-3.5 px-4">Configuration</th>
                  <th className="py-3.5 px-4">Maintenance / Mo</th>
                  <th className="py-3.5 px-4">Current Resident</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading flats directory...
                    </td>
                  </tr>
                ) : flats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No flats found matching your filters.
                    </td>
                  </tr>
                ) : (
                  flats.map((flat) => {
                    const resident = flat.currentResident || flat.currentTenant || flat.currentOwner;
                    const residentName = resident?.fullName || resident?.name;
                    const residentPhone = resident?.mobile || resident?.phone;
                    return (
                      <tr key={flat.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4 font-bold">
                          <Link
                            href={`/flats/${flat.id}`}
                            className="text-emerald-700 hover:text-emerald-800 font-mono text-sm inline-flex items-center gap-1.5"
                          >
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <span>{flat.flatNumber}</span>
                          </Link>
                          {flat.intercomNumber && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Intercom: #{flat.intercomNumber}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {flat.blockName || `Tower ${flat.blockCode || "A"}`}
                          </span>
                          <span className="text-[11px] text-slate-500">Floor {flat.floorNumber}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                            {flat.flatType}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            {flat.areaSqFt ? `${flat.areaSqFt} Sq.Ft` : "Standard"}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-900">
                          {formatCurrency(flat.monthlyMaintenance || 0)}
                        </td>

                        <td className="py-4 px-4">
                          {resident && residentName ? (
                            <div>
                              <p className="font-bold text-slate-900">{residentName}</p>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                  resident.residentType === "OWNER"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}>
                                  {resident.residentType || "RESIDENT"}
                                </span>
                                {residentPhone && <span>• {residentPhone}</span>}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No resident assigned</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              flat.occupancyStatus === "OCCUPIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : flat.occupancyStatus === "VACANT"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {flat.occupancyStatus}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/flats/${flat.id}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-semibold transition"
                              title="View Flat Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </Link>
                            <button
                              onClick={() => setEditingFlat(flat)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition border border-transparent hover:border-emerald-200"
                              title="Edit Flat"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFlat(flat)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200"
                              title="Deactivate / Delete Flat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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

      <AddFlatModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchFlats();
          fetchBlocksAndStats();
        }}
      />

      <EditFlatModal
        isOpen={Boolean(editingFlat)}
        flat={editingFlat}
        onClose={() => setEditingFlat(null)}
        onSuccess={() => {
          fetchFlats();
          fetchBlocksAndStats();
        }}
      />
    </AppLayout>
  );
}
