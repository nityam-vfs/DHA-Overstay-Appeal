"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { SaFlagMark } from "@/components/sa-flag-mark";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Printer } from "lucide-react";

export default function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const applications = useDemoStore((s) => s.applications);
  const letters = useDemoStore((s) => s.letters);

  const application = applications.find((a) => a.id === id);
  const letter = letters.find((l) => l.applicationId === id);

  if (!application || !letter) {
    return <p className="p-8 text-sm text-gray-500">Letter not found.</p>;
  }

  const isApproval = letter.type === "Approval";

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between px-4">
        <Button variant="outline" onClick={() => router.back()}>
          &larr; Back
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      <div className="mx-auto max-w-3xl bg-white p-12 shadow-sm">
        <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <SaFlagMark />
            <div>
              <p className="text-sm font-semibold text-gray-900">Department of Home Affairs</p>
              <p className="text-xs text-gray-500">Republic of South Africa &middot; Immigration Services</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">{letter.refNumber}</p>
        </div>

        <p className="mb-6 text-sm text-gray-600">{formatDate(letter.createdAt)}</p>

        <p className="mb-1 text-sm text-gray-800">
          {application.name} {application.surname}
        </p>
        <p className="mb-6 text-sm text-gray-800">Passport No: {application.passportNumber}</p>

        <p className="mb-4 text-sm font-semibold text-gray-900">
          RE: OVERSTAY APPEAL {isApproval ? "APPROVAL" : "REJECTION"} &mdash; {application.refNumber}
        </p>

        {isApproval ? (
          <div className="space-y-3 text-sm leading-relaxed text-gray-700">
            <p>Dear {application.name},</p>
            <p>
              We refer to your overstay appeal submitted under reference {application.refNumber} regarding overstay
              reference {application.overstayReference}.
            </p>
            <p>
              After careful review by the Department of Home Affairs adjudication panel, your appeal has been{" "}
              <strong>approved</strong>. This letter serves as official confirmation that the overstay recorded
              against your passport has been resolved in your favour.
            </p>
            <p>Please retain this letter for your records and present it if requested at any port of entry or exit.</p>
            <p>Yours faithfully,</p>
          </div>
        ) : (
          <div className="space-y-3 text-sm leading-relaxed text-gray-700">
            <p>Dear {application.name},</p>
            <p>
              We refer to your overstay appeal submitted under reference {application.refNumber} regarding overstay
              reference {application.overstayReference}.
            </p>
            <p>
              After careful review by the Department of Home Affairs adjudication panel, your appeal has been{" "}
              <strong>rejected</strong> for the following reason(s): the information and/or documentation submitted
              did not sufficiently substantiate the grounds for appeal under &ldquo;{application.appealReason}&rdquo;.
            </p>
            <p>
              Should you wish to submit further representations, you may do so through the appropriate DHA channels.
            </p>
            <p>Yours faithfully,</p>
          </div>
        )}

        <div className="mt-10">
          <p className="text-sm font-semibold text-gray-900">Chief Director: Immigration Services</p>
          <p className="text-xs text-gray-500">Department of Home Affairs</p>
        </div>

        <p className="mt-12 text-center text-[10px] text-gray-400">
          This is a system-generated prototype letter for demonstration purposes only.
        </p>
      </div>
    </div>
  );
}
