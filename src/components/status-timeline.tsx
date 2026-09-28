import { STATUS_FLOW, type Application } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Check, Clock, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DISPLAY_STEPS = [...STATUS_FLOW, "Decision Issued"];

export function StatusTimeline({ application }: { application: Application }) {
  const { status, statusHistory } = application;
  const isRejected = status === "Rejected";
  const isApproved = status === "Approved" || status === "Closed";
  const isPending = status === "Pending Applicant Action";

  const currentFlowIndex = isRejected || isApproved
    ? STATUS_FLOW.length
    : isPending
      ? STATUS_FLOW.indexOf(
          [...statusHistory].reverse().find((h) => STATUS_FLOW.includes(h.status))?.status ?? "Submitted",
        )
      : STATUS_FLOW.indexOf(status);

  return (
    <ol className="relative border-l border-gray-200 pl-6">
      {DISPLAY_STEPS.map((step, idx) => {
        const isDecisionStep = step === "Decision Issued";
        const done = isDecisionStep ? isApproved || isRejected : idx < currentFlowIndex;
        const current = isDecisionStep
          ? false
          : idx === currentFlowIndex && !isApproved && !isRejected;
        const historyEntry = statusHistory.find((h) => h.status === step);

        let icon = <Clock className="h-3.5 w-3.5 text-gray-400" />;
        let dotClass = "bg-gray-100 border-gray-300";
        if (done) {
          icon = <Check className="h-3.5 w-3.5 text-white" />;
          dotClass = "bg-green-600 border-green-600";
        } else if (current) {
          icon = <Clock className="h-3.5 w-3.5 text-white" />;
          dotClass = "bg-vfs-orange border-vfs-orange";
        }
        if (isDecisionStep && isRejected) {
          icon = <X className="h-3.5 w-3.5 text-white" />;
          dotClass = "bg-red-600 border-red-600";
        }

        return (
          <li key={step} className="mb-6 ml-4 last:mb-0">
            <span
              className={cn(
                "absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border",
                dotClass,
              )}
            >
              {icon}
            </span>
            <p className={cn("text-sm font-medium", done || current ? "text-gray-900" : "text-gray-400")}>
              {isDecisionStep && isRejected ? "Rejected" : step}
            </p>
            {historyEntry && (
              <p className="text-xs text-gray-400">{formatDateTime(historyEntry.createdAt)}</p>
            )}
          </li>
        );
      })}
      {isPending && (
        <li className="mb-0 ml-4 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4" /> Pending Applicant Action
          </p>
          <p className="mt-1 text-xs text-amber-700">
            {application.documentRequests.find((r) => !r.fulfilled)?.comments}
          </p>
        </li>
      )}
    </ol>
  );
}
