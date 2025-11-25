"use client";

import { Suspense } from "react";
import PollPageContent from "./PollPageContent";

export default function PollPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading poll...</p>
          </div>
        </div>
      }
    >
      <PollPageContent />
    </Suspense>
  );
}
