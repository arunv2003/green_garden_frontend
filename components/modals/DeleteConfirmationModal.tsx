"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, AlertCircle, Loader2, X } from "lucide-react";

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  dangerNote?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this? This action cannot be undone.",
  itemName,
  itemType,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  dangerNote = "This action is permanent and may affect linked records in the system.",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center ring-4 ring-rose-50 shadow-xs">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3
                id="delete-modal-title"
                className="text-base font-bold text-slate-800 leading-snug"
              >
                {title}
              </h3>
              {itemType && (
                <span className="inline-block text-[11px] font-semibold text-rose-600 tracking-wide uppercase">
                  {itemType}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>

          {/* Highlight Target Item if provided */}
          {itemName && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-3">
              <div className="mt-0.5 p-1 rounded-md bg-white border border-slate-200 text-slate-500 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Target {itemType || "Record"}
                </p>
                <p className="text-sm font-semibold text-slate-800 break-words mt-0.5">
                  {itemName}
                </p>
              </div>
            </div>
          )}

          {/* Caution Note */}
          {dangerNote && (
            <div className="flex items-start gap-2.5 text-xs text-rose-700 bg-rose-50/80 border border-rose-100 rounded-xl p-3 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{dangerNote}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100/80 active:bg-slate-100 rounded-xl transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
