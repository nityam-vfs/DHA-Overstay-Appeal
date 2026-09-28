import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/lib/types";

const STATUS_VARIANT: Record<ApplicationStatus, "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "outline" | "orange"> = {
  Draft: "outline",
  Submitted: "info",
  Assigned: "secondary",
  "Adjudicator Review": "orange",
  "Supervisor Review": "orange",
  "Deputy Director Review": "orange",
  "Director Review": "orange",
  "Chief Director Review": "orange",
  "Pending Applicant Action": "warning",
  Approved: "success",
  Rejected: "destructive",
  Closed: "secondary",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge>;
}
