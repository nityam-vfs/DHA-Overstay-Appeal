"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { VfsHeader } from "@/components/vfs-header";
import { WizardStepper } from "@/components/wizard-stepper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWizardStore, type UploadedFileMeta } from "@/lib/wizard-store";
import { uploadDocumentFile } from "@/lib/supabase/repo";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { FileText, UploadCloud, X, Loader2 } from "lucide-react";

function FileCard({ fileName, sizeKb, storagePath, onRemove }: UploadedFileMeta & { onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-vfs-orange" />
        <div>
          <p className="text-sm font-medium text-gray-800">{fileName}</p>
          <p className="text-xs text-gray-400">
            {sizeKb} KB {storagePath && "· stored in Supabase"}
          </p>
        </div>
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-red-500">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function UploadDropzone({ label, onFile }: { label: string; onFile: (file: File) => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  return (
    <div>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-vfs-orange disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-vfs-orange" />
        ) : (
          <UploadCloud className="h-6 w-6 text-gray-400" />
        )}
        <span className="text-sm text-gray-600">{uploading ? "Uploading..." : label}</span>
        <span className="text-xs text-gray-400">PDF only, up to 5MB</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setUploading(true);
          try {
            await onFile(file);
          } finally {
            setUploading(false);
          }
        }}
      />
    </div>
  );
}

export default function DocumentsStep() {
  const router = useRouter();
  const w = useWizardStore();

  const canContinue = !!w.appealLetter && !!w.form19;

  async function handleUpload(file: File): Promise<UploadedFileMeta> {
    const sizeKb = Math.max(1, Math.round(file.size / 1024));
    const storagePath = isSupabaseConfigured() ? (await uploadDocumentFile(file, w.draftId)) ?? undefined : undefined;
    return { fileName: file.name, sizeKb, storagePath };
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VfsHeader />
      <WizardStepper current={3} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardContent className="space-y-6 p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Document Upload</h1>
            {isSupabaseConfigured() && (
              <p className="rounded-md bg-blue-50 p-2 text-xs text-blue-700">
                Documents are uploaded to Supabase Storage in real time.
              </p>
            )}

            <div>
              <Label>
                Appeal Letter <span className="text-red-500">*</span>
              </Label>
              {w.appealLetter ? (
                <FileCard {...w.appealLetter} onRemove={() => w.update({ appealLetter: undefined })} />
              ) : (
                <UploadDropzone
                  label="Upload Appeal Letter"
                  onFile={async (file) => w.update({ appealLetter: await handleUpload(file) })}
                />
              )}
            </div>

            <div>
              <Label>
                Form 19 <span className="text-red-500">*</span>
              </Label>
              {w.form19 ? (
                <FileCard {...w.form19} onRemove={() => w.update({ form19: undefined })} />
              ) : (
                <UploadDropzone label="Upload Form 19" onFile={async (file) => w.update({ form19: await handleUpload(file) })} />
              )}
            </div>

            <div>
              <Label>Supporting Documents (optional, multiple)</Label>
              <div className="space-y-2">
                {w.supportingDocuments.map((doc) => (
                  <FileCard key={doc.fileName} {...doc} onRemove={() => w.removeSupportingDoc(doc.fileName)} />
                ))}
                <UploadDropzone label="Upload Supporting Document" onFile={async (file) => w.addSupportingDoc(await handleUpload(file))} />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => router.push("/online/apply/appeal-details")}>
                Back
              </Button>
              <Button disabled={!canContinue} onClick={() => router.push("/online/apply/declaration")}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
