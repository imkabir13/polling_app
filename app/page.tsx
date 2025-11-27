"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PollResultsPie from "@/components/PollResultsPie";
import QuestionCard from "@/components/QuestionCard";
import UserInfoModel from "@/components/UserInfoModel";
import { ENFORCE_SINGLE_VOTE } from "@/lib/pollConfig";
import { hasDeviceVoted } from "@/lib/device";
import { trackEvent } from "@/lib/analyticsClient";
import { DEVICE_ID_KEY, HAS_VOTED_KEY } from "./constants";

type Gender = "male" | "female" | null;

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
    const trimmed = onlyDigits.slice(0, 3);

    setAge(trimmed);

    if (trimmed === "") {
      setAgeError("");
      return;
    }

    const numericAge = Number(trimmed);
    if (numericAge < 16) {
      setAgeError("You are under 16.");
    } else if (numericAge > 120) {
      setAgeError("Please add valid age.");
    } else {
      setAgeError("");
    }
  };

  const isStartDisabled =
    !gender || !age || Number(age) < 16 || Number(age) > 120 || ageError !== "";

  const resetForm = () => {
    setGender(null);
    setAge("");
    setAgeError("");
  };

  const handleClose = () => {
    // user manually closed FIRST modal
    trackEvent("user_info_modal_closed", {
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

    // moving to question step – second screen will log its own events
    resetForm();
    setOpen(false);
    setSecondsLeft(0);

    router.push(`/poll?${params.toString()}`);
  };

  // deviceId + "poll_opened"
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

    trackEvent("poll_opened", {
      deviceId: storedDeviceId,
      context: { screen: "home" },
    });
  }, []);

  // respect global "one vote per device" flag
  useEffect(() => {
    if (!ENFORCE_SINGLE_VOTE) return;
    setHasVoted(hasDeviceVoted());
  }, []);

  // live stats for pie chart
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

  // countdown + timeout for FIRST modal
  useEffect(() => {
    if (!open) return;

    setSecondsLeft(120);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          // user info modal timed out
          trackEvent("user_info_modal_timeout", {
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
  }, [open, deviceId, gender, age]);

  const handleOpenPoll = () => {
    if (ENFORCE_SINGLE_VOTE && hasVoted) {
      setAlreadyVotedMessage(
        "You have already participated in this poll from this device."
      );
      return;
    }
    setAlreadyVotedMessage("");

    trackEvent("user_info_modal_opened", {
      deviceId,
      context: { screen: "home" },
    });

    setOpen(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-8">
        {/* Question card at top */}
        <div className="px-3 sm:px-4 md:px-8 w-full max-w-4xl">
          <QuestionCard />
        </div>

        {/* Main Call To Action */}
        <button
          onClick={handleOpenPoll}
          className="px-8 py-4 text-2xl font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          আপনার মতামত দিন
        </button>

        {ENFORCE_SINGLE_VOTE && alreadyVotedMessage && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded-lg shadow">
            {alreadyVotedMessage}
          </div>
        )}

        {/* First-step modal (user info) */}
        <UserInfoModel
          open={open}
          gender={gender}
          age={age}
          ageError={ageError}
          secondsLeft={secondsLeft}
          isStartDisabled={isStartDisabled}
          onGenderChange={(g) => setGender(g)}
          onAgeChange={handleAgeChange}
          onClose={handleClose}
          onStart={handleStartPoll}
        />

        {/* Results pie chart */}
        <PollResultsPie yesVotes={yesVotes} noVotes={noVotes} />
      </div>
    </div>
  );
}
