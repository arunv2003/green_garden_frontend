import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className }) => {
  const normalized = status.toUpperCase();

  let colorStyles = "bg-slate-100 text-slate-700 border-slate-200";

  // Room & Stay Statuses
  if (normalized === "AVAILABLE") {
    colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (normalized === "OCCUPIED" || normalized === "ACTIVE") {
    colorStyles = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (normalized === "PARTIALLY_OCCUPIED") {
    colorStyles = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (normalized === "MAINTENANCE") {
    colorStyles = "bg-purple-50 text-purple-700 border-purple-200";
  } else if (normalized === "INACTIVE" || normalized === "CANCELLED") {
    colorStyles = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (normalized === "COMPLETED") {
    colorStyles = "bg-slate-100 text-slate-700 border-slate-300";
  }

  // Payment Statuses
  if (normalized === "PAID") {
    colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (normalized === "PARTIAL") {
    colorStyles = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (normalized === "PENDING") {
    colorStyles = "bg-rose-50 text-rose-700 border-rose-200";
  }

  // Role Badges
  if (normalized === "SECRETARY") {
    colorStyles = "bg-teal-50 text-teal-700 border-teal-200";
  } else if (normalized === "ACCOUNTANT") {
    colorStyles = "bg-indigo-50 text-indigo-700 border-indigo-200";
  } else if (normalized === "USER") {
    colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        colorStyles,
        className
      )}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
};
