import Link from "next/link";
import { VfsHeader } from "@/components/vfs-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound, Building2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <VfsHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-vfs-orange">
          Department of Home Affairs &middot; South Africa
        </p>
        <h1 className="mb-3 text-center text-3xl font-semibold text-gray-900">Overstay Appeal Management System</h1>
        <p className="mb-10 max-w-2xl text-center text-sm text-gray-500">
          Prototype demonstration. Choose where you would like to proceed.
        </p>
        <div className="grid w-full gap-6 sm:grid-cols-2">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-vfs-orange">
                <UserRound className="h-6 w-6" />
              </div>
              <CardTitle>Online Application</CardTitle>
              <CardDescription>
                For applicants: submit an overstay appeal, upload documents, pay the service fee, and track your
                status.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href="/online/login">
                <Button className="w-full">Continue as Applicant</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle>Back Office</CardTitle>
              <CardDescription>
                For VFS &amp; DHA staff: assignment, adjudication, supervisory &amp; director review, and final
                decisions.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href="/backoffice/login">
                <Button variant="secondary" className="w-full">
                  Continue to Back Office
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <p className="mt-10 text-xs text-gray-400">Prototype only &middot; all data is seeded and mocked</p>
      </main>
    </div>
  );
}
