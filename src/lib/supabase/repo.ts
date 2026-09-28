import { getSupabaseClient, STORAGE_BUCKET } from "./client";
import type {
  AppDocument,
  Application,
  ApplicationStatus,
  CommentEntry,
  DecisionLetter,
  DocumentRequest,
  Notification,
  Role,
  StatusHistoryEntry,
} from "../types";

const APPLICATION_SELECT = `
  *,
  application_documents(*),
  application_comments(*),
  application_status_history(*),
  application_document_requests(*)
`;

interface DocumentRow {
  id: string;
  application_id: string;
  type: AppDocument["type"];
  file_name: string;
  storage_path: string | null;
  size_kb: number;
  uploaded_at: string;
}
interface CommentRow {
  id: string;
  application_id: string;
  author: string;
  role: Role;
  comment: string;
  created_at: string;
}
interface HistoryRow {
  id: string;
  application_id: string;
  status: ApplicationStatus;
  changed_by: string;
  role: Role | "system";
  comments: string | null;
  created_at: string;
}
interface DocRequestRow {
  id: string;
  application_id: string;
  missing_document_type: string;
  comments: string | null;
  requested_at: string;
  return_stage: ApplicationStatus;
  fulfilled: boolean;
}
interface ApplicationRow {
  id: string;
  ref_number: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  name: string;
  surname: string;
  passport_number: string;
  nationality: string | null;
  country_of_residence: string | null;
  port_of_exit: string | null;
  form19_reference: string | null;
  overstay_reference: string | null;
  date_of_overstay: string | null;
  appeal_reason: Application["appealReason"] | null;
  appeal_reason_other: string | null;
  declaration_signed: boolean;
  signature_name: string | null;
  payment_status: "Pending" | "Paid";
  service_fee: number;
  applicant_email: string;
  assigned_to: string | null;
  application_documents: DocumentRow[] | null;
  application_comments: CommentRow[] | null;
  application_status_history: HistoryRow[] | null;
  application_document_requests: DocRequestRow[] | null;
}
interface NotificationRow {
  id: string;
  application_id: string;
  message: string;
  read: boolean;
  created_at: string;
}
interface LetterRow {
  id: string;
  application_id: string;
  type: "Approval" | "Rejection";
  ref_number: string;
  storage_path: string | null;
  created_at: string;
}

function mapDocument(row: DocumentRow): AppDocument {
  return {
    id: row.id,
    applicationId: row.application_id,
    type: row.type,
    fileName: row.file_name,
    uploadedAt: row.uploaded_at,
    sizeKb: row.size_kb,
    storagePath: row.storage_path ?? undefined,
  };
}

function mapComment(row: CommentRow): CommentEntry {
  return {
    id: row.id,
    applicationId: row.application_id,
    author: row.author,
    role: row.role,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

function mapHistory(row: HistoryRow): StatusHistoryEntry {
  return {
    id: row.id,
    applicationId: row.application_id,
    status: row.status,
    changedBy: row.changed_by,
    role: row.role,
    comments: row.comments ?? undefined,
    createdAt: row.created_at,
  };
}

function mapDocRequest(row: DocRequestRow): DocumentRequest {
  return {
    missingDocumentType: row.missing_document_type,
    comments: row.comments ?? "",
    requestedAt: row.requested_at,
    returnStage: row.return_stage,
    fulfilled: row.fulfilled,
  };
}

function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    refNumber: row.ref_number,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.name,
    surname: row.surname,
    passportNumber: row.passport_number,
    nationality: row.nationality ?? "",
    countryOfResidence: row.country_of_residence ?? "",
    portOfExit: row.port_of_exit ?? "",
    form19Reference: row.form19_reference ?? "",
    overstayReference: row.overstay_reference ?? "",
    dateOfOverstay: row.date_of_overstay ?? "",
    appealReason: row.appeal_reason ?? "Other",
    appealReasonOther: row.appeal_reason_other ?? undefined,
    declarationSigned: row.declaration_signed,
    signatureName: row.signature_name ?? undefined,
    paymentStatus: row.payment_status,
    serviceFee: Number(row.service_fee),
    applicantEmail: row.applicant_email,
    assignedTo: row.assigned_to ?? undefined,
    documents: (row.application_documents ?? []).map(mapDocument),
    statusHistory: (row.application_status_history ?? []).map(mapHistory).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    comments: (row.application_comments ?? []).map(mapComment).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    documentRequests: (row.application_document_requests ?? []).map(mapDocRequest),
  };
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    applicationId: row.application_id,
    message: row.message,
    createdAt: row.created_at,
    read: row.read,
  };
}

function mapLetter(row: LetterRow): DecisionLetter {
  return {
    id: row.id,
    applicationId: row.application_id,
    type: row.type,
    refNumber: row.ref_number,
    createdAt: row.created_at,
  };
}

/** Fetches all applications (with nested docs/comments/history/requests). Returns null if Supabase isn't configured or the request fails. */
export async function fetchApplications(): Promise<Application[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.from("applications").select(APPLICATION_SELECT).order("created_at", { ascending: false });
  if (error) {
    console.warn("[supabase] fetchApplications failed, falling back to demo data:", error.message);
    return null;
  }
  return (data as unknown as ApplicationRow[]).map(mapApplication);
}

export async function fetchNotifications(): Promise<Notification[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.from("notifications").select("*").order("created_at", { ascending: true });
  if (error) return null;
  return (data as NotificationRow[]).map(mapNotification);
}

export async function fetchLetters(): Promise<DecisionLetter[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.from("decision_letters").select("*").order("created_at", { ascending: true });
  if (error) return null;
  return (data as LetterRow[]).map(mapLetter);
}

function toApplicationRow(app: Application) {
  return {
    id: app.id,
    ref_number: app.refNumber,
    status: app.status,
    created_at: app.createdAt,
    updated_at: app.updatedAt,
    name: app.name,
    surname: app.surname,
    passport_number: app.passportNumber,
    nationality: app.nationality,
    country_of_residence: app.countryOfResidence,
    port_of_exit: app.portOfExit,
    form19_reference: app.form19Reference,
    overstay_reference: app.overstayReference,
    date_of_overstay: app.dateOfOverstay || null,
    appeal_reason: app.appealReason,
    appeal_reason_other: app.appealReasonOther ?? null,
    declaration_signed: app.declarationSigned,
    signature_name: app.signatureName ?? null,
    payment_status: app.paymentStatus,
    service_fee: app.serviceFee,
    applicant_email: app.applicantEmail,
    assigned_to: app.assignedTo ?? null,
  };
}

/** Best-effort write-through helpers. Silently no-op when Supabase isn't configured; log (don't throw) on failure. */
export async function dbCreateApplication(app: Application) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { error: appError } = await client.from("applications").insert(toApplicationRow(app));
    if (appError) throw appError;

    if (app.documents.length) {
      const { error } = await client.from("application_documents").insert(
        app.documents.map((d) => ({
          id: d.id,
          application_id: app.id,
          type: d.type,
          file_name: d.fileName,
          storage_path: d.storagePath ?? null,
          size_kb: d.sizeKb,
          uploaded_at: d.uploadedAt,
        })),
      );
      if (error) throw error;
    }

    if (app.statusHistory.length) {
      const { error } = await client.from("application_status_history").insert(
        app.statusHistory.map((h) => ({
          id: h.id,
          application_id: app.id,
          status: h.status,
          changed_by: h.changedBy,
          role: h.role,
          comments: h.comments ?? null,
          created_at: h.createdAt,
        })),
      );
      if (error) throw error;
    }
  } catch (err) {
    console.warn("[supabase] dbCreateApplication failed:", err);
  }
}

export async function dbUpdateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  patch: Partial<{ assignedTo: string }> = {},
) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from("applications")
    .update({ status, ...(patch.assignedTo !== undefined ? { assigned_to: patch.assignedTo } : {}) })
    .eq("id", id);
  if (error) console.warn("[supabase] dbUpdateApplicationStatus failed:", error.message);
}

export async function dbInsertHistory(entry: StatusHistoryEntry) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from("application_status_history").insert({
    id: entry.id,
    application_id: entry.applicationId,
    status: entry.status,
    changed_by: entry.changedBy,
    role: entry.role,
    comments: entry.comments ?? null,
    created_at: entry.createdAt,
  });
  if (error) console.warn("[supabase] dbInsertHistory failed:", error.message);
}

export async function dbInsertComment(entry: CommentEntry) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from("application_comments").insert({
    id: entry.id,
    application_id: entry.applicationId,
    author: entry.author,
    role: entry.role,
    comment: entry.comment,
    created_at: entry.createdAt,
  });
  if (error) console.warn("[supabase] dbInsertComment failed:", error.message);
}

export async function dbInsertAssignment(applicationId: string, assignedTo: string, assignedBy: string) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from("application_assignments").insert({
    application_id: applicationId,
    assigned_to: assignedTo,
    assigned_by: assignedBy,
  });
  if (error) console.warn("[supabase] dbInsertAssignment failed:", error.message);
}

/** Convenience: updates the application row and records the assignment in one call. */
export async function dbAssignApplicationRemote(applicationId: string, assignedTo: string, assignedBy: string) {
  await dbUpdateApplicationStatus(applicationId, "Adjudicator Review", { assignedTo });
  await dbInsertAssignment(applicationId, assignedTo, assignedBy);
}

export async function dbInsertDocumentRequest(applicationId: string, request: DocumentRequest) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from("application_document_requests").insert({
    application_id: applicationId,
    missing_document_type: request.missingDocumentType,
    comments: request.comments,
    requested_at: request.requestedAt,
    return_stage: request.returnStage,
    fulfilled: request.fulfilled,
  });
  if (error) console.warn("[supabase] dbInsertDocumentRequest failed:", error.message);
}

export async function dbFulfillDocumentRequests(applicationId: string) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from("application_document_requests")
    .update({ fulfilled: true })
    .eq("application_id", applicationId)
    .eq("fulfilled", false);
  if (error) console.warn("[supabase] dbFulfillDocumentRequests failed:", error.message);
}

export async function dbInsertDocument(doc: AppDocument) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from("application_documents").insert({
    id: doc.id,
    application_id: doc.applicationId,
    type: doc.type,
    file_name: doc.fileName,
    storage_path: doc.storagePath ?? null,
    size_kb: doc.sizeKb,
    uploaded_at: doc.uploadedAt,
  });
  if (error) console.warn("[supabase] dbInsertDocument failed:", error.message);
}

export async function dbInsertNotification(n: Notification) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from("notifications").insert({
    id: n.id,
    application_id: n.applicationId,
    message: n.message,
    read: n.read,
    created_at: n.createdAt,
  });
  if (error) console.warn("[supabase] dbInsertNotification failed:", error.message);
}

export async function dbMarkNotificationRead(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from("notifications").update({ read: true }).eq("id", id);
  if (error) console.warn("[supabase] dbMarkNotificationRead failed:", error.message);
}

export async function dbInsertLetter(letter: DecisionLetter) {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from("decision_letters").insert({
    id: letter.id,
    application_id: letter.applicationId,
    type: letter.type,
    ref_number: letter.refNumber,
    created_at: letter.createdAt,
  });
  if (error) console.warn("[supabase] dbInsertLetter failed:", error.message);
}

/** Uploads a file to Supabase Storage. Returns the storage path, or null if not configured / on failure. */
export async function uploadDocumentFile(file: File, applicationId: string): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const path = `${applicationId}/${Date.now()}-${file.name}`;
  const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false });
  if (error) {
    console.warn("[supabase] uploadDocumentFile failed:", error.message);
    return null;
  }
  return path;
}

export function getDocumentPublicUrl(storagePath: string): string | null {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
