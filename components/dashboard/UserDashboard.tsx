"use client";

import React from "react";
import { StatCard } from "../ui/StatCard";
import { Badge } from "../ui/Badge";
import {
  Building2,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Megaphone,
  LifeBuoy,
  ArrowUpRight,
  Home,
  Users,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

interface UserDashboardProps {
  stats: any;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ stats }) => {
  const resident = stats?.resident;
  const myFlat = stats?.myFlat;
  const currentBill = stats?.currentBill;
  const totalPending = stats?.totalPending || 0;
  const totalPaid = stats?.totalPaid || 0;
  const recentNotices = stats?.recentNotices || [];
  const userComplaints = stats?.userComplaints || [];

  return (
    <div className="space-y-6">
      {/* Flat Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-200 font-semibold">
              Your Flat & Residence
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-3xl font-black font-mono">
                {myFlat ? `Flat ${myFlat.flatNumber}` : "No Flat Assigned"}
              </h2>
              {myFlat && (
                <span className="text-xs bg-emerald-700/60 px-2.5 py-1 rounded-md border border-emerald-500/40">
                  {myFlat.blockName || "Tower A"} • Floor {myFlat.floorNumber} • {myFlat.flatType}
                </span>
              )}
            </div>
            {resident && (
              <p className="text-xs text-emerald-100 mt-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-[10px] uppercase font-bold">
                  {resident.residentType}
                </span>
                <span>• Moved in: {formatDate(resident.moveInDate)}</span>
              </p>
            )}
          </div>

          {myFlat && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-right">
              <p className="text-xs text-emerald-200">Monthly Maintenance</p>
              <p className="text-2xl font-black text-white mt-0.5 font-mono">
                {formatCurrency(myFlat.monthlyMaintenance)}
              </p>
              <Link
                href="/my-flat"
                className="inline-flex items-center gap-1 text-[11px] text-emerald-200 hover:text-white font-semibold mt-1"
              >
                <span>Manage Family & Vehicles</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Current Outstanding Dues"
          value={formatCurrency(totalPending)}
          icon={AlertCircle}
          variant={totalPending > 0 ? "danger" : "success"}
          subtitle={totalPending > 0 ? "Payment due" : "All maintenance dues cleared!"}
        />
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</p>
          <div className="flex items-center gap-2 mt-3">
            <Link
              href="/maintenance"
              className="flex-1 text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              Pay Dues
            </Link>
            <Link
              href="/complaints"
              className="flex-1 text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Helpdesk
            </Link>
          </div>
        </div>
      </div>

      {/* Two Columns: Notice Board & Helpdesk Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notice Board */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Megaphone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Society Notices & Circulars</h3>
            </div>
            <Link
              href="/announcements"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentNotices.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent notices published.</p>
            ) : (
              recentNotices.map((n: any) => (
                <div key={n.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {n.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(n.publishDate || n.createdAt)}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{n.title}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Open Complaints */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Your Helpdesk Tickets</h3>
            </div>
            <Link
              href="/complaints"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>File New</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {userComplaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active complaint tickets.</p>
            ) : (
              userComplaints.map((c: any) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{c.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Ticket #{c.complaintNumber} • {c.category}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    c.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : c.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
