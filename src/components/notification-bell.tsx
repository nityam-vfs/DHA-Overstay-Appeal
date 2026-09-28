"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import type { Notification } from "@/lib/types";

export function NotificationBell({
  notifications,
  onMarkRead,
}: {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">
              Notifications
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="p-4 text-sm text-gray-400">No notifications yet.</p>
              )}
              {[...notifications]
                .reverse()
                .map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onMarkRead?.(n.id)}
                    className={cn(
                      "block w-full border-b border-gray-50 px-4 py-2.5 text-left text-sm hover:bg-gray-50",
                      !n.read && "bg-blue-50/60",
                    )}
                  >
                    <p className="text-gray-800">{n.message}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
