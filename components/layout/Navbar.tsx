"use client";

import React from "react";
import { Menu, Bell, ShieldCheck, Sparkles } from "lucide-react";
import { getStoredUser, UserSession } from "@/lib/auth";
import { Badge } from "../ui/Badge";

interface NavbarProps {
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const [user, setUser] = React.useState<UserSession | null>(null);

  React.useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-600">Green Garden Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-800 leading-tight">
            {user?.name || "Green Garden Admin"}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <Badge status={user?.role || "SECRETARY"} />
          </div>
        </div>

        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
        </div>
      </div>
    </header>
  );
};
