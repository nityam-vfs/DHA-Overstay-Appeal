"use client";

import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { WizardStepper } from "@/components/wizard-stepper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWizardStore } from "@/lib/wizard-store";
import { APPEAL_REASONS } from "@/lib/types";

export default function AppealDetailsStep() {
  const router = useRouter();
  const w = useWizardStore();

  const canContinue =
    w.overstayReference &&
    w.dateOfOverstay &&
    w.appealReason &&
    w.appealReasonOther.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <VfsHeader />
      <WizardStepper current={2} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Appeal Details</h1>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>
                  Overstay Reference Number <span className="text-red-500">*</span>
                </Label>
                <Input value={w.overstayReference} onChange={(e) => w.update({ overstayReference: e.target.value })} />
              </div>
              <div>
                <Label>
                  Date of Port Exit <span className="text-red-500">*</span>
                </Label>
                <Input type="date" value={w.dateOfOverstay} onChange={(e) => w.update({ dateOfOverstay: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>
                  Appeal Reason <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={w.appealReason}
                  onChange={(e) => w.update({ appealReason: e.target.value as typeof w.appealReason })}
                >
                  <option value="">Select a reason</option>
                  {APPEAL_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </div>
              {w.appealReason && (
                <div className="sm:col-span-2">
                  <Label>
                    Please describe your reason <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={w.appealReasonOther}
                    onChange={(e) => w.update({ appealReasonOther: e.target.value })}
                    rows={4}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => router.push("/online/apply/eligibility")}>
                Back
              </Button>
              <Button disabled={!canContinue} onClick={() => router.push("/online/apply/documents")}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
