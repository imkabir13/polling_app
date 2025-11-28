"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ENFORCE_SINGLE_VOTE, MOBILE_ONLY_VOTING } from "@/lib/pollConfig";
import { getOrCreateDeviceId, markDeviceHasVoted } from "@/lib/device";
import { trackEvent } from "@/lib/analyticsClient";
import Notification from "@/components/Notification";
import { isDeviceAllowedToVote } from "@/lib/deviceDetection";

type Answer = "yes" | "no" | null;
type NotificationType = "success" | "error" | "warning" | "info";

function getDeviceType(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/mobi|android|iphone|ipad|ipod/.test(ua)) return "mobile";
  if (/tablet/.test(ua)) return "tablet";
  return "desktop";
}

export default function PollPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [answer, setAnswer] = useState<Answer>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(120);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteToken, setVoteToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  const gender = searchParams.get("gender");
  const age = searchParams.get("age");
  const sessionId = searchParams.get("sessionId");

  // device id
  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  // Check if device is allowed (mobile-only mode)
  useEffect(() => {
    if (MOBILE_ONLY_VOTING && typeof window !== "undefined") {
      const isAllowed = isDeviceAllowedToVote(navigator.userAgent, MOBILE_ONLY_VOTING);
      if (!isAllowed) {
        router.replace("/mobile-only");
      }
    }
  }, [router]);

  // guard invalid session
  useEffect(() => {
    if (!gender || !age || !sessionId) {
      router.replace("/");
    }
  }, [gender, age, sessionId, router]);

  // Fetch vote token when page loads
  useEffect(() => {
    if (!gender || !age || !sessionId) return;

    async function fetchVoteToken() {
      try {
        const res = await fetch("/api/vote-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            gender,
            age,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to get vote token");
        }

        const data = await res.json();
        setVoteToken(data.token);
      } catch (error) {
        console.error("Error fetching vote token:", error);
        setNotification({
          message: "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।",
          type: "error",
        });
      }
    }

    fetchVoteToken();
  }, [gender, age, sessionId]);

  // log "poll_question_modal_opened" once we have essentials
  useEffect(() => {
    if (!gender || !age || !sessionId || !deviceId) return;

    trackEvent("poll_question_modal_opened", {
      deviceId,
      sessionId,
      context: { gender, age: Number(age) },
    });
  }, [deviceId, gender, age, sessionId]);

  // countdown
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

  // Navigate to home page immediately when error occurs
  useEffect(() => {
    if (notification && notification.type === "error") {
      // Navigate immediately, pass error message as query param
      router.push(`/?error=${encodeURIComponent(notification.message)}`);
    }
  }, [notification, router]);

  // timeout → analytics + vote_not_submitted + back home
  useEffect(() => {
    if (secondsLeft !== 0) return;
    if (!gender || !age || !sessionId) {
      router.push("/");
      return;
    }

    const deviceType = getDeviceType();

    trackEvent("poll_question_modal_timeout", {
      deviceId,
      sessionId,
      context: {
        gender,
        age: Number(age),
        deviceType,
      },
    });

    trackEvent("vote_not_submitted", {
      deviceId,
      sessionId,
      context: {
        gender,
        age: Number(age),
        deviceType,
        reason: "timeout",
      },
    });

    router.push("/");
  }, [secondsLeft, router, deviceId, gender, age, sessionId]);

  const handleSubmit = async () => {
    if (!answer || !gender || !age || !sessionId) return;

    // Check if vote token is ready
    if (!voteToken) {
      setNotification({
        message: "অনুগ্রহ করে একটু অপেক্ষা করুন...",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const deviceType = getDeviceType();

      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          gender,
          age: Number(age),
          answer,
          deviceId,
          voteToken, // Include signed JWT token
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || "Failed to submit poll";
        // Set error notification (will trigger navigation to home)
        setNotification({
          message: errorMessage,
          type: "error",
        });
        return;
      }

      // vote submitted
      trackEvent("vote_submitted", {
        deviceId,
        sessionId,
        context: {
          gender,
          age: Number(age),
          answer,
          deviceType,
        },
      });

      if (ENFORCE_SINGLE_VOTE) {
        markDeviceHasVoted();
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 10000);
    } catch (err: any) {
      console.error(err);
      // Handle unexpected errors (network errors, parsing errors, etc.)
      setNotification({
        message: "একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!gender || !age || !sessionId) {
      router.push("/");
      return;
    }

    const deviceType = getDeviceType();

    trackEvent("poll_question_modal_closed", {
      deviceId,
      sessionId,
      context: {
        gender,
        age: Number(age),
        deviceType,
      },
    });

    trackEvent("vote_not_submitted", {
      deviceId,
      sessionId,
      context: {
        gender,
        age: Number(age),
        deviceType,
        reason: "user_closed",
      },
    });

    router.push("/");
  };

  const isSubmitDisabled = !answer || isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={5000}
        />
      )}

      <div className="bg-white w-96 rounded-xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-4">ভোট দিন</h1>

        {/* Question text */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">প্রশ্ন</p>
          <div className="border rounded-md px-3 py-2 text-sm bg-gray-50">
            <b>
              আপনি কি জুলাই জাতীয় সনদ সংবিধান সংস্কার বাস্তবায়ন আদেশ ২০২৫ এবং
              জুলাই জাতীয় সনদে লিপিবদ্ধ সংবিধান সংস্কার সম্পর্কিত নিম্নলিখিত
              প্রস্তাবগুলির প্রতি আপনার সম্মতি জ্ঞাপন করছেন?
            </b>
            <br />
            <br />
            ক) নির্বাচনকালীন তত্ত্বাবধায়ক সরকার, নির্বাচন কমিশন ও অন্যান্য
            সাংবিধানিক প্রতিষ্ঠান জুলাই সনদের বর্ণিত প্রক্রিয়ার আলোকে গঠন করা
            হবে।
            <br />
            <br />
            (খ) আগামী সংসদ হবে দুই কক্ষ বিশিষ্ট। জাতীয় সংসদ নির্বাচনে দলগুলির
            প্রাপ্ত ভোটের অনুপাতে ১০০ জন সদস্যবিশিষ্ট একটি উচ্চকক্ষ গঠিত হবে এবং
            সংবিধান সংশোধন করতে হলে উচ্চকক্ষের সংখ্যাগরিষ্ঠ সদস্যের অনুমোদন
            দরকার হবে।
            <br />
            <br />
            (গ) যে ৩০টি বিষয়ে জাতীয় জুলাই সনদে রাজনৈতিক দলগুলোর ঐক্যমত্য
            হয়েছে সেগুলো বাস্তবায়নে আগামী নির্বাচনে বিজয়ী দলগুলো বাধ্য থাকবে।
            <br />
            <br />
            (ঘ) জুলাই সনদে বর্ণিত অন্যান্য সংস্কার রাজনৈতিক দলগুলির প্রতিশ্রুতি
            অনুযায়ী বাস্তবায়ন হবে।
          </div>
        </div>

        {/* Yes / No */}
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

        {/* Countdown message */}
        {secondsLeft <= 5 && secondsLeft > 0 && (
          <p className="mb-2 text-xs text-red-600 text-right">
            Please submit within {secondsLeft} seconds.
          </p>
        )}

        {/* Submit + Cancel buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="w-1/3 py-3 rounded-lg text-base font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            ফিরে যান
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`w-2/3 py-3 rounded-lg text-base font-semibold flex items-center justify-center gap-2
              ${
                isSubmitDisabled
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                জমা হচ্ছে...
              </>
            ) : (
              "ভোট প্রদান করুন"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
