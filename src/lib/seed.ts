import {
  APPEAL_REASONS,
  type AppDocument,
  type Application,
  type ApplicationStatus,
  type CommentEntry,
  type DocumentRequest,
  DEMO_ADJUDICATORS,
  DEMO_APPLICANT_EMAIL,
  NATIONALITIES,
  PORTS_OF_EXIT,
  type StatusHistoryEntry,
} from "./types";

// Deterministic PRNG so seeded data is stable across renders (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260928);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

const FIRST_NAMES = [
  "Bonface", "Anita", "Christina", "Nashe", "Hareesa", "Ivy", "Mandela", "Prudence",
  "Thabo", "Zanele", "Farai", "Chidi", "Amara", "Tendai", "Kagiso", "Lerato",
  "Blessing", "Grace", "Emmanuel", "Nomvula", "Simba", "Rutendo", "Ngozi", "Tapiwa",
];
const LAST_NAMES = [
  "Gasva", "Milambu", "Gwaremba", "Kativu", "Ndlovu", "Gusha", "Ncube", "Mabenge",
  "Sithole", "Dlamini", "Chikwanha", "Okafor", "Moyo", "Banda", "Mahlangu", "Zulu",
];

function randomDateWithinDays(daysBack: number) {
  const now = new Date("2026-09-28T09:00:00Z").getTime();
  const past = now - randInt(0, daysBack) * 24 * 60 * 60 * 1000 - randInt(0, 86400) * 1000;
  return new Date(past).toISOString();
}

function makeDocs(applicationId: string, createdAt: string): AppDocument[] {
  const docs: AppDocument[] = [
    {
      id: `${applicationId}-doc-appeal`,
      applicationId,
      type: "Appeal Letter",
      fileName: "appeal-letter.pdf",
      uploadedAt: createdAt,
      sizeKb: randInt(120, 480),
    },
    {
      id: `${applicationId}-doc-form19`,
      applicationId,
      type: "Form 19",
      fileName: "form-19.pdf",
      uploadedAt: createdAt,
      sizeKb: randInt(80, 260),
    },
  ];
  if (rand() > 0.4) {
    docs.push({
      id: `${applicationId}-doc-support`,
      applicationId,
      type: "Supporting Document",
      fileName: "supporting-evidence.pdf",
      uploadedAt: createdAt,
      sizeKb: randInt(60, 900),
    });
  }
  return docs;
}

function buildHistory(
  applicationId: string,
  createdAt: string,
  path: ApplicationStatus[],
): StatusHistoryEntry[] {
  let t = new Date(createdAt).getTime();
  return path.map((status, idx) => {
    t += randInt(1, 3) * 24 * 60 * 60 * 1000;
    return {
      id: `${applicationId}-hist-${idx}`,
      applicationId,
      status,
      changedBy: idx === 0 ? "Applicant" : "System",
      role: idx === 0 ? "applicant" : "system",
      comments: idx === 0 ? "Application submitted online" : undefined,
      createdAt: new Date(t).toISOString(),
    } as StatusHistoryEntry;
  });
}

function statusPath(finalStatus: ApplicationStatus): ApplicationStatus[] {
  const order: ApplicationStatus[] = [
    "Submitted",
    "Assigned",
    "Adjudicator Review",
    "Supervisor Review",
    "Deputy Director Review",
    "Director Review",
    "Chief Director Review",
  ];
  if (finalStatus === "Approved" || finalStatus === "Rejected" || finalStatus === "Closed") {
    return [...order, finalStatus];
  }
  if (finalStatus === "Pending Applicant Action") {
    const cut = order.slice(0, randInt(2, 5));
    return [...cut, finalStatus];
  }
  const idx = order.indexOf(finalStatus);
  return order.slice(0, idx + 1);
}

const STATUS_WEIGHTS: [ApplicationStatus, number][] = [
  ["Submitted", 6],
  ["Assigned", 5],
  ["Adjudicator Review", 8],
  ["Supervisor Review", 5],
  ["Deputy Director Review", 4],
  ["Director Review", 3],
  ["Chief Director Review", 3],
  ["Pending Applicant Action", 6],
  ["Approved", 12],
  ["Rejected", 7],
  ["Closed", 1],
];

function weightedStatus(): ApplicationStatus {
  const total = STATUS_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [status, w] of STATUS_WEIGHTS) {
    if (r < w) return status;
    r -= w;
  }
  return "Submitted";
}

function buildApplication(index: number, forceEmail?: string, forceStatus?: ApplicationStatus): Application {
  const id = `app-${index.toString().padStart(4, "0")}`;
  const refNumber = `OVA-2026-${(1000 + index).toString()}`;
  const name = pick(FIRST_NAMES);
  const surname = pick(LAST_NAMES);
  const createdAt = randomDateWithinDays(90);
  const status = forceStatus ?? weightedStatus();
  const history = buildHistory(id, createdAt, statusPath(status));
  const updatedAt = history[history.length - 1]?.createdAt ?? createdAt;
  const reason = pick(APPEAL_REASONS);

  const comments: CommentEntry[] = [];
  if (["Adjudicator Review", "Supervisor Review", "Director Review", "Approved", "Rejected"].includes(status) && rand() > 0.3) {
    comments.push({
      id: `${id}-c1`,
      applicationId: id,
      author: "T. Matsimela",
      role: "adjudicator",
      comment: "Documents reviewed. Appeal letter is consistent with Form 19 details.",
      createdAt: updatedAt,
    });
  }

  const documentRequests: DocumentRequest[] = [];
  if (status === "Pending Applicant Action") {
    documentRequests.push({
      missingDocumentType: pick(["Proof of Medical Emergency", "Updated Form 19", "Passport Bio Page", "Proof of Residence"]),
      comments: "Please upload a clearer copy of the requested document to proceed with the review.",
      requestedAt: updatedAt,
      returnStage: history[history.length - 2]?.status ?? "Adjudicator Review",
      fulfilled: false,
    });
  }

  return {
    id,
    refNumber,
    status,
    createdAt,
    updatedAt,
    name,
    surname,
    passportNumber: `P${randInt(1000000, 9999999)}`,
    nationality: pick(NATIONALITIES),
    countryOfResidence: "South Africa",
    portOfExit: pick(PORTS_OF_EXIT),
    form19Reference: `F19-${randInt(100000, 999999)}`,
    overstayReference: `OVR-${randInt(10000, 99999)}`,
    dateOfOverstay: randomDateWithinDays(180),
    appealReason: reason,
    appealReasonOther: reason === "Other" ? "Delayed flight caused unavoidable overstay." : undefined,
    declarationSigned: status !== "Draft",
    signatureName: status !== "Draft" ? `${name} ${surname}` : undefined,
    paymentStatus: status === "Draft" ? "Pending" : "Paid",
    serviceFee: 1500,
    applicantEmail: forceEmail ?? `${name.toLowerCase()}.${surname.toLowerCase()}@example.com`,
    assignedTo: status === "Submitted" || status === "Draft" ? undefined : pick(DEMO_ADJUDICATORS),
    documents: makeDocs(id, createdAt),
    statusHistory: history,
    comments,
    documentRequests,
  };
}

export function generateSeedApplications(): Application[] {
  const apps: Application[] = [];

  // Demo applicant's own applications - curated to showcase every stage
  const demoStatuses: ApplicationStatus[] = [
    "Submitted",
    "Adjudicator Review",
    "Pending Applicant Action",
    "Chief Director Review",
    "Approved",
    "Rejected",
  ];
  demoStatuses.forEach((status, i) => {
    apps.push(buildApplication(i + 1, DEMO_APPLICANT_EMAIL, status));
  });

  // Bulk seeded applications for back-office queues/analytics
  for (let i = demoStatuses.length + 1; i <= 50; i++) {
    apps.push(buildApplication(i));
  }

  return apps;
}
