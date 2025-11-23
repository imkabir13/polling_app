"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ENFORCE_SINGLE_VOTE } from "@/lib/pollConfig";
import { getOrCreateDeviceId, markDeviceHasVoted } from "@/lib/device";
import { trackEvent } from "@/lib/analyticsClient";

type Answer = "yes" | "no" | null;

export default function PollPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [answer, setAnswer] = useState<Answer>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(10);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const gender = searchParams.get("gender");
  const age = searchParams.get("age");
  const sessionId = searchParams.get("sessionId");

  const [showSuccess, setShowSuccess] = useState(false);

  // Get / create device id on mount
  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  // If any required session data is missing, treat as invalid session
  useEffect(() => {
    if (!gender || !age || !sessionId) {
      router.replace("/");
    }
  }, [gender, age, sessionId, router]);

  // 1) Handle countdown only
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 2) When countdown finishes, navigate home
  useEffect(() => {
    if (secondsLeft === 0) {
      router.push("/");
    }
  }, [secondsLeft, router]);

  const handleSubmit = async () => {
    if (!answer || !gender || !age || !sessionId) return;

    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          gender,
          age: Number(age),
          answer,
          deviceId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit poll");
      }

      // 🔹 Analytics: vote submitted
      trackEvent("vote_submitted", {
        deviceId,
        sessionId,
        context: {
          gender,
          age: Number(age),
          answer,
        },
      });

      if (ENFORCE_SINGLE_VOTE) {
        markDeviceHasVoted();
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 10000);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  const isSubmitDisabled = !answer;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white w-96 rounded-xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Polling</h1>

        {/* Description / Question box */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Question</p>
          <div className="border rounded-md px-3 py-2 text-sm bg-gray-50">
            Do you support the new community project in your area?
          </div>
        </div>

        {/* Yes / No Toggle */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Your Answer</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setAnswer("yes")}
              className={`flex-1 py-3 rounded-lg text-lg font-semibold border
                ${
                  answer === "yes"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-gray-200 text-gray-800 border-gray-300"
                }
              `}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setAnswer("no")}
              className={`flex-1 py-3 rounded-lg text-lg font-semibold border
                ${
                  answer === "no"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-gray-200 text-gray-800 border-gray-300"
                }
              `}
            >
              No
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 bg-[#049354] flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center">
              <h2 className="text-xl font-bold mb-3">Thank You!</h2>
              <p className="text-sm mb-4">Your vote has been recorded.</p>

              <button
                onClick={() => router.push("/")}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {secondsLeft <= 5 && secondsLeft > 0 && (
          <p className="mb-2 text-xs text-red-600 text-right">
            Please submit within {secondsLeft} seconds.
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full py-3 rounded-lg text-base font-semibold
            ${
              isSubmitDisabled
                ? "bg-blue-300 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }
          `}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
