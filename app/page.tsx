"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PollResultsPie from "@/components/PollResultsPie";
import { ENFORCE_SINGLE_VOTE } from "@/lib/pollConfig";
import { hasDeviceVoted } from "@/lib/device";
import { trackEvent } from "@/lib/analyticsClient";
import { DEVICE_ID_KEY, HAS_VOTED_KEY } from "./constants";

type Gender = "male" | "female" | null;

// Mock result data – later this will come from API/DB
// const YES_VOTES = 80000000;
// const NO_VOTES = 9000000;

export default function Home() {
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState<Gender>(null);
  const [age, setAge] = useState<string>("");
  const [ageError, setAgeError] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [alreadyVotedMessage, setAlreadyVotedMessage] = useState("");
  const [yesVotes, setYesVotes] = useState(0);
  const [noVotes, setNoVotes] = useState(0);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const router = useRouter();

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const onlyDigits = raw.replace(/\D/g, "");
    const trimmed = onlyDigits.slice(0, 2);

    setAge(trimmed);

    if (trimmed === "") {
      setAgeError("");
      return;
    }

    const numericAge = Number(trimmed);
    if (numericAge <= 16) {
      setAgeError("You are under 16.");
    } else {
      setAgeError("");
    }
  };

  const isStartDisabled =
    !gender || !age || Number(age) <= 16 || ageError !== "";

  const resetForm = () => {
    setGender(null);
    setAge("");
    setAgeError("");
  };

  const handleClose = () => {
    // 🔹 Analytics: modal closed manually
    trackEvent("modal_closed", {
      deviceId,
      context: { gender, age },
    });

    resetForm();
    setOpen(false);
  };

  const handleStartPoll = () => {
    if (isStartDisabled || !gender) return;

    const sessionId = crypto.randomUUID();

    const params = new URLSearchParams({
      gender,
      age,
      sessionId,
    });

    // 🔹 Analytics: user started the poll
    // trackEvent("modal_closed", {
    //   deviceId,
    //   sessionId,
    //   context: { gender, age, action: "start_poll" },
    // });

    resetForm();
    setOpen(false);
    setSecondsLeft(0);

    router.push(`/poll?${params.toString()}`);
  };

  // deviceId and track poll_opened
  useEffect(() => {
    if (typeof window === "undefined") return;

    let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    const votedFlag = localStorage.getItem(HAS_VOTED_KEY) === "true";
    setHasVoted(votedFlag);

    // 🔹 Analytics: home / poll seen
    trackEvent("poll_opened", {
      deviceId: storedDeviceId,
      context: { screen: "home" },
    });
  }, []);

  // Read hasVoted from localStorage via helper
  useEffect(() => {
    if (!ENFORCE_SINGLE_VOTE) return;
    setHasVoted(hasDeviceVoted());
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/poll/stats");
        if (!res.ok) return;
        const data = await res.json();
        setYesVotes(data.yesVotes ?? 0);
        setNoVotes(data.noVotes ?? 0);
      } catch (err) {
        console.error("Failed to load poll stats", err);
      }
    }

    fetchStats();
  }, []);

  useEffect(() => {
    if (open) {
      trackEvent("modal_opened", {
        deviceId,
        context: { gender, age, action: "start_poll" },
      });
    }
  }, [open]);

  // Start countdown when modal opens
  useEffect(() => {
    if (!open) return;

    setSecondsLeft(10);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          // 🔹 Analytics: modal timeout
          trackEvent("modal_timeout", {
            deviceId,
            context: { gender, age },
          });

          resetForm();
          setOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open]);

  // When you read / create deviceId, also set state + fire poll_opened
  useEffect(() => {
    if (!ENFORCE_SINGLE_VOTE) return;
    if (typeof window === "undefined") return;

    let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    const votedFlag = localStorage.getItem(HAS_VOTED_KEY) === "true";
    setHasVoted(votedFlag);

    // 🔹 Analytics: user saw the home page/poll
    trackEvent("poll_opened", {
      deviceId: storedDeviceId,
      context: { screen: "home" },
    });
  }, []);

  const handleOpenPoll = () => {
    if (ENFORCE_SINGLE_VOTE && hasVoted) {
      setAlreadyVotedMessage(
        "You have already participated in this poll from this device."
      );
      return;
    }
    setAlreadyVotedMessage("");
    // 🔹 Analytics: modal opened
    trackEvent("modal_opened", {
      deviceId,
      context: { screen: "home" },
    });
    setOpen(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-8">
        {/* Main Poll Button */}
        <button
          onClick={handleOpenPoll}
          className="px-8 py-4 text-2xl font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Poll
        </button>

        {ENFORCE_SINGLE_VOTE && alreadyVotedMessage && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded-lg shadow">
            {alreadyVotedMessage}
          </div>
        )}

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 bg-gray-200 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
              <h2 className="text-xl font-bold mb-4 text-center">Start Poll</h2>

              {/* Gender Selection */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">
                  Select Gender <span className="text-red-500">*</span>
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`flex-1 py-2 rounded-lg border text-sm font-semibold
                      ${
                        gender === "male"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-200 text-gray-800 border-gray-300"
                      }
                    `}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`flex-1 py-2 rounded-lg border text-sm font-semibold
                      ${
                        gender === "female"
                          ? "bg-pink-600 text-white border-pink-600"
                          : "bg-gray-200 text-gray-800 border-gray-300"
                      }
                    `}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Age Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={age}
                  onChange={handleAgeChange}
                  placeholder="Enter age (17–99)"
                  className="w-full border rounded px-3 py-2 text-sm"
                  inputMode="numeric"
                />
                {ageError && (
                  <p className="mt-1 text-xs text-red-600">{ageError}</p>
                )}
              </div>

              {/* Timer message */}
              {secondsLeft > 0 && secondsLeft <= 5 && (
                <p className="mt-1 text-xs text-red-600 text-right">
                  Please complete within {secondsLeft} seconds.
                </p>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
                >
                  Close
                </button>
                <button
                  onClick={handleStartPoll}
                  disabled={isStartDisabled}
                  className={`px-4 py-2 rounded text-sm font-semibold 
                    ${
                      isStartDisabled
                        ? "bg-blue-300 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }
                  `}
                >
                  Start Poll
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Poll Results Pie Chart */}
        <PollResultsPie yesVotes={yesVotes} noVotes={noVotes} />
      </div>
    </div>
  );
}
