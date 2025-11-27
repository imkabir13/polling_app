// components/Notification.tsx
"use client";

import { useEffect } from "react";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number; // Auto-close after duration (ms), default 5000
}

export default function Notification({
  message,
  type,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-500",
          text: "text-green-800",
          icon: "✓",
          iconBg: "bg-green-500",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-500",
          text: "text-red-800",
          icon: "✕",
          iconBg: "bg-red-500",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-500",
          text: "text-yellow-800",
          icon: "⚠",
          iconBg: "bg-yellow-500",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-500",
          text: "text-blue-800",
          icon: "ℹ",
          iconBg: "bg-blue-500",
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
      <div
        className={`${styles.bg} ${styles.text} border-l-4 ${styles.border} p-4 rounded-lg shadow-lg flex items-start gap-3`}
        role="alert"
      >
        {/* Icon */}
        <div
          className={`${styles.iconBg} text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold`}
        >
          {styles.icon}
        </div>

        {/* Message */}
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`${styles.text} hover:opacity-70 flex-shrink-0 text-xl leading-none`}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
