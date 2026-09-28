"use client";

import { useDemoStore } from "@/lib/store";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useDemoStore((s) => s.hydrated);
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading demo data...</p>
      </div>
    );
  }
  return <>{children}</>;
}
