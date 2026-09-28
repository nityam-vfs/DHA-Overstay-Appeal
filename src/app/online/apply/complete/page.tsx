"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useWizardStore } from "@/lib/wizard-store";
import { CheckCircle2 } from "lucide-react";

export default function SubmissionCompletePage() {
  const router = useRouter();
  const w = useWizardStore();

  useEffect(() => {
    if (!w.submittedRefNumber) {
      router.replace("/online/apply/eligibility");
    }
  }, [w.submittedRefNumber, router]);

  if (!w.submittedRefNumber) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <VfsHeader />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Application Submitted Successfully</h1>
            <p className="text-sm text-gray-500">Your overstay appeal reference number is</p>
            <p className="text-2xl font-bold tracking-wide text-vfs-orange">{w.submittedRefNumber}</p>
            <StatusBadge status="Submitted" />
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const id = w.submittedApplicationId;
                  w.reset();
                  router.push(id ? `/online/applications/${id}` : "/online/dashboard");
                }}
              >
                View Application
              </Button>
              <Button
                onClick={() => {
                  w.reset();
                  router.push("/online/dashboard");
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
