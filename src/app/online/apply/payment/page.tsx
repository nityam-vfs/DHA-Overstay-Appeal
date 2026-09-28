"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { WizardStepper } from "@/components/wizard-stepper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/lib/wizard-store";
import { useDemoStore } from "@/lib/store";
import { formatZar } from "@/lib/utils";
import { APPEAL_REASONS } from "@/lib/types";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function PaymentStep() {
  const router = useRouter();
  const w = useWizardStore();
  const serviceFee = useDemoStore((s) => s.serviceFee);
  const createApplication = useDemoStore((s) => s.createApplication);
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  function handlePay() {
    setStatus("processing");
    setTimeout(() => {
      const id = createApplication({
        id: w.draftId,
        name: w.name,
        surname: w.surname,
        passportNumber: w.passportNumber,
        nationality: w.nationality,
        countryOfResidence: w.countryOfResidence,
        portOfExit: w.portOfExit,
        form19Reference: w.form19Reference,
        overstayReference: w.overstayReference,
        dateOfOverstay: w.dateOfOverstay,
        appealReason: w.appealReason || APPEAL_REASONS[0],
        appealReasonOther: w.appealReasonOther,
        signatureName: w.signatureName,
        documents: [
          ...(w.appealLetter ? [{ type: "Appeal Letter" as const, ...w.appealLetter }] : []),
          ...(w.form19 ? [{ type: "Form 19" as const, ...w.form19 }] : []),
          ...w.supportingDocuments.map((d) => ({ type: "Supporting Document" as const, ...d })),
        ],
      });
      const app = useDemoStore.getState().applications.find((a) => a.id === id);
      w.update({ paid: true, submittedApplicationId: id, submittedRefNumber: app?.refNumber });
      setStatus("success");
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VfsHeader />
      <WizardStepper current={5} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="space-y-6 p-6">
            {status !== "success" ? (
              <>
                <h1 className="text-2xl font-semibold text-gray-900">Payment</h1>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Overstay Appeal Service Fee</span>
                    <span className="font-semibold text-gray-900">{formatZar(serviceFee)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  This is a mock payment screen for prototype purposes. No real payment gateway is used.
                </p>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => router.push("/online/apply/declaration")} disabled={status === "processing"}>
                    Cancel
                  </Button>
                  <Button onClick={handlePay} disabled={status === "processing"}>
                    {status === "processing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      "Pay Now"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Successful</h2>
                <p className="text-sm text-gray-500">Your payment of {formatZar(serviceFee)} has been processed.</p>
                <Button onClick={() => router.push("/online/apply/complete")}>Continue</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
