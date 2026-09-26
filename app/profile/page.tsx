"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  ShieldCheck,
  Calendar,
  LogOut,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Edit3,
  KeyRound,
  Building2,
  CreditCard,
  HeartHandshake,
  FileCheck,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { clearSession, setSession, getStoredUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    mobile: "",
    fatherHusbandName: "",
    address: "",
    emergencyContact: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Change Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me");
      setProfile(res.data.data);
      if (res.data.data) {
        setEditForm({
          mobile: res.data.data.mobile || "",
          fatherHusbandName: res.data.data.fatherHusbandName || "",
          address: res.data.data.address || "",
          emergencyContact: res.data.data.emergencyContact || "",
        });
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    try {
      setEditLoading(true);
      const res = await api.put("/auth/profile", editForm);
      if (res.data.success) {
        setEditSuccess("Profile updated successfully!");
        setProfile(res.data.data);
        // Also update local storage session if name/mobile changed
        const currentSession = getStoredUser();
        if (currentSession) {
          const updatedSession = { ...currentSession, ...res.data.data };
          localStorage.setItem("green_garden_user", JSON.stringify(updatedSession));
        }
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess("");
        }, 1200);
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.put("/auth/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data.success) {
        setPasswordSuccess("Password changed successfully!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordSuccess("");
        }, 1500);
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const rolePermissions: Record<string, { can: string[]; cannot: string[] }> = {
    SECRETARY: {
      can: [
        "Full access to all system modules (Rooms, Guests, Residents, Stays, Billing, Reports, Staff)",
        "Add and register new Accountants into the system",
        "Manage rooms (Add, edit, pricing & availability)",
        "Register and manage guests & residents",
        "Assign guests to rooms & record check-in / check-out",
        "View live resident directory & stay histories",
      ],
      cannot: [
        "Delete or tamper with confirmed payment transactions",
        "Bypass security audit log records",
      ],
    },
    ACCOUNTANT: {
      can: [
        "Direct access to Rooms, Guests, and Payments",
        "Record rental payments & print official receipts",
        "Generate monthly billing runs & prorations",
        "Access comprehensive guest ledgers & collection reports",
        "Manage staff accounts & assign secretary",
      ],
      cannot: [
        "Perform check-in/checkout without operational approval",
        "Modify physical room configurations directly",
      ],
    },
    USER: {
      can: [
        "View active assigned room specifications & rent",
        "View personal stay history & check-in dates",
        "View personal monthly rental invoices & dues",
        "View personal payment history & remaining balance",
      ],
      cannot: [
        "Access other guests' data or global directory",
        "Modify room configurations or financial records",
        "Access administrative or staff modules",
      ],
    },
  };


  const currentPermissions = profile ? rolePermissions[profile.role] || rolePermissions.USER : null;
  const isResident = profile?.role === "USER";

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 border border-slate-800 px-5 py-3.5 sm:px-6 sm:py-4 text-white shadow-md">
          {/* Subtle Ambient Glow Mesh */}
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3.5">
              {/* Stylized Avatar */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white/10">
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-slate-950 font-bold" />
                </div>
              </div>

              {/* Name and Meta */}
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-none truncate">
                    {profile?.name || (loading ? "Loading profile..." : "Resident User")}
                  </h1>
                  {profile && <Badge status={profile.role} className="text-[10px] px-2 py-0.5 leading-none" />}
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 leading-none">
                    <ShieldCheck className="w-3 h-3" />
                    Verified {isResident ? "Resident" : "Staff"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-300">
                  <button
                    onClick={() => copyToClipboard(profile?.email, "email")}
                    className="flex items-center gap-1.5 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md border border-white/10 transition"
                    title="Click to copy email"
                  >
                    <Mail className="w-3 h-3 text-emerald-400" />
                    <span>{profile?.email || "—"}</span>
                    {copiedField === "email" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  <button
                    onClick={() => copyToClipboard(profile?.mobile, "mobile")}
                    className="flex items-center gap-1.5 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md border border-white/10 transition"
                    title="Click to copy phone"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{profile?.mobile || "—"}</span>
                    {copiedField === "mobile" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    Member since {formatDate(profile?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/15 backdrop-blur-md transition shadow-xs"
              >
                <Edit3 className="w-3 h-3 text-emerald-400" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/15 backdrop-blur-md transition shadow-xs"
              >
                <KeyRound className="w-3 h-3 text-teal-300" />
                <span>Change Password</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 rounded-lg border border-rose-500/30 transition shadow-xs"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Highlight KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isResident ? (
            <>
              {/* Card 1: Assigned Room */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Assigned Room
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {profile?.activeStay?.roomNumber ? `Room #${profile.activeStay.roomNumber}` : "Room #101"}
                  </span>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Floor {profile?.activeStay?.floor || 1}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Type: {profile?.activeStay?.roomType || "Single"} Occupancy
                </p>
              </div>

              {/* Card 2: Monthly Rent */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Monthly Rental
                  </span>
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-slate-900">
                    {profile?.activeStay?.monthlyRent
                      ? formatCurrency(profile.activeStay.monthlyRent)
                      : "₹12,000"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Due on 5th of each calendar month</p>
              </div>

              {/* Card 3: Security Deposit */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Security Deposit
                  </span>
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-slate-900">
                    {profile?.activeStay?.securityDeposit
                      ? formatCurrency(profile.activeStay.securityDeposit)
                      : "₹12,000"}
                  </span>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-1">Lodged & Refundable</p>
              </div>

              {/* Card 4: Account Standing */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Resident Standing
                  </span>
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-emerald-600">Active</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Zero pending infractions</p>
              </div>
            </>
          ) : (
            <>
              {/* Staff Overview */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Staff Role
                </span>
                <span className="text-2xl font-black text-slate-900 mt-2 block">
                  {profile?.role === "SECRETARY" ? "Secretary Ops" : "Accountant Desk"}
                </span>
                <p className="text-xs text-slate-500 mt-1">Operational clearance authorized</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Scope of Authority
                </span>
                <span className="text-2xl font-black text-slate-900 mt-2 block">
                  {profile?.role === "SECRETARY" ? "Room & Resident Mgmt" : "Full Financial Books"}
                </span>
                <p className="text-xs text-slate-500 mt-1">Green Garden Facility</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Identity Document
                </span>
                <span className="text-xl font-bold text-slate-900 mt-2 block truncate">
                  {profile?.idProofType || "Official ID"}
                </span>
                <p className="text-xs text-emerald-600 font-medium mt-1">Verified on File</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Audit Logging
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-2 block">Enabled</span>
                <p className="text-xs text-slate-500 mt-1">All actions timestamped</p>
              </div>
            </>
          )}
        </div>

        {/* Main Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Personal Dossier & Identity (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    Personal & Account Dossier
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified contact information and residency credentials
                  </p>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update</span>
                </button>
              </div>

              {/* Data Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Mobile */}
                <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition group">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="font-semibold text-[11px] uppercase tracking-wider">
                      Mobile Number
                    </span>
                    <Phone className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      {profile?.mobile || "Not specified"}
                    </span>
                    {profile?.mobile && (
                      <button
                        onClick={() => copyToClipboard(profile.mobile, "mobile-card")}
                        className="text-slate-400 hover:text-emerald-600 p-1"
                        title="Copy"
                      >
                        {copiedField === "mobile-card" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition group">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="font-semibold text-[11px] uppercase tracking-wider">
                      Primary Email
                    </span>
                    <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 truncate pr-2">
                      {profile?.email || "Not specified"}
                    </span>
                    {profile?.email && (
                      <button
                        onClick={() => copyToClipboard(profile.email, "email-card")}
                        className="text-slate-400 hover:text-emerald-600 p-1 shrink-0"
                        title="Copy"
                      >
                        {copiedField === "email-card" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Father / Husband */}
                <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="font-semibold text-[11px] uppercase tracking-wider">
                      Father / Husband Name
                    </span>
                    <HeartHandshake className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {profile?.fatherHusbandName || "—"}
                  </span>
                </div>

                {/* Emergency Contact */}
                <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="font-semibold text-[11px] uppercase tracking-wider">
                      Emergency Contact
                    </span>
                    <Phone className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {profile?.emergencyContact || "Not recorded"}
                  </span>
                </div>

                {/* Identity Document */}
                <div className="sm:col-span-2 bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="font-semibold text-[11px] uppercase tracking-wider">
                      Government Identity Document
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Document
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-slate-900">
                      {profile?.idProofType || "Aadhaar Card"}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {profile?.idProofNumber || "Verified in Office"}
                    </span>
                  </div>
                </div>

                {/* Permanent Address */}
                <div className="sm:col-span-2 bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition">
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="font-semibold text-[11px] uppercase tracking-wider">
                      Permanent Address
                    </span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed mt-1">
                    {profile?.address || "Address not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Resident Quick Actions & Links (If Resident) */}
            {isResident && (
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 rounded-3xl border border-emerald-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      View Your Room & Payment History
                    </h3>
                    <p className="text-xs text-slate-600">
                      Access your invoices, stay dates, and official receipts.
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition"
                  >
                    <span>My Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Security, Guardrails & Account Status (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Role Permissions Matrix Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Security & Role Guardrails
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Role-Based Access Control (RBAC)
                  </p>
                </div>
                {profile && <Badge status={profile.role} />}
              </div>

              {currentPermissions && (
                <div className="space-y-6">
                  {/* Authorized Capabilities */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Authorized Capabilities
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100/70 text-emerald-800 rounded-full">
                        {currentPermissions.can.length} Allowed
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {currentPermissions.can.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/80 text-slate-700 text-xs transition hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Enforced System Boundaries */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Enforced System Boundaries
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100/70 text-rose-800 rounded-full">
                        {currentPermissions.cannot.length} Restricted
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {currentPermissions.cannot.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/40 border border-rose-100/80 text-slate-600 text-xs transition hover:bg-rose-50"
                        >
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Account Security & Session Overview */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" />
                Session & Account Security
              </h3>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800 block">Password Protection</span>
                    <span className="text-[11px] text-slate-500">Encrypted with bcrypt (10 rounds)</span>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800 block">Current JWT Session</span>
                    <span className="text-[11px] text-slate-500">Valid for 7 days with bearer token</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-600" />
                  Update Profile Details
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {editError && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                  {editSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    placeholder="e.g. 9876543212"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Father / Husband Name
                  </label>
                  <input
                    type="text"
                    value={editForm.fatherHusbandName}
                    onChange={(e) => setEditForm({ ...editForm, fatherHusbandName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    placeholder="e.g. Anil Sharma"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={editForm.emergencyContact}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    placeholder="e.g. 9811223344"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Permanent Address
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                    placeholder="e.g. H.No 42, Sector 15, Chandigarh"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  Change Password
                </h3>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {passwordError && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    placeholder="Enter existing password (e.g. User@123)"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
