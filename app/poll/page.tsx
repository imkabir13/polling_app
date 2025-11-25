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
  const [secondsLeft, setSecondsLeft] = useState<number>(120);
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
        <h1 className="text-2xl font-bold text-center mb-4">ভোট দিন</h1>

        {/* Description / Question box */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">প্রশ্ন</p>
          <div className="border rounded-md px-3 py-2 text-sm bg-gray-50">
            <b>
              আপনি কি জুলাই জাতীয় সনদ সংবিধান সংস্কার বাস্তবায়ন আদেশ ২০২৫ এবং
              জুলাই জাতীয় সনদে লিপিবদ্ধ সংবিধান সংস্কার সম্পর্কিত নিম্নলিখিত
              প্রস্তাবগুলির প্রতি আপনার সম্মতি জ্ঞাপন করছেন?
            </b>
            <br></br>
            <br></br>
            ক) নির্বাচনকালীন তত্ত্বাবধায়ক সরকার, নির্বাচন কমিশন ও অন্যান্য
            সাংবিধানিক প্রতিষ্ঠান জুলাই সনদের বর্ণিত প্রক্রিয়ার আলোকে গঠন করা
            হবে।<br></br>
            <br></br>
            (খ) আগামী সংসদ হবে দুই কক্ষ বিশিষ্ট। জাতীয় সংসদ নির্বাচনে দলগুলির
            প্রাপ্ত ভোটের অনুপাতে ১০০ জন সদস্যবিশিষ্ট একটি উচ্চকক্ষ গঠিত হবে এবং
            সংবিধান সংশোধন করতে হলে উচ্চকক্ষের সংখ্যাগরিষ্ঠ সদস্যের অনুমোদন
            দরকার হবে।<br></br>
            <br></br>
            (গ) যে ৩০টি বিষয়ে জাতীয় জুলাই সনদে রাজনৈতিক দলগুলোর ঐক্যমত্য হয়েছে
            সেগুলো বাস্তবায়নে আগামী নির্বাচনে বিজয়ী দলগুলো বাধ্য থাকবে।<br></br>
            <br></br>
            (ঘ) জুলাই সনদে বর্ণিত অন্যান্য সংস্কার রাজনৈতিক দলগুলির প্রতিশ্রুতি
            অনুযায়ী বাস্তবায়ন হবে।’
          </div>
        </div>

        {/* Yes / No Toggle */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">আপনার উত্তর</p>
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
              হ্যাঁ
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
              না
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
          ভোট প্রদান করুন
        </button>
      </div>
    </div>
  );
}
