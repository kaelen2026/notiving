"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { setAccessToken } from "@/lib/api";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("accessToken");
    if (token) {
      setAccessToken(token);
      router.replace("/");
    } else {
      router.replace("/login");
    }
  }, [searchParams, router]);

  return <p className="text-sm text-foreground-secondary">Logging in...</p>;
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Suspense
        fallback={
          <p className="text-sm text-foreground-secondary">Logging in...</p>
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
