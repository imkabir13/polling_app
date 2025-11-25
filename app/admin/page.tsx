"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Summary {
  funnel: {
    pollOpened: number;
    userInfoModalOpened: number;
    userInfoModalClosed: number;
    userInfoModalTimeout: number;
    pollQuestionModalOpened: number;
    pollQuestionModalClosed: number;
    pollQuestionModalTimeout: number;
    voteSubmitted: number;
    voteNotSubmitted: number;
  };
  totalVotes: number;
  votesByAnswer: { _id: string; count: number }[];
  votesByGender: { _id: string; count: number }[];
}

export default function AdminPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/analytics/summary");
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load analytics summary", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-sm">Failed to load analytics.</p>
      </div>
    );
  }

  const { funnel, totalVotes, votesByAnswer, votesByGender } = summary;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Poll Analytics Dashboard</h1>

        {/* Navigation to Location Analytics */}
        <Link
          href="/admin/location"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
        >
          📍 View Location Analytics
        </Link>
      </div>

      {/* Funnel Metrics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Conversion Funnel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Poll Opened" value={funnel.pollOpened} />
          <StatCard
            label="User Info Modal Opened"
            value={funnel.userInfoModalOpened}
          />
          <StatCard
            label="User Info Modal Closed"
            value={funnel.userInfoModalClosed}
          />
          <StatCard
            label="User Info Modal Timeout"
            value={funnel.userInfoModalTimeout}
          />
          <StatCard
            label="Poll Question Modal Opened"
            value={funnel.pollQuestionModalOpened}
          />
        </div>
      </div>

      {/* Second Row of Funnel */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Poll Question Modal Closed"
            value={funnel.pollQuestionModalClosed}
          />
          <StatCard
            label="Poll Question Modal Timeout"
            value={funnel.pollQuestionModalTimeout}
          />
          <StatCard
            label="Vote Submitted"
            value={funnel.voteSubmitted}
            highlight="green"
          />
          <StatCard
            label="Vote Not Submitted"
            value={funnel.voteNotSubmitted}
            highlight="red"
          />
        </div>
      </div>

      {/* Vote Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Votes by Answer</h2>
          <ul className="text-sm space-y-1">
            {votesByAnswer.map((v) => (
              <li key={v._id}>
                <span className="font-medium">{v._id || "Unknown"}:</span>{" "}
                {v.count}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Votes by Gender</h2>
          <ul className="text-sm space-y-1">
            {votesByGender.map((v) => (
              <li key={v._id}>
                <span className="font-medium">{v._id || "Unknown"}:</span>{" "}
                {v.count}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Total votes recorded: {totalVotes}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: "green" | "red";
}) {
  const bgColor =
    highlight === "green"
      ? "bg-green-50 border-green-200"
      : highlight === "red"
      ? "bg-red-50 border-red-200"
      : "bg-white";

  const textColor =
    highlight === "green"
      ? "text-green-700"
      : highlight === "red"
      ? "text-red-700"
      : "text-gray-900";

  return (
    <div className={`${bgColor} rounded-xl shadow border p-4`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
