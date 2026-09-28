"use client";

import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { WizardStepper } from "@/components/wizard-stepper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useWizardStore } from "@/lib/wizard-store";

export default function DeclarationStep() {
  const router = useRouter();
  const w = useWizardStore();

  const canContinue = w.declarationChecked && w.signatureName.trim().length > 1;

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
                onChange={(e) => w.update({ declarationChecked: e.target.checked })}
              />
              I declare all information provided is true and correct.
            </label>

            <div>
              <Label>
                Digital Signature <span className="text-red-500">*</span>
              </Label>
              <div className="rounded-md border border-gray-300 bg-gray-50 p-4">
                <Input
                  value={w.signatureName}
                  onChange={(e) => w.update({ signatureName: e.target.value })}
                  placeholder="Type your full name to sign"
                  className="border-none bg-transparent font-[cursive] text-xl italic shadow-none focus-visible:ring-0"
                />
                <div className="mt-2 h-px bg-gray-300" />
                <p className="mt-1 text-xs text-gray-400">Signature box &middot; type your full legal name above</p>
              </div>
            </div>

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
