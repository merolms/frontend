"use client";

import { ArrowLeft, Ban, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();
  return (
    <div className="bg-bg-primary flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <Ban size={48} className="text-error mx-auto" />
        <h1 className="text-text-primary text-xl font-bold">Access Denied</h1>
        <p className="text-text-muted text-sm">
          You don&apos;t have permission to view this page. Contact your administrator if you
          believe this is an error.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="border-border text-text-secondary hover:bg-bg-surface-hover flex h-8 cursor-pointer items-center gap-1 rounded-md border px-3 text-xs"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary-hover text-secondary flex h-8 cursor-pointer items-center gap-1 rounded-md px-3 text-xs font-medium"
          >
            <Home size={14} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
