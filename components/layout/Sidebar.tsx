"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldAlert,
  CreditCard,
  FileSpreadsheet,
  BarChart3,
  User,
  LogOut,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Receipt,
  DollarSign,
  Megaphone,
  LifeBuoy,
  Home,
  Layers,
  X,
} from "lucide-react";

import { Badge } from "../ui/Badge";
import { getStoredUser, clearSession, setSession, UserSession } from "@/lib/auth";
import api from "@/lib/api";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<UserSession | null>(null);

  React.useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  const role = currentUser?.role || "SECRETARY";

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const switchRole = async (targetRole: "SECRETARY" | "ACCOUNTANT" | "USER") => {
    const creds = {
      SECRETARY: { identifier: "secretary@greengarden.com", password: "Secretary@123" },
      ACCOUNTANT: { identifier: "accountant@greengarden.com", password: "Accountant@123" },
      USER: { identifier: "rahul@gmail.com", password: "User@123" },
    }[targetRole];

    try {
      const res = await api.post("/auth/login", creds);
      if (res.data.success) {
        setSession(res.data.data.token, res.data.data.user);
        setCurrentUser(res.data.data.user);
        window.location.reload();
      }
    } catch (err) {
      console.error("Role switch failed", err);
    }
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["SECRETARY", "ACCOUNTANT", "USER"],
    },
    {
      title: "My Flat",
      href: "/my-flat",
      icon: Home,
      roles: ["USER"],
      badge: "Flat",
    },
    {
      title: "Society Master",
      href: "/society",
      icon: Layers,
      roles: ["SECRETARY"],
      badge: "Setup",
    },
    {
      title: "Flats Directory",
      href: "/flats",
      icon: Building2,
      roles: ["SECRETARY", "ACCOUNTANT"],
    },
    {
      title: "Residents",
      href: "/residents",
      icon: Users,
      roles: ["SECRETARY", "ACCOUNTANT"],
      badge: "Live",
    },
    {
      title: "Maintenance Bills",
      href: "/maintenance",
      icon: Receipt,
      roles: ["SECRETARY", "ACCOUNTANT", "USER"],
    },
    {
      title: "Payments",
      href: "/payments",
      icon: CreditCard,
      roles: ["SECRETARY", "ACCOUNTANT", "USER"],
    },
    {
      title: "Society Expenses",
      href: "/expenses",
      icon: DollarSign,
      roles: ["SECRETARY", "ACCOUNTANT"],
    },
    {
      title: "Visitors Gate",
      href: "/visitors",
      icon: ShieldCheck,
      roles: ["SECRETARY", "USER"],
      badge: "Gate",
    },
    {
      title: "Complaints Desk",
      href: "/complaints",
      icon: LifeBuoy,
      roles: ["SECRETARY", "USER"],
    },
    {
      title: "Notice Board",
      href: "/announcements",
      icon: Megaphone,
      roles: ["SECRETARY", "ACCOUNTANT", "USER"],
    },
    {
      title: "Monthly Ledger",
      href: "/ledger",
      icon: FileSpreadsheet,
      roles: ["SECRETARY", "ACCOUNTANT"],
    },
    {
      title: "Reports & Statement",
      href: "/reports",
      icon: BarChart3,
      roles: ["SECRETARY", "ACCOUNTANT"],
    },
    {
      title: "Staff & Roles",
      href: "/staff",
      icon: ShieldAlert,
      roles: ["SECRETARY"],
      badge: "Admin",
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
      roles: ["SECRETARY", "ACCOUNTANT", "USER"],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col h-full min-h-0 border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-emerald-900/30 shrink-0 border border-emerald-500/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.svg" alt="Green Garden" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white tracking-wide leading-tight truncate">
              GREEN GARDEN
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium tracking-wider uppercase truncate">
              Society Management
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto overscroll-contain">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-950 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className="truncate">{item.title}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-4 bg-slate-950/70 border-t border-slate-800 shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "G"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser?.name || "Green Garden User"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {currentUser?.email || "user@greengarden.com"}
              </p>
            </div>
          </div>
          <Badge status={role} className="text-[10px] uppercase font-semibold shrink-0" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
