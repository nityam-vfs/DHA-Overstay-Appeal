"use client";

import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { WizardStepper } from "@/components/wizard-stepper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useWizardStore } from "@/lib/wizard-store";
import { NATIONALITIES, PORTS_OF_EXIT } from "@/lib/types";

export default function EligibilityStep() {
  const router = useRouter();
  const w = useWizardStore();

  const canContinue =
    w.name && w.surname && w.passportNumber && w.nationality && w.portOfExit && w.form19Reference && w.eligibilityConfirmed;

  return (
    <div className="min-h-screen bg-gray-50">
      <VfsHeader />
      <WizardStepper current={1} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Eligibility Criteria</h1>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input value={w.name} onChange={(e) => w.update({ name: e.target.value })} />
              </div>
              <div>
                <Label>
                  Surname <span className="text-red-500">*</span>
                </Label>
                <Input value={w.surname} onChange={(e) => w.update({ surname: e.target.value })} />
              </div>
              <div>
                <Label>
                  Passport Number <span className="text-red-500">*</span>
                </Label>
                <Input value={w.passportNumber} onChange={(e) => w.update({ passportNumber: e.target.value })} />
              </div>
              <div>
                <Label>
                  Nationality <span className="text-red-500">*</span>
                </Label>
                <Select value={w.nationality} onChange={(e) => w.update({ nationality: e.target.value })}>
                  <option value="">Select nationality</option>
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>
                  Country of Residence <span className="text-red-500">*</span>
                </Label>
                <Input value={w.countryOfResidence} onChange={(e) => w.update({ countryOfResidence: e.target.value })} />
              </div>
              <div>
                <Label>
                  Port of Exit <span className="text-red-500">*</span>
                </Label>
                <Select value={w.portOfExit} onChange={(e) => w.update({ portOfExit: e.target.value })}>
                  <option value="">Select port of exit</option>
                  {PORTS_OF_EXIT.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>
                  Form 19 Reference Number <span className="text-red-500">*</span>
                </Label>
                <Input value={w.form19Reference} onChange={(e) => w.update({ form19Reference: e.target.value })} />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2 text-sm text-gray-700">
              <Checkbox checked={w.eligibilityConfirmed} onChange={(e) => w.update({ eligibilityConfirmed: e.target.checked })} />
              I confirm the information provided is correct
            </label>

            <div className="flex justify-end pt-2">
              <Button disabled={!canContinue} onClick={() => router.push("/online/apply/appeal-details")}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
