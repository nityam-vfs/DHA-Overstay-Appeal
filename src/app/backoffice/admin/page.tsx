"use client";

import { useMemo, useState } from "react";
import { BackOfficeShell } from "@/components/backoffice/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoStore } from "@/lib/store";
import { DEMO_ADJUDICATORS, ROLE_LABELS, type Role } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Submitted: "#3b82f6",
  Pending: "#f59e0b",
  Approved: "#16a34a",
  Rejected: "#dc2626",
  "In Review": "#ED6B24",
};

const DEMO_USERS: { name: string; email: string; role: Role }[] = [
  { name: "Nomvula Assign", email: "assigner@vfsglobal.com", role: "assigner" },
  { name: "T. Matsimela", email: "adjudicator@vfsglobal.com", role: "adjudicator" },
  { name: "K. Ndlovu", email: "supervisor@vfsglobal.com", role: "supervisor" },
  { name: "S. van Wyk", email: "deputydirector@dha.gov.za", role: "deputy_director" },
  { name: "P. Mokoena", email: "director@dha.gov.za", role: "director" },
  { name: "Zanele Dlamini", email: "chiefdirector@dha.gov.za", role: "chief_director" },
  { name: "Admin User", email: "admin@vfsglobal.com", role: "admin" },
];

export default function AdminDashboardPage() {
  const applications = useDemoStore((s) => s.applications);
  const serviceFee = useDemoStore((s) => s.serviceFee);
  const setServiceFee = useDemoStore((s) => s.setServiceFee);
  const [feeInput, setFeeInput] = useState(String(serviceFee));

  const total = applications.length;
  const submitted = applications.filter((a) => a.status === "Submitted").length;
  const pending = applications.filter((a) => a.status === "Pending Applicant Action").length;
  const approved = applications.filter((a) => a.status === "Approved").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;
  const inReview = total - submitted - pending - approved - rejected - applications.filter((a) => a.status === "Draft" || a.status === "Closed").length;

  const byStatus = useMemo(
    () => [
      { name: "Submitted", value: submitted },
      { name: "In Review", value: Math.max(inReview, 0) },
      { name: "Pending", value: pending },
      { name: "Approved", value: approved },
      { name: "Rejected", value: rejected },
    ],
    [submitted, inReview, pending, approved, rejected],
  );

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    applications.forEach((a) => {
      const d = new Date(a.createdAt);
      const key = d.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [applications]);

  return (
    <BackOfficeShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of all overstay appeal applications.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Total" value={total} />
        <StatCard label="Submitted" value={submitted} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Approved" value={approved} tone="text-green-600" />
        <StatCard label="Rejected" value={rejected} tone="text-red-600" />
      </div>

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Applications by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {byStatus.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
              {byStatus.map((s) => (
                <span key={s.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name] }} />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Applications by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#ED6B24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Manage Users (Demo)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_USERS.map((u) => (
                  <tr key={u.email}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{ROLE_LABELS[u.role]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Configure Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Overstay Appeal Service Fee (ZAR)</Label>
              <Input value={feeInput} onChange={(e) => setFeeInput(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
            <Button
              onClick={() => {
                const value = Number(feeInput || 0);
                setServiceFee(value);
                alert(`Service fee updated to ZAR ${value}`);
              }}
            >
              Save Fee
            </Button>
            <p className="text-xs text-gray-400">
              Available adjudicators: {DEMO_ADJUDICATORS.join(", ")}
            </p>
          </CardContent>
        </Card>
      </div>
    </BackOfficeShell>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${tone ?? "text-gray-900"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
