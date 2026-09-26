"use client";

import React from "react";
import { ConfirmProvider } from "./ConfirmProvider";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ConfirmProvider>{children}</ConfirmProvider>;
};
