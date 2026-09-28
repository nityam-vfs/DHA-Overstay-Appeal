"use client";

import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { WizardStepper } from "@/components/wizard-stepper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useWizardStore } from "@/lib/wizard-store";

export default function DeclarationStep() {
  const router = useRouter();
  const w = useWizardStore();

  const canContinue = w.declarationChecked;

  return (
    <div className="min-h-screen bg-gray-50">
      <VfsHeader />
      <WizardStepper current={4} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="space-y-5 p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Declaration</h1>

            <label className="flex items-start gap-2 text-sm text-gray-700">
              <Checkbox
                className="mt-0.5"
                checked={w.declarationChecked}
                onChange={(e) =>
                  w.update({
                    declarationChecked: e.target.checked,
                    signatureName: `${w.name} ${w.surname}`.trim(),
                  })
                }
              />
              I declare all information provided is true and correct.
            </label>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => router.push("/online/apply/documents")}>
                Back
              </Button>
              <Button disabled={!canContinue} onClick={() => router.push("/online/apply/payment")}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

