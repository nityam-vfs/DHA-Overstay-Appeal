"use client";

import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDemoStore } from "@/lib/store";
import { ROLE_LABELS, type Role } from "@/lib/types";
import {
  ClipboardList,
  Gavel,
  ShieldCheck,
  UserCog,
  Landmark,
  Crown,
  Stamp,
  Settings2,
} from "lucide-react";

const ROLE_CARDS: { role: Role; description: string; icon: React.ElementType }[] = [
  { role: "assigner", description: "View new submissions and assign to an adjudicator.", icon: ClipboardList },
  { role: "adjudicator", description: "Review applications and documents; recommend a decision.", icon: Gavel },
  { role: "supervisor", description: "Review the adjudicator's recommendation and approve or reject.", icon: ShieldCheck },
  { role: "deputy_director", description: "Review application and approve or reject.", icon: UserCog },
  { role: "director", description: "Review application and approve or reject.", icon: Landmark },
  { role: "chief_director", description: "Review application and recommend approval or rejection.", icon: Crown },
  { role: "v_list", description: "Final approval, rejection and decision letter generation.", icon: Stamp },
  { role: "admin", description: "View all applications, dashboards, manage users and fees.", icon: Settings2 },
];

export default function BackOfficeLoginPage() {
  const router = useRouter();
  const setRole = useDemoStore((s) => s.setRole);

  return (
    <div className="min-h-screen bg-gray-50">
      <VfsHeader />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="mb-1 text-2xl font-semibold text-gray-900">Back Office Login</h1>
        <p className="mb-8 text-sm text-gray-500">
          Select a role to continue. This prototype uses simple role switching instead of full authentication.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLE_CARDS.map(({ role, description, icon: Icon }) => (
            <Card
              key={role}
              className="cursor-pointer transition hover:border-vfs-orange hover:shadow-md"
              onClick={() => {
                setRole(role);
                router.push(role === "admin" ? "/backoffice/admin" : "/backoffice/queue");
              }}
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-vfs-orange">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{ROLE_LABELS[role]}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
