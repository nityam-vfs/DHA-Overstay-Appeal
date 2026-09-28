/**
 * Seeds the Supabase backend with the same deterministic demo dataset used
 * for local-only mode (`generateSeedApplications()`), remapping the
 * human-readable local IDs (e.g. "app-0007") to real UUIDs since Postgres
 * `id` columns are typed `uuid`.
 *
 * Usage:
 *   1. Run `supabase/schema.sql` in the Supabase SQL editor first.
 *   2. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `.env.local`
 *      (the service role key is required to bypass RLS for bulk-inserts).
 *   3. `npm run seed:supabase`
 *
 * This script wipes existing rows in the demo tables before reseeding, so it
 * is safe to re-run repeatedly during development.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { generateSeedApplications } from "../src/lib/seed";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local. See .env.local.example.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  console.log("Generating deterministic seed dataset...");
  const apps = generateSeedApplications();

  // Remap local string ids -> real UUIDs, preserving relationships.
  const idMap = new Map<string, string>();
  const uuidFor = (localId: string) => {
    let mapped = idMap.get(localId);
    if (!mapped) {
      mapped = crypto.randomUUID();
      idMap.set(localId, mapped);
    }
    return mapped;
  };

  console.log("Clearing existing demo data...");
  const { error: delError } = await supabase.from("applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delError) throw delError;

  console.log(`Seeding ${apps.length} applications...`);
  for (const app of apps) {
    const appId = uuidFor(app.id);

    const { error: appError } = await supabase.from("applications").insert({
      id: appId,
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
    });
    if (appError) throw new Error(`applications insert failed for ${app.refNumber}: ${appError.message}`);

    if (app.documents.length) {
      const { error } = await supabase.from("application_documents").insert(
        app.documents.map((d) => ({
          id: uuidFor(d.id),
          application_id: appId,
          type: d.type,
          file_name: d.fileName,
          storage_path: d.storagePath ?? null,
          size_kb: d.sizeKb,
          uploaded_at: d.uploadedAt,
        })),
      );
      if (error) throw new Error(`documents insert failed for ${app.refNumber}: ${error.message}`);
    }

    if (app.statusHistory.length) {
      const { error } = await supabase.from("application_status_history").insert(
        app.statusHistory.map((h) => ({
          id: uuidFor(h.id),
          application_id: appId,
          status: h.status,
          changed_by: h.changedBy,
          role: h.role,
          comments: h.comments ?? null,
          created_at: h.createdAt,
        })),
      );
      if (error) throw new Error(`status history insert failed for ${app.refNumber}: ${error.message}`);
    }

    if (app.comments.length) {
      const { error } = await supabase.from("application_comments").insert(
        app.comments.map((c) => ({
          id: uuidFor(c.id),
          application_id: appId,
          author: c.author,
          role: c.role,
          comment: c.comment,
          created_at: c.createdAt,
        })),
      );
      if (error) throw new Error(`comments insert failed for ${app.refNumber}: ${error.message}`);
    }

    if (app.documentRequests.length) {
      const { error } = await supabase.from("application_document_requests").insert(
        app.documentRequests.map((r) => ({
          application_id: appId,
          missing_document_type: r.missingDocumentType,
          comments: r.comments,
          requested_at: r.requestedAt,
          return_stage: r.returnStage,
          fulfilled: r.fulfilled,
        })),
      );
      if (error) throw new Error(`document requests insert failed for ${app.refNumber}: ${error.message}`);
    }

    if (app.status === "Approved" || app.status === "Rejected") {
      const { error } = await supabase.from("decision_letters").insert({
        id: crypto.randomUUID(),
        application_id: appId,
        type: app.status === "Approved" ? "Approval" : "Rejection",
        ref_number: `LTR-${app.refNumber}`,
        created_at: app.updatedAt,
      });
      if (error) throw new Error(`decision letter insert failed for ${app.refNumber}: ${error.message}`);
    }
  }

  console.log(`Done. Seeded ${apps.length} applications into Supabase.`);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
