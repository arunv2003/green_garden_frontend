"use client";

import React from "react";
import { StatCard } from "../ui/StatCard";
import {
  Building2,
  Users,
  ShieldCheck,
  LifeBuoy,
  PlusCircle,
  ArrowUpRight,
  Megaphone,
  CheckCircle2,
  Clock,
  Layers,
  Phone,
} from "lucide-react";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils";
import Link from "next/link";

interface SecretaryDashboardProps {
  stats: any;
  onOpenAddFlat?: () => void;
  onOpenAddResident?: () => void;
}

export const SecretaryDashboard: React.FC<SecretaryDashboardProps> = ({
  stats,
  onOpenAddFlat,
  onOpenAddResident,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
              Operations Center
            </span>
            <span className="text-xs text-slate-400">• Green Garden Society</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Secretary Society Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Flats occupancy, resident directory, gate visitors, helpdesk complaints, and circulars.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/announcements"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Post Circular</span>
          </Link>
          <Link
            href="/visitors"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Visitors Gate</span>
          </Link>
          {onOpenAddFlat && (
            <button
              onClick={onOpenAddFlat}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Flat</span>
            </button>
          )}
          {onOpenAddResident && (
            <button
              onClick={onOpenAddResident}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Register Resident</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Flats"
          value={stats?.totalFlats || 0}
          icon={Building2}
          variant="default"
        />
        <StatCard
          title="Occupied"
          value={stats?.occupiedFlats || 0}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Vacant"
          value={stats?.vacantFlats || 0}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Residents"
          value={stats?.totalResidents || 0}
          icon={Users}
          variant="info"
        />
        <StatCard
          title="Inside Society"
          value={stats?.currentlyInsideCount || 0}
          icon={ShieldCheck}
          variant="warning"
        />
        <StatCard
          title="Open Complaints"
          value={stats?.openComplaintsCount || 0}
          icon={LifeBuoy}
          variant="danger"
        />
      </div>

      {/* 2-Column: Live Visitors & Helpdesk Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Log */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Recent Gate Visitors</h3>
            </div>
            <Link
              href="/visitors"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(!stats?.recentVisitors || stats.recentVisitors.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No visitors recorded today.</p>
            ) : (
              stats.recentVisitors.map((v: any) => (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{v.visitorName}</p>
                    <p className="text-[11px] text-slate-500">
                      Visiting Flat {v.flatNumber || "—"} • {v.purpose || "Guest"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      v.status === "INSIDE" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {v.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(v.entryTime)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complaints Desk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Helpdesk Tickets</h3>
            </div>
            <Link
              href="/complaints"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Complaints Desk</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(!stats?.recentComplaints || stats.recentComplaints.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active complaints.</p>
            ) : (
              stats.recentComplaints.map((c: any) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{c.subject || c.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Flat {c.flatNumber || "—"} • {c.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : c.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {c.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(c.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
