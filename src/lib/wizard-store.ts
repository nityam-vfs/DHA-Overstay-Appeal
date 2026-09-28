"use client";

import { create } from "zustand";
import type { AppealReason } from "./types";

export interface UploadedFileMeta {
  fileName: string;
  sizeKb: number;
  storagePath?: string;
}

function newDraftId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

interface WizardState {
  draftId: string;
  name: string;
  surname: string;
  passportNumber: string;
  nationality: string;
  countryOfResidence: string;
  portOfExit: string;
  form19Reference: string;
  eligibilityConfirmed: boolean;

  overstayReference: string;
  dateOfOverstay: string;
  appealReason: AppealReason | "";
  appealReasonOther: string;

  appealLetter?: UploadedFileMeta;
  form19?: UploadedFileMeta;
  supportingDocuments: UploadedFileMeta[];

  declarationChecked: boolean;
  signatureName: string;

  paid: boolean;
  submittedApplicationId?: string;
  submittedRefNumber?: string;

  update: (patch: Partial<WizardState>) => void;
  addSupportingDoc: (doc: UploadedFileMeta) => void;
  removeSupportingDoc: (fileName: string) => void;
  reset: () => void;
}

const initial = {
  draftId: newDraftId(),
  name: "",
  surname: "",
  passportNumber: "",
  nationality: "",
  countryOfResidence: "South Africa",
  portOfExit: "",
  form19Reference: "",
  eligibilityConfirmed: false,

  overstayReference: "",
  dateOfOverstay: "",
  appealReason: "" as AppealReason | "",
  appealReasonOther: "",

  appealLetter: undefined,
  form19: undefined,
  supportingDocuments: [] as UploadedFileMeta[],

  declarationChecked: false,
  signatureName: "",

  paid: false,
  submittedApplicationId: undefined,
  submittedRefNumber: undefined,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initial,
  update: (patch) => set(patch),
  addSupportingDoc: (doc) => set((s) => ({ supportingDocuments: [...s.supportingDocuments, doc] })),
  removeSupportingDoc: (fileName) =>
    set((s) => ({ supportingDocuments: s.supportingDocuments.filter((d) => d.fileName !== fileName) })),
  reset: () => set({ ...initial, draftId: newDraftId() }),
}));
