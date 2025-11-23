"use client";

import { useEffect, useState } from "react";

interface Summary {
  funnel: {
    pollOpened: number;
    modalOpened: number;
    modalTimeout: number;
    voteSubmitted: number;
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
      <h1 className="text-2xl font-bold mb-6">Poll Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Poll Opened" value={funnel.pollOpened} />
        <StatCard label="Modal Opened" value={funnel.modalOpened} />
        <StatCard label="Modal Timeouts" value={funnel.modalTimeout} />
        <StatCard label="Votes Submitted" value={funnel.voteSubmitted} />
      </div>

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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
