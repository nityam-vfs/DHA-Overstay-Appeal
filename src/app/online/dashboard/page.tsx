"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { NotificationBell } from "@/components/notification-bell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useDemoStore } from "@/lib/store";
import { DEMO_APPLICANT_EMAIL } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ChevronDown, Download } from "lucide-react";
import { useMemo, useState } from "react";

export default function ApplicantDashboardPage() {
  const router = useRouter();
  const allApplications = useDemoStore((s) => s.applications);
  const applications = useMemo(
    () => allApplications.filter((a) => a.applicantEmail === DEMO_APPLICANT_EMAIL),
    [allApplications],
  );
  const notifications = useDemoStore((s) => s.notifications);
  const markNotificationRead = useDemoStore((s) => s.markNotificationRead);
  const letters = useDemoStore((s) => s.letters);
  const setApplicantLoggedIn = useDemoStore((s) => s.setApplicantLoggedIn);
  const [menuOpen, setMenuOpen] = useState(false);

  const myAppIds = new Set(applications.map((a) => a.id));
  const myNotifications = notifications.filter((n) => myAppIds.has(n.applicationId));

  const counts = {
    Submitted: applications.filter((a) => a.status === "Submitted").length,
    "Under Review": applications.filter((a) =>
      ["Assigned", "Adjudicator Review", "Supervisor Review", "Deputy Director Review", "Director Review", "Chief Director Review", "V-List Review"].includes(a.status),
    ).length,
    "Pending Documents": applications.filter((a) => a.status === "Pending Applicant Action").length,
    Approved: applications.filter((a) => a.status === "Approved").length,
    Rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <VfsHeader
        rightSlot={
          <div className="flex items-center gap-3">
            <NotificationBell notifications={myNotifications} onMarkRead={markNotificationRead} />
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-1 text-sm text-gray-700">
                Dashboard <ChevronDown className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        setApplicantLoggedIn(false);
                        router.push("/");
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900">My Overstay Appeals</h1>
          <Link href="/online/apply/eligibility">
            <Button>Start New Appeal</Button>
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Object.entries(counts).map(([label, value]) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Ref Number</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400">
                        You have not submitted any appeals yet.
                      </td>
                    </tr>
                  )}
                  {applications.map((a) => {
                    const letter = letters.find((l) => l.applicationId === a.id);
                    return (
                      <tr key={a.id}>
                        <td className="font-medium text-gray-800">{a.refNumber}</td>
                        <td>
                          <StatusBadge status={a.status} />
                        </td>
                        <td>{formatDate(a.createdAt)}</td>
                        <td className="flex flex-wrap gap-2">
                          <Link href={`/online/applications/${a.id}`}>
                            <Button size="sm" variant="outline">
                              {a.status === "Pending Applicant Action" ? "Re-upload Required" : "View"}
                            </Button>
                          </Link>
                          {letter && (
                            <Link href={`/online/letters/${a.id}`}>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" /> Letter
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
