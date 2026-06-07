"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import NotifModal from "../components/NotifModal";

type Variant = "success" | "error";

interface NotificationContextType {
  show: (message: string, variant?: Variant) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [payload, setPayload] = useState<{
    message: string;
    variant: Variant;
  } | null>(null);

  const show = (message: string, variant: Variant = "success") => {
    setPayload({ message, variant });
  };

  const handleClose = () => setPayload(null);

  return (
    <NotificationContext.Provider value={{ show }}>
      {children}
      {payload && (
        <NotifModal
          message={payload.message}
          variant={payload.variant}
          onClose={handleClose}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotification must be used inside NotificationProvider");
  return context;
};
