"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { DeleteConfirmationModal } from "../modals/DeleteConfirmationModal";

export interface ConfirmOptions {
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
  confirmText?: string;
  cancelText?: string;
  dangerNote?: string;
}

interface ConfirmContextType {
  confirmDelete: (options: ConfirmOptions) => Promise<boolean>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirmDelete = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsLoading(false);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirmDelete, confirm: confirmDelete }}>
      {children}
      <DeleteConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title || "Confirm Deletion"}
        message={options.message || "Are you sure you want to delete this? This action cannot be undone."}
        itemName={options.itemName}
        itemType={options.itemType}
        confirmText={options.confirmText || "Delete"}
        cancelText={options.cancelText || "Cancel"}
        dangerNote={options.dangerNote}
        isLoading={isLoading}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export const useConfirmDelete = useConfirm;
