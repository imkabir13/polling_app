"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AgeRangeData {
  range: string;
  male: number;
  female: number;
}

interface Summary {
  funnel: {
    voteSubmitted: number;
    voteNotSubmitted: number;
  };
  voteNotSubmittedByGender: { _id: string; count: number }[];
  totalVotes: number;
  votesByAnswer: { _id: string; count: number }[];
  votesByGender: { _id: string; count: number }[];
  yesVotesByAgeAndGender: AgeRangeData[];
  noVotesByAgeAndGender: AgeRangeData[];
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

  const {
    funnel,
    totalVotes,
    votesByAnswer,
    votesByGender,
    voteNotSubmittedByGender,
    yesVotesByAgeAndGender,
    noVotesByAgeAndGender
  } = summary;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Poll Analytics Dashboard</h1>

        {/* Navigation to Location Analytics */}
        <Link
          href="/analytics/location"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
        >
          📍 View Location Analytics
        </Link>
      </div>

      {/* Vote Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Vote Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Vote Not Submitted by Gender</h2>
          <ul className="text-sm space-y-1">
            <li>
              <span className="font-medium">Total:</span> {funnel.voteNotSubmitted}
            </li>
            {voteNotSubmittedByGender.map((v) => (
              <li key={v._id}>
                <span className="font-medium">{v._id || "Unknown"}:</span>{" "}
                {v.count}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Age & Gender Analysis */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Vote Distribution by Age & Gender</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* YES Votes Bar Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-4 text-green-700">YES Votes by Age Range</h3>
            <AgeGenderBarChart data={yesVotesByAgeAndGender} voteType="yes" />
          </div>

          {/* NO Votes Bar Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-4 text-red-700">NO Votes by Age Range</h3>
            <AgeGenderBarChart data={noVotesByAgeAndGender} voteType="no" />
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Total votes recorded: {totalVotes}
      </p>
    </div>
  );
}

function AgeGenderBarChart({
  data,
  voteType,
}: {
  data: AgeRangeData[];
  voteType: "yes" | "no";
}) {
  // Find max value for scaling
  const maxValue = Math.max(
    ...data.map((d) => d.male + d.female),
    1
  );

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const total = item.male + item.female;
        const malePercent = total > 0 ? (item.male / maxValue) * 100 : 0;
        const femalePercent = total > 0 ? (item.female / maxValue) * 100 : 0;

        return (
          <div key={item.range} className="space-y-1">
            <div className="flex justify-between items-center text-xs font-medium text-gray-700">
              <span>{item.range}</span>
              <span className="text-gray-500">
                Total: {total} (M: {item.male}, F: {item.female})
              </span>
            </div>
            <div className="flex gap-1 h-8">
              {/* Male bar */}
              <div
                className={`${
                  voteType === "yes" ? "bg-blue-500" : "bg-blue-400"
                } rounded-l flex items-center justify-center text-white text-xs font-semibold transition-all`}
                style={{ width: `${malePercent}%` }}
              >
                {item.male > 0 && <span>{item.male}</span>}
              </div>
              {/* Female bar */}
              <div
                className={`${
                  voteType === "yes" ? "bg-pink-500" : "bg-pink-400"
                } rounded-r flex items-center justify-center text-white text-xs font-semibold transition-all`}
                style={{ width: `${femalePercent}%` }}
              >
                {item.female > 0 && <span>{item.female}</span>}
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${voteType === "yes" ? "bg-blue-500" : "bg-blue-400"}`}></div>
          <span className="text-xs text-gray-700">Male</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${voteType === "yes" ? "bg-pink-500" : "bg-pink-400"}`}></div>
          <span className="text-xs text-gray-700">Female</span>
        </div>
      </div>
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
