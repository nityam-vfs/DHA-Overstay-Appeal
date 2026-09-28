"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function VfsHeader({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 text-[10px] font-semibold text-gray-600">
              vfs
            </span>
            <span className="text-sm font-semibold tracking-wide text-gray-800">VFS.GLOBAL</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {rightSlot}
          <button className="flex items-center gap-1 text-sm text-gray-700">
            English <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
