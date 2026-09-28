"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VfsHeader } from "@/components/vfs-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoStore } from "@/lib/store";
import { DEMO_APPLICANT_EMAIL } from "@/lib/types";

export default function ApplicantLoginPage() {
  const router = useRouter();
  const setApplicantLoggedIn = useDemoStore((s) => s.setApplicantLoggedIn);
  const [email, setEmail] = useState(DEMO_APPLICANT_EMAIL);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <VfsHeader />
      <main className="mx-auto mt-10 w-full max-w-4xl px-4">
        <Card>
          <CardContent className="grid gap-8 p-8 sm:grid-cols-[1fr_220px]">
            <div>
              <CardHeader className="p-0">
                <CardTitle className="text-3xl">Login</CardTitle>
                <CardDescription className="mt-2 text-sm">
                  Login with your registered Email ID by generating a one-time password (OTP) on your registered
                  Email Id
                </CardDescription>
              </CardHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <Label>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>

                {otpSent && (
                  <div>
                    <Label>One-Time Password</Label>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP (demo: 123456)"
                      maxLength={6}
                    />
                    <p className="mt-1 text-xs text-gray-400">Demo OTP has been auto-filled for convenience.</p>
                  </div>
                )}

                {!otpSent ? (
                  <Button disabled={!email} onClick={() => { setOtpSent(true); setOtp("123456"); }}>
                    Get OTP
                  </Button>
                ) : (
                  <Button
                    disabled={otp.length < 6}
                    onClick={() => {
                      setApplicantLoggedIn(true);
                      router.push("/online/dashboard");
                    }}
                  >
                    Verify &amp; Login
                  </Button>
                )}
              </div>
            </div>

            <div className="text-sm">
              <p className="text-gray-500">Haven&apos;t signed up yet?</p>
              <p className="mt-2">
                <a href="#">Sign Up</a>
              </p>
              <p className="mt-1">
                <a href="#">Track Status</a>
              </p>
            </div>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-gray-400">
          Demo credentials: any email works &middot; OTP is pre-filled for this prototype
        </p>
      </main>
    </div>
  );
}
