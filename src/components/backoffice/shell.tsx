"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutList, Table2, BarChart3, RotateCcw, LogOut } from "lucide-react";
import { SaFlagMark } from "@/components/sa-flag-mark";
import { useDemoStore } from "@/lib/store";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const STAFF_ROLES: Role[] = [
  "assigner",
  "adjudicator",
  "supervisor",
  "deputy_director",
  "director",
  "chief_director",
  "admin",
];

export function BackOfficeShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useDemoStore((s) => s.role);
  const setRole = useDemoStore((s) => s.setRole);
  const resetDemoData = useDemoStore((s) => s.resetDemoData);

  const navItems = [
    { href: "/backoffice/queue", label: "Queue", icon: LayoutList, show: role !== "admin" },
    { href: "/backoffice/applications", label: "All Applications", icon: Table2, show: true },
    { href: "/backoffice/admin", label: "Analytics", icon: BarChart3, show: role === "admin" },
  ].filter((i) => i.show);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-16 flex-col items-center gap-2 border-r border-gray-200 bg-[#1f2a44] py-4">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-vfs-orange text-sm font-semibold text-white">
          {ROLE_LABELS[role].charAt(0)}
        </div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white",
              pathname?.startsWith(href) && "bg-white/15 text-white",
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        ))}
        <div className="mt-auto flex flex-col items-center gap-2">
          <button
            title="Reset demo data"
            onClick={() => {
              if (confirm("Reset all demo data to its original seeded state?")) resetDemoData();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            title="Switch role / exit"
            onClick={() => router.push("/backoffice/login")}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <SaFlagMark />
            <div>
              <p className="text-sm font-semibold text-gray-800">DHA Overstay Appeal &mdash; Back Office</p>
              <p className="text-xs text-gray-400">VFS Global Adjudication Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500">Signed in as</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as Role);
                router.push(e.target.value === "admin" ? "/backoffice/admin" : "/backoffice/queue");
              }}
              className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm font-medium text-gray-800"
            >
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
