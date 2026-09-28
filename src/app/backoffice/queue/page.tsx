"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BackOfficeShell } from "@/components/backoffice/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/status-badge";
import { useDemoStore } from "@/lib/store";
import { DEMO_ADJUDICATORS, ROLE_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function QueuePage() {
  const role = useDemoStore((s) => s.role);
  const applications = useDemoStore((s) => s.applications);
  const assignApplication = useDemoStore((s) => s.assignApplication);
  const [search, setSearch] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedAdjudicator, setSelectedAdjudicator] = useState(DEMO_ADJUDICATORS[0]);

  const queue = useMemo(() => {
    switch (role) {
      case "assigner":
        return applications.filter((a) => a.status === "Submitted");
      case "adjudicator":
        return applications.filter((a) => a.status === "Adjudicator Review");
      case "supervisor":
        return applications.filter((a) => a.status === "Supervisor Review");
      case "deputy_director":
        return applications.filter((a) => a.status === "Deputy Director Review");
      case "director":
        return applications.filter((a) => a.status === "Director Review");
      case "chief_director":
        return applications.filter((a) => a.status === "Chief Director Review");
      case "v_list":
        return applications.filter((a) => a.status === "V-List Review");
      default:
        return applications;
    }
  }, [applications, role]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter(
      (a) =>
        a.refNumber.toLowerCase().includes(q) ||
        `${a.name} ${a.surname}`.toLowerCase().includes(q) ||
        a.passportNumber.toLowerCase().includes(q),
    );
  }, [queue, search]);

  const activeTotal = applications.filter((a) =>
    ["Submitted", "Assigned", "Adjudicator Review", "Supervisor Review", "Deputy Director Review", "Director Review", "Chief Director Review", "V-List Review"].includes(a.status),
  ).length;
  const completedTotal = applications.filter((a) => a.status === "Approved" || a.status === "Rejected" || a.status === "Closed").length;

  return (
    <BackOfficeShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{ROLE_LABELS[role]} Queue</h1>
          <p className="text-sm text-gray-500">Applications awaiting action at your stage.</p>
        </div>
        <div className="flex gap-3">
          <StatPill label="New" value={queue.length} tone="gray" />
          <StatPill label="In Progress" value={activeTotal} tone="green" />
          <StatPill label="Completed" value={completedTotal} tone="dark" />
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <Input
              placeholder="Filter by Applicant Name / Ref Number / Passport No"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline" onClick={() => setSearch("")}>
              Clear
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Ref Number</th>
                  <th>Applicant</th>
                  <th>Passport Number</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400">
                      No applications in this queue.
                    </td>
                  </tr>
                )}
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-gray-800">{a.refNumber}</td>
                    <td>
                      {a.name} {a.surname}
                    </td>
                    <td>{a.passportNumber}</td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>{a.assignedTo ?? "—"}</td>
                    <td>
                      {role === "assigner" ? (
                        <Button size="sm" onClick={() => setAssigningId(a.id)}>
                          Assign
                        </Button>
                      ) : (
                        <Link href={`/backoffice/review/${a.id}`}>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={!!assigningId}
        onClose={() => setAssigningId(null)}
        title="Assign to Adjudicator"
        description="Select an adjudicator to review this appeal."
      >
        <div className="space-y-4">
          <select
            value={selectedAdjudicator}
            onChange={(e) => setSelectedAdjudicator(e.target.value)}
            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
          >
            {DEMO_ADJUDICATORS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssigningId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (assigningId) assignApplication(assigningId, selectedAdjudicator);
                setAssigningId(null);
              }}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </BackOfficeShell>
  );
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: "gray" | "green" | "dark" }) {
  const toneClass = {
    gray: "bg-gray-100 text-gray-800",
    green: "bg-green-100 text-green-800",
    dark: "bg-gray-900 text-white",
  }[tone];
  return (
    <div className={`flex flex-col items-center rounded-md px-4 py-2 ${toneClass}`}>
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-[11px] uppercase tracking-wide">{label}</span>
    </div>
  );
}
