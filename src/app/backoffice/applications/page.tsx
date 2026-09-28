"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BackOfficeShell } from "@/components/backoffice/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useDemoStore } from "@/lib/store";
import type { ApplicationStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const ALL_STATUSES: (ApplicationStatus | "All")[] = [
  "All",
  "Draft",
  "Submitted",
  "Assigned",
  "Adjudicator Review",
  "Supervisor Review",
  "Deputy Director Review",
  "Director Review",
  "Chief Director Review",
  "Pending Applicant Action",
  "Approved",
  "Rejected",
  "Closed",
];

export default function AllApplicationsPage() {
  const applications = useDemoStore((s) => s.applications);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "All">("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      const matchesQuery =
        !q ||
        a.refNumber.toLowerCase().includes(q) ||
        `${a.name} ${a.surname}`.toLowerCase().includes(q) ||
        a.passportNumber.toLowerCase().includes(q) ||
        a.applicantEmail.toLowerCase().includes(q);
      const matchesStatus = status === "All" || a.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [applications, search, status]);

  return (
    <BackOfficeShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">All Applications</h1>
        <p className="text-sm text-gray-500">{applications.length} total applications in the system.</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by name, ref number, passport, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus | "All")}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={() => { setSearch(""); setStatus("All"); }}>
              Clear
            </Button>
          </div>

          <div className="max-h-[600px] overflow-auto">
            <table>
              <thead>
                <tr>
                  <th>Ref Number</th>
                  <th>Applicant</th>
                  <th>Passport Number</th>
                  <th>Nationality</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-gray-800">{a.refNumber}</td>
                    <td>
                      {a.name} {a.surname}
                    </td>
                    <td>{a.passportNumber}</td>
                    <td>{a.nationality}</td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>{a.assignedTo ?? "—"}</td>
                    <td>
                      <Link href={`/backoffice/review/${a.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </BackOfficeShell>
  );
}
