import { cn } from "@/lib/utils";

const STEPS = ["Eligibility Criteria", "Appeal Details", "Document Upload", "Declaration", "Payment"];

export function WizardStepper({ current }: { current: number }) {
  return (
    <div className="flex flex-wrap gap-6 border-b border-gray-200 bg-white px-6 py-3">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const active = stepNum === current;
        const done = stepNum < current;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-medium",
                active
                  ? "border-vfs-orange bg-vfs-orange text-white"
                  : done
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-300 text-gray-400",
              )}
            >
              {stepNum}
            </span>
            <span className={cn("text-sm", active ? "font-semibold text-gray-900" : "text-gray-400")}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
