"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { BackOfficeShell } from "@/components/backoffice/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useDemoStore } from "@/lib/store";
import { getDocumentPublicUrl } from "@/lib/supabase/repo";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { formatDate, formatDateTime, formatZar } from "@/lib/utils";
import { FileText, Download, FileWarning } from "lucide-react";

const STAGE_FOR_ROLE: Partial<Record<Role, string>> = {
  adjudicator: "Adjudicator Review",
  supervisor: "Supervisor Review",
  deputy_director: "Deputy Director Review",
  director: "Director Review",
  chief_director: "Chief Director Review",
};

const MISSING_DOC_OPTIONS = [
  "Updated Form 19",
  "Passport Bio Page",
  "Proof of Medical Emergency",
  "Proof of Residence",
  "Clearer Appeal Letter Scan",
];

function downloadPlaceholder(fileName: string) {
  const blob = new Blob(
    [`This is a mock document generated for the DHA Overstay Appeal prototype.\n\nFile: ${fileName}`],
    { type: "text/plain" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.replace(/\.pdf$/, ".txt");
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReviewWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const role = useDemoStore((s) => s.role);
  const applications = useDemoStore((s) => s.applications);
  const addComment = useDemoStore((s) => s.addComment);
  const advanceApplication = useDemoStore((s) => s.advanceApplication);
  const rejectApplication = useDemoStore((s) => s.rejectApplication);
  const requestDocuments = useDemoStore((s) => s.requestDocuments);

  const [tab, setTab] = useState<"review" | "history">("review");
  const [comment, setComment] = useState("");
  const [missingDoc, setMissingDoc] = useState(MISSING_DOC_OPTIONS[0]);
  const [showRequestDocs, setShowRequestDocs] = useState(false);

  const application = applications.find((a) => a.id === id);

  if (!application) {
    return (
      <BackOfficeShell>
        <p className="text-sm text-gray-500">Application not found.</p>
      </BackOfficeShell>
    );
  }

  const actor = ROLE_LABELS[role];
  const canAct = STAGE_FOR_ROLE[role] === application.status;
  const isAdjudicator = role === "adjudicator";
  const isFinal = role === "chief_director";
  const approveLabel = isFinal ? "Final Approve" : isAdjudicator ? "Recommend Approval" : "Approve";
  const rejectLabel = isFinal ? "Final Reject" : isAdjudicator ? "Recommend Rejection" : "Reject";

  function requireComment() {
    if (!comment.trim()) {
      alert("A comment is required before recording a decision.");
      return false;
    }
    return true;
  }

  return (
    <BackOfficeShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Reference Number: {application.refNumber}</p>
          <h1 className="text-xl font-semibold text-gray-900">
            {application.name} {application.surname}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={application.status} />
          <Button variant="outline" size="sm" onClick={() => router.push("/backoffice/queue")}>
            Back to Queue
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {(["review", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t ? "border-vfs-orange text-vfs-orange" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "review" ? "Detail" : "Event History"}
          </button>
        ))}
      </div>

      {tab === "history" ? (
        <Card>
          <CardContent className="p-0">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Created Date Time</th>
                  <th>Reviewed By</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {[...application.statusHistory].reverse().map((h) => (
                  <tr key={h.id}>
                    <td>{h.status}</td>
                    <td>{formatDateTime(h.createdAt)}</td>
                    <td>{h.changedBy}</td>
                    <td>{h.comments ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr_340px]">
          {/* Document viewer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">All Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <FileWarning className="h-6 w-6 text-red-400" />
                <p className="text-xs font-medium text-red-500">
                  Unable to load the Documents
                  <br />
                  Please download to review it.
                </p>
              </div>
              <ul className="space-y-2">
                {application.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between rounded-md border border-gray-200 p-2.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-gray-800">{doc.fileName}</p>
                        <p className="text-[11px] text-gray-400">
                          {doc.type} &middot; {doc.sizeKb} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const url = doc.storagePath ? getDocumentPublicUrl(doc.storagePath) : null;
                        if (url) window.open(url, "_blank");
                        else downloadPlaceholder(doc.fileName);
                      }}
                      className="text-gray-400 hover:text-vfs-orange"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Application details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Eligibility &amp; Appeal Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Field label="Passport No" value={application.passportNumber} />
              <Field label="Nationality" value={application.nationality} />
              <Field label="Country of Residence" value={application.countryOfResidence} />
              <Field label="Port of Exit" value={application.portOfExit} />
              <Field label="Form 19 Reference" value={application.form19Reference} />
              <Field label="Overstay Reference" value={application.overstayReference} />
              <Field label="Date of Overstay" value={formatDate(application.dateOfOverstay)} />
              <Field label="Appeal Reason" value={application.appealReason} />
              {application.appealReason === "Other" && (
                <Field label="Reason Details" value={application.appealReasonOther ?? "—"} />
              )}
              <Field label="Assigned To" value={application.assignedTo ?? "Unassigned"} />
              <Field label="Service Fee" value={formatZar(application.serviceFee)} />
              <Field label="Payment Status" value={application.paymentStatus} />

              <div className="col-span-2 mt-2 border-t border-gray-100 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Comments</p>
                <div className="space-y-2">
                  {application.comments.length === 0 && <p className="text-xs text-gray-400">No comments yet.</p>}
                  {application.comments.map((c) => (
                    <div key={c.id} className="rounded-md bg-gray-50 p-2.5">
                      <p className="text-xs font-medium text-gray-700">
                        {c.author} &middot; {ROLE_LABELS[c.role]}
                      </p>
                      <p className="text-xs text-gray-600">{c.comment}</p>
                      <p className="text-[10px] text-gray-400">{formatDateTime(c.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Decision Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canAct && (
                <p className="rounded-md bg-gray-50 p-3 text-xs text-gray-500">
                  {role === "assigner" || role === "admin"
                    ? "This role does not perform adjudication decisions."
                    : `No action required. This application is currently at "${application.status}".`}
                </p>
              )}

              {canAct && !showRequestDocs && (
                <>
                  <div>
                    <Label>Comments (mandatory)</Label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter your review comments..."
                      rows={4}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        if (!requireComment()) return;
                        advanceApplication(application.id, comment, actor, role);
                        setComment("");
                        router.push("/backoffice/queue");
                      }}
                    >
                      {approveLabel}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (!requireComment()) return;
                        rejectApplication(application.id, comment, actor, role);
                        setComment("");
                        router.push("/backoffice/queue");
                      }}
                    >
                      {rejectLabel}
                    </Button>
                    <Button variant="outline" onClick={() => setShowRequestDocs(true)}>
                      Request Additional Documents
                    </Button>
                  </div>
                </>
              )}

              {canAct && showRequestDocs && (
                <>
                  <div>
                    <Label>Missing Document Type</Label>
                    <Select value={missingDoc} onChange={(e) => setMissingDoc(e.target.value)}>
                      {MISSING_DOC_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Comments (mandatory)</Label>
                    <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowRequestDocs(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!requireComment()) return;
                        requestDocuments(application.id, missingDoc, comment, actor, role);
                        setComment("");
                        setShowRequestDocs(false);
                        router.push("/backoffice/queue");
                      }}
                    >
                      Send Request
                    </Button>
                  </div>
                </>
              )}

              <div className="border-t border-gray-100 pt-3">
                <Label>Add a comment only</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="note-only"
                    rows={2}
                    placeholder="Leave a note without changing status"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const value = (e.target as HTMLTextAreaElement).value.trim();
                        if (value) {
                          addComment(application.id, actor, role, value);
                          (e.target as HTMLTextAreaElement).value = "";
                        }
                      }
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">Press Enter to add note</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </BackOfficeShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}
