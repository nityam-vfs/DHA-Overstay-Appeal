export type Role =
  | "applicant"
  | "assigner"
  | "adjudicator"
  | "supervisor"
  | "deputy_director"
  | "director"
  | "chief_director"
  | "admin";

export const ROLE_LABELS: Record<Role, string> = {
  applicant: "Applicant",
  assigner: "Assigner",
  adjudicator: "Adjudicator",
  supervisor: "Supervisor",
  deputy_director: "Deputy Director",
  director: "Director",
  chief_director: "Chief Director",
  admin: "VFS Admin",
};

export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Assigned"
  | "Adjudicator Review"
  | "Supervisor Review"
  | "Deputy Director Review"
  | "Director Review"
  | "Chief Director Review"
  | "Pending Applicant Action"
  | "Approved"
  | "Rejected"
  | "Closed";

export const STATUS_FLOW: ApplicationStatus[] = [
  "Submitted",
  "Assigned",
  "Adjudicator Review",
  "Supervisor Review",
  "Deputy Director Review",
  "Director Review",
  "Chief Director Review",
];

export const APPEAL_REASONS = [
  "Humanitarian Grounds",
  "Medical Emergency",
  "Administrative Error",
  "Family Circumstances",
  "Other",
] as const;

export type AppealReason = (typeof APPEAL_REASONS)[number];

export interface AppDocument {
  id: string;
  applicationId: string;
  type: "Appeal Letter" | "Form 19" | "Supporting Document";
  fileName: string;
  uploadedAt: string;
  sizeKb: number;
  storagePath?: string;
}

export interface StatusHistoryEntry {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  changedBy: string;
  role: Role | "system";
  comments?: string;
  createdAt: string;
}

export interface CommentEntry {
  id: string;
  applicationId: string;
  author: string;
  role: Role;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  applicationId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DecisionLetter {
  id: string;
  applicationId: string;
  type: "Approval" | "Rejection";
  refNumber: string;
  createdAt: string;
}

export interface DocumentRequest {
  missingDocumentType: string;
  comments: string;
  requestedAt: string;
  returnStage: ApplicationStatus;
  fulfilled: boolean;
}

export interface Application {
  id: string;
  refNumber: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;

  // Eligibility
  name: string;
  surname: string;
  passportNumber: string;
  nationality: string;
  countryOfResidence: string;
  portOfExit: string;
  form19Reference: string;

  // Appeal details
  overstayReference: string;
  dateOfOverstay: string;
  appealReason: AppealReason;
  appealReasonOther?: string;

  // Declaration
  declarationSigned: boolean;
  signatureName?: string;

  // Payment
  paymentStatus: "Pending" | "Paid";
  serviceFee: number;

  // Ownership / assignment
  applicantEmail: string;
  assignedTo?: string;

  documents: AppDocument[];
  statusHistory: StatusHistoryEntry[];
  comments: CommentEntry[];
  documentRequests: DocumentRequest[];
}

export const DEMO_APPLICANT_EMAIL = "applicant@demo.dha.gov.za";

export const DEMO_ADJUDICATORS = [
  "T. Matsimela",
  "K. Ndlovu",
  "S. van Wyk",
  "P. Mokoena",
];

export const NATIONALITIES = [
  "Zimbabwean",
  "Nigerian",
  "Congolese (DRC)",
  "Malawian",
  "Mozambican",
  "Indian",
  "Chinese",
  "Pakistani",
  "Ethiopian",
  "Somali",
];

export const PORTS_OF_EXIT = [
  "OR Tambo International",
  "Cape Town International",
  "Beitbridge Border Post",
  "King Shaka International",
  "Lebombo Border Post",
];
