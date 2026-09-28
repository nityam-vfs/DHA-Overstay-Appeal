"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { useDemoStore } from "@/lib/store";
import { uploadDocumentFile } from "@/lib/supabase/repo";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate, formatDateTime, formatZar } from "@/lib/utils";
import { FileText, UploadCloud, Download, Loader2 } from "lucide-react";

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const applications = useDemoStore((s) => s.applications);
  const letters = useDemoStore((s) => s.letters);
  const fulfillDocumentRequest = useDemoStore((s) => s.fulfillDocumentRequest);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const application = applications.find((a) => a.id === id);
  const letter = letters.find((l) => l.applicationId === id);

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <VfsHeader />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-sm text-gray-500">Application not found.</p>
        </main>
      </div>
    );
  }

  const pendingRequest = application.documentRequests.find((r) => !r.fulfilled);

  return (
    <div className="min-h-screen bg-gray-50">
      <VfsHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <button onClick={() => router.push("/online/dashboard")} className="mb-4 text-sm text-vfs-link">
          &larr; Back to Dashboard
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">Reference Number</p>
            <h1 className="text-xl font-semibold text-gray-900">{application.refNumber}</h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={application.status} />
            {letter && (
              <Link href={`/online/letters/${application.id}`}>
                <Button size="sm">
                  <Download className="h-4 w-4" /> Download Letter
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Field label="Applicant" value={`${application.name} ${application.surname}`} />
                <Field label="Passport Number" value={application.passportNumber} />
                <Field label="Nationality" value={application.nationality} />
                <Field label="Port of Exit" value={application.portOfExit} />
                <Field label="Overstay Reference" value={application.overstayReference} />
                <Field label="Date of Port Exit" value={formatDate(application.dateOfOverstay)} />
                <Field label="Appeal Reason" value={application.appealReason} />
                <Field label="Service Fee" value={`${formatZar(application.serviceFee)} (${application.paymentStatus})`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-md border border-gray-200 p-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{doc.fileName}</p>
                        <p className="text-xs text-gray-400">
                          {doc.type} &middot; uploaded {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingRequest && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      Additional document requested: {pendingRequest.missingDocumentType}
                    </p>
                    <p className="mt-1 text-xs text-amber-700">{pendingRequest.comments}</p>
                    <div className="mt-3">
                      <button
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        {uploading ? "Uploading..." : "Re-upload Document"}
                      </button>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (!file) return;
                          setUploading(true);
                          try {
                            const storagePath = isSupabaseConfigured() ? (await uploadDocumentFile(file, application.id)) ?? undefined : undefined;
                            fulfillDocumentRequest(application.id, file.name, storagePath);
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {application.comments.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
                {application.comments.map((c) => (
                  <div key={c.id} className="rounded-md bg-gray-50 p-2.5">
                    <p className="text-xs font-medium text-gray-700">{c.author}</p>
                    <p className="text-sm text-gray-600">{c.comment}</p>
                    <p className="text-[10px] text-gray-400">{formatDateTime(c.createdAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline application={application} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
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
