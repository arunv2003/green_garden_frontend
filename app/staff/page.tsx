"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { AddAccountantModal } from "@/components/modals/AddAccountantModal";
import { ChangeSecretaryModal } from "@/components/modals/ChangeSecretaryModal";
import { EditAccountantModal } from "@/components/modals/EditAccountantModal";
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserPlus,
  RefreshCw,
  Edit3,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  Search,
  CheckCircle2,
  Sparkles,
  Lock,
  Trash2,
  PhoneCall,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import api from "@/lib/api";

import { Pagination } from "@/components/ui/Pagination";
import { useConfirm } from "@/components/providers/ConfirmProvider";

export default function StaffPage() {
  const { confirmDelete } = useConfirm();
  const [staffData, setStaffData] = useState<{
    activeSecretary: any;
    secretaries: any[];
    accountants: any[];
    totalAccountants: number;
    totalSecretaries: number;
    pagination?: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isAddAccountantOpen, setIsAddAccountantOpen] = useState(false);
  const [isChangeSecretaryOpen, setIsChangeSecretaryOpen] = useState(false);
  const [editingAccountant, setEditingAccountant] = useState<any>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "ALL") params.role = roleFilter;

      const res = await api.get("/staff", { params });
      if (res.data.success) {
        setStaffData(res.data.data);
        const meta = res.data.meta || res.data.data?.pagination;
        if (meta) {
          setTotalItems(meta.total ?? (res.data.data?.accountants || []).length);
          setTotalPages(meta.totalPages ?? 1);
        }
      }
    } catch (err) {
      console.error("Failed to load staff data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page, pageSize, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchStaff();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeactivate = async (id: number, name: string) => {
    const confirmed = await confirmDelete({
      title: "Deactivate Accountant Staff",
      itemName: name,
      itemType: "Society Accountant",
      message: `Are you sure you want to deactivate accountant ${name}?`,
      confirmText: "Deactivate Staff",
      dangerNote: "Their active accountant privileges and system access will be deactivated.",
    });
    if (!confirmed) {
      return;
    }
    try {
      const res = await api.delete(`/staff/${id}`);
      if (res.data.success) {
        fetchStaff();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to deactivate staff member");
    }
  };

  const accountants = staffData?.accountants || [];
  const activeSec = staffData?.activeSecretary;

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
              <span>Staff & Role Administration</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Add and manage accountants, and assign or replace the active property secretary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsChangeSecretaryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-xl transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
              <span>Change Secretary</span>
            </button>

            <button
              onClick={() => setIsAddAccountantOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Accountant</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Secretary KPI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Current Secretary
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 truncate">
                {activeSec?.name || (loading ? "Loading..." : "None Assigned")}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{activeSec?.email || "—"}</p>
          </div>

          {/* Total Accountants KPI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Accountants
              </span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-900">
                {staffData?.totalAccountants || (loading ? "..." : 0)}
              </span>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Active Financial Officers</p>
          </div>

          {/* Secretary Management Role */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Authority Level
              </span>
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-emerald-700">Accountant Desk</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Full staff assignment authority</p>
          </div>

          {/* Audit Logging */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Audit Trail
              </span>
              <Sparkles className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-slate-900">Encrypted Logs</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">All staff updates logged</p>
          </div>
        </div>

        {/* Section 1: Active Secretary Control Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4 text-white border border-slate-800 shadow-md relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white/10 shrink-0">
                {activeSec?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-none truncate">
                    {activeSec?.name || (loading ? "Loading..." : "No Active Secretary")}
                  </h2>
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 leading-none">
                    Active Secretary
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-1">
                  Direct operational authority for room assignment, guest check-in, check-out, and resident directory.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-300">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                    <Mail className="w-3 h-3 text-teal-400" />
                    <span>{activeSec?.email || "—"}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                    <Phone className="w-3 h-3 text-teal-400" />
                    <span>{activeSec?.mobile || "—"}</span>
                  </span>

                  {activeSec?.idProofNumber && (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                      <FileText className="w-3 h-3 text-teal-400" />
                      <span>{activeSec.idProofType}: {activeSec.idProofNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsChangeSecretaryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition shadow-md shrink-0 self-start md:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change / Replace Secretary</span>
            </button>
          </div>
        </div>

        {/* Section 2: Staff Directory */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Staff & Officers Directory</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized personnel (Accountants and Secretaries) managing administration, billing, and properties.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-44 sm:w-56"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="ACCOUNTANT">Accountants</option>
                <option value="SECRETARY">Secretaries</option>
              </select>

              <button
                onClick={() => setIsAddAccountantOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Staff</span>
              </button>
            </div>
          </div>

          {/* Staff Table */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Loading staff directory...
            </div>
          ) : accountants.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No staff members found. Click "+ Add Staff" to create one.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Identity Proof</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Added On</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {accountants.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl border font-bold flex items-center justify-center text-xs shadow-xs ${
                                acc.role === "SECRETARY"
                                  ? "bg-teal-50 border-teal-200 text-teal-800"
                                  : "bg-indigo-50 border-indigo-200/80 text-indigo-700"
                              }`}
                            >
                              {acc.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">
                                {acc.name}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                ID #{acc.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {acc.role === "SECRETARY" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/80 font-bold text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                              <span>Secretary</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200/80 font-bold text-[11px]">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Accountant</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{acc.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{acc.mobile}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 font-medium block">
                            {acc.idProofType || "PAN Card"}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {acc.idProofNumber || "Verified"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              acc.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                acc.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {acc.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {formatDate(acc.createdAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingAccountant(acc)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Accountant"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeactivate(acc.id, acc.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Deactivate Accountant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
          )}
        </div>

        {/* Modals */}
        <AddAccountantModal
          isOpen={isAddAccountantOpen}
          onClose={() => setIsAddAccountantOpen(false)}
          onSuccess={fetchStaff}
        />

        <ChangeSecretaryModal
          isOpen={isChangeSecretaryOpen}
          onClose={() => setIsChangeSecretaryOpen(false)}
          onSuccess={fetchStaff}
          currentSecretary={activeSec}
        />

        <EditAccountantModal
          isOpen={!!editingAccountant}
          onClose={() => setEditingAccountant(null)}
          onSuccess={fetchStaff}
          accountant={editingAccountant}
        />
      </div>
    </AppLayout>
  );
}
