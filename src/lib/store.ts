"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateSeedApplications } from "./seed";
import { isSupabaseConfigured } from "./supabase/client";
import {
  dbAssignApplicationRemote,
  dbCreateApplication,
  dbFulfillDocumentRequests,
  dbInsertComment,
  dbInsertDocument,
  dbInsertDocumentRequest,
  dbInsertHistory,
  dbInsertLetter,
  dbInsertNotification,
  dbMarkNotificationRead,
  dbUpdateApplicationStatus,
  fetchApplications,
  fetchLetters,
  fetchNotifications,
} from "./supabase/repo";
import {
  type AppDocument,
  type Application,
  type ApplicationStatus,
  type DecisionLetter,
  DEMO_APPLICANT_EMAIL,
  type Notification,
  type Role,
  STATUS_FLOW,
} from "./types";

function uid(_prefix?: string) {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

interface NewApplicationInput {
  id?: string;
  name: string;
  surname: string;
  passportNumber: string;
  nationality: string;
  countryOfResidence: string;
  portOfExit: string;
  form19Reference: string;
  overstayReference: string;
  dateOfOverstay: string;
  appealReason: Application["appealReason"];
  appealReasonOther?: string;
  signatureName: string;
  documents: { type: AppDocument["type"]; fileName: string; sizeKb: number; storagePath?: string }[];
}

interface DemoState {
  role: Role;
  applicantLoggedIn: boolean;
  applications: Application[];
  notifications: Notification[];
  letters: DecisionLetter[];
  serviceFee: number;
  hydrated: boolean;

  setRole: (role: Role) => void;
  setApplicantLoggedIn: (loggedIn: boolean) => void;
  setHydrated: () => void;
  initFromSupabase: () => Promise<void>;
  resetDemoData: () => void;
  setServiceFee: (fee: number) => void;

  createApplication: (input: NewApplicationInput) => string;

  assignApplication: (id: string, adjudicator: string) => void;
  addComment: (id: string, author: string, role: Role, comment: string) => void;
  advanceApplication: (id: string, comment: string, actor: string, role: Role) => void;
  rejectApplication: (id: string, comment: string, actor: string, role: Role) => void;
  finalApprove: (id: string, comment: string, actor: string) => void;
  requestDocuments: (id: string, missingDocumentType: string, comment: string, actor: string, role: Role) => void;
  fulfillDocumentRequest: (id: string, fileName: string, storagePath?: string) => void;

  markNotificationRead: (id: string) => void;
  getApplicationsForApplicant: (email: string) => Application[];
  getQueueForRole: (role: Role) => Application[];
}

function pushHistory(app: Application, status: ApplicationStatus, changedBy: string, role: Role | "system", comments?: string) {
  const entry = {
    id: uid(),
    applicationId: app.id,
    status,
    changedBy,
    role,
    comments,
    createdAt: nowIso(),
  };
  app.statusHistory.push(entry);
  app.status = status;
  app.updatedAt = nowIso();
  return entry;
}

function nextStage(current: ApplicationStatus): ApplicationStatus {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return current;
  return STATUS_FLOW[idx + 1];
}

function seedLetters(apps: Application[]): DecisionLetter[] {
  return apps
    .filter((a) => a.status === "Approved" || a.status === "Rejected")
    .map((a) => ({
      id: uid(),
      applicationId: a.id,
      type: a.status === "Approved" ? "Approval" : "Rejection",
      refNumber: `LTR-${a.refNumber}`,
      createdAt: a.updatedAt,
    }));
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      role: "assigner",
      applicantLoggedIn: false,
      applications: [],
      notifications: [],
      letters: [],
      serviceFee: 1500,
      hydrated: false,

      setRole: (role) => set({ role }),
      setApplicantLoggedIn: (loggedIn) => set({ applicantLoggedIn: loggedIn }),
      setHydrated: () => set({ hydrated: true }),

      initFromSupabase: async () => {
        if (!isSupabaseConfigured()) return;
        try {
          const [applications, notifications, letters] = await Promise.all([
            fetchApplications(),
            fetchNotifications(),
            fetchLetters(),
          ]);
          if (applications && applications.length > 0) {
            set({ applications, notifications: notifications ?? [], letters: letters ?? [] });
          } else {
            console.info("[supabase] No applications found in database yet. Run `npm run seed:supabase` to seed demo data, or start creating applications through the app.");
          }
        } catch (err) {
          console.warn("[supabase] initFromSupabase failed, staying on local demo data:", err);
        }
      },

      resetDemoData: () => {
        const applications = generateSeedApplications();
        set({
          applications,
          notifications: [],
          letters: seedLetters(applications),
          serviceFee: 1500,
        });
      },

      setServiceFee: (fee) => set({ serviceFee: fee }),

      createApplication: (input) => {
        const id = input.id ?? uid();
        const existing = get().applications;
        const refNumber = `OVA-2026-${(2000 + existing.length).toString()}`;
        const createdAt = nowIso();
        const documents: AppDocument[] = input.documents.map((d) => ({
          id: uid(),
          applicationId: id,
          type: d.type,
          fileName: d.fileName,
          uploadedAt: createdAt,
          sizeKb: d.sizeKb,
          storagePath: d.storagePath,
        }));
        const app: Application = {
          id,
          refNumber,
          status: "Submitted",
          createdAt,
          updatedAt: createdAt,
          name: input.name,
          surname: input.surname,
          passportNumber: input.passportNumber,
          nationality: input.nationality,
          countryOfResidence: input.countryOfResidence,
          portOfExit: input.portOfExit,
          form19Reference: input.form19Reference,
          overstayReference: input.overstayReference,
          dateOfOverstay: input.dateOfOverstay,
          appealReason: input.appealReason,
          appealReasonOther: input.appealReasonOther,
          declarationSigned: true,
          signatureName: input.signatureName,
          paymentStatus: "Paid",
          serviceFee: get().serviceFee,
          applicantEmail: DEMO_APPLICANT_EMAIL,
          documents,
          statusHistory: [
            {
              id: uid(),
              applicationId: id,
              status: "Submitted",
              changedBy: input.signatureName,
              role: "applicant",
              comments: "Application submitted online",
              createdAt,
            },
          ],
          comments: [],
          documentRequests: [],
        };
        set({ applications: [app, ...existing] });
        void dbCreateApplication(app);
        return id;
      },

      assignApplication: (id, adjudicator) => {
        set((state) => ({
          applications: state.applications.map((a) => {
            if (a.id !== id) return a;
            const updated = { ...a, assignedTo: adjudicator };
            pushHistory(updated, "Adjudicator Review", "Assigner", "assigner", `Assigned to ${adjudicator}`);
            return updated;
          }),
        }));
        void dbAssignApplicationRemote(id, adjudicator, "Assigner");
      },

      addComment: (id, author, role, comment) => {
        const entry = { id: uid(), applicationId: id, author, role, comment, createdAt: nowIso() };
        set((state) => ({
          applications: state.applications.map((a) => (a.id === id ? { ...a, comments: [...a.comments, entry] } : a)),
        }));
        void dbInsertComment(entry);
      },

      advanceApplication: (id, comment, actor, role) => {
        set((state) => {
          let newNotification: Notification | null = null;
          let newLetter: DecisionLetter | null = null;
          const applications = state.applications.map((a) => {
            if (a.id !== id) return a;
            const updated: Application = { ...a, comments: [...a.comments] };
            let commentEntry = null;
            if (comment) {
              commentEntry = { id: uid(), applicationId: id, author: actor, role, comment, createdAt: nowIso() };
              updated.comments.push(commentEntry);
              void dbInsertComment(commentEntry);
            }
            const isLastStage = a.status === "Chief Director Review";
            if (isLastStage) {
              const historyEntry = pushHistory(updated, "Approved", actor, role, comment || "Approved");
              void dbInsertHistory(historyEntry);
              void dbUpdateApplicationStatus(id, "Approved");
              newLetter = {
                id: uid(),
                applicationId: id,
                type: "Approval",
                refNumber: `LTR-${a.refNumber}`,
                createdAt: nowIso(),
              };
              void dbInsertLetter(newLetter);
              newNotification = {
                id: uid(),
                applicationId: id,
                message: `Your overstay appeal ${a.refNumber} has been approved. Download your decision letter.`,
                createdAt: nowIso(),
                read: false,
              };
              void dbInsertNotification(newNotification);
            } else {
              const stage = nextStage(a.status);
              const historyEntry = pushHistory(updated, stage, actor, role, comment || `Recommended for approval, moved to ${stage}`);
              void dbInsertHistory(historyEntry);
              void dbUpdateApplicationStatus(id, stage);
              newNotification = {
                id: uid(),
                applicationId: id,
                message: `Your overstay appeal ${a.refNumber} has moved to ${stage}.`,
                createdAt: nowIso(),
                read: false,
              };
              void dbInsertNotification(newNotification);
            }
            return updated;
          });
          return {
            applications,
            letters: newLetter ? [...state.letters, newLetter] : state.letters,
            notifications: newNotification ? [...state.notifications, newNotification] : state.notifications,
          };
        });
      },

      rejectApplication: (id, comment, actor, role) => {
        set((state) => {
          let newNotification: Notification | null = null;
          let newLetter: DecisionLetter | null = null;
          const applications = state.applications.map((a) => {
            if (a.id !== id) return a;
            const updated: Application = { ...a, comments: [...a.comments] };
            const commentEntry = { id: uid(), applicationId: id, author: actor, role, comment, createdAt: nowIso() };
            updated.comments.push(commentEntry);
            void dbInsertComment(commentEntry);
            const historyEntry = pushHistory(updated, "Rejected", actor, role, comment);
            void dbInsertHistory(historyEntry);
            void dbUpdateApplicationStatus(id, "Rejected");
            newLetter = {
              id: uid(),
              applicationId: id,
              type: "Rejection",
              refNumber: `LTR-${a.refNumber}`,
              createdAt: nowIso(),
            };
            void dbInsertLetter(newLetter);
            newNotification = {
              id: uid(),
              applicationId: id,
              message: `Your overstay appeal ${a.refNumber} has been rejected. View the decision letter for details.`,
              createdAt: nowIso(),
              read: false,
            };
            void dbInsertNotification(newNotification);
            return updated;
          });
          return {
            applications,
            letters: newLetter ? [...state.letters, newLetter] : state.letters,
            notifications: newNotification ? [...state.notifications, newNotification] : state.notifications,
          };
        });
      },

      finalApprove: (id, comment, actor) => {
        get().advanceApplication(id, comment, actor, "chief_director");
      },

      requestDocuments: (id, missingDocumentType, comment, actor, role) => {
        set((state) => {
          let newNotification: Notification | null = null;
          const applications = state.applications.map((a) => {
            if (a.id !== id) return a;
            const commentEntry = { id: uid(), applicationId: id, author: actor, role, comment, createdAt: nowIso() };
            const docRequest = {
              missingDocumentType,
              comments: comment,
              requestedAt: nowIso(),
              returnStage: a.status,
              fulfilled: false,
            };
            const updated: Application = {
              ...a,
              comments: [...a.comments, commentEntry],
              documentRequests: [...a.documentRequests, docRequest],
            };
            void dbInsertComment(commentEntry);
            void dbInsertDocumentRequest(id, docRequest);
            const historyEntry = pushHistory(updated, "Pending Applicant Action", actor, role, comment);
            void dbInsertHistory(historyEntry);
            void dbUpdateApplicationStatus(id, "Pending Applicant Action");
            newNotification = {
              id: uid(),
              applicationId: id,
              message: `Additional documents requested for ${a.refNumber}: ${missingDocumentType}.`,
              createdAt: nowIso(),
              read: false,
            };
            void dbInsertNotification(newNotification);
            return updated;
          });
          return {
            applications,
            notifications: newNotification ? [...state.notifications, newNotification] : state.notifications,
          };
        });
      },

      fulfillDocumentRequest: (id, fileName, storagePath) => {
        set((state) => ({
          applications: state.applications.map((a) => {
            if (a.id !== id) return a;
            const pending = a.documentRequests.find((r) => !r.fulfilled);
            const newDoc: AppDocument = {
              id: uid(),
              applicationId: id,
              type: "Supporting Document",
              fileName,
              uploadedAt: nowIso(),
              sizeKb: 240,
              storagePath,
            };
            const updated: Application = {
              ...a,
              documents: [...a.documents, newDoc],
              documentRequests: a.documentRequests.map((r) => (r === pending ? { ...r, fulfilled: true } : r)),
            };
            void dbInsertDocument(newDoc);
            void dbFulfillDocumentRequests(id);
            const returnStage = pending?.returnStage ?? "Adjudicator Review";
            const historyEntry = pushHistory(updated, returnStage, a.name + " " + a.surname, "applicant", "Applicant re-uploaded requested document");
            void dbInsertHistory(historyEntry);
            void dbUpdateApplicationStatus(id, returnStage);
            return updated;
          }),
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
        void dbMarkNotificationRead(id);
      },

      getApplicationsForApplicant: (email) => get().applications.filter((a) => a.applicantEmail === email),

      getQueueForRole: (role) => {
        const apps = get().applications;
        switch (role) {
          case "assigner":
            return apps.filter((a) => a.status === "Submitted");
          case "adjudicator":
            return apps.filter((a) => a.status === "Adjudicator Review");
          case "supervisor":
            return apps.filter((a) => a.status === "Supervisor Review");
          case "deputy_director":
            return apps.filter((a) => a.status === "Deputy Director Review");
          case "director":
            return apps.filter((a) => a.status === "Director Review");
          case "chief_director":
            return apps.filter((a) => a.status === "Chief Director Review");
          default:
            return apps;
        }
      },
    }),
    {
      name: "dha-overstay-demo-store",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (isSupabaseConfigured()) {
          state.initFromSupabase().finally(() => state.setHydrated());
          return;
        }
        if (state.applications.length === 0) {
          state.applications = generateSeedApplications();
          state.letters = seedLetters(state.applications);
        }
        state.setHydrated();
      },
    },
  ),
);
