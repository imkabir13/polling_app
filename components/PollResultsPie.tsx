"use client";

import React from "react";

interface PollResultsPieProps {
  yesVotes: number;
  noVotes: number;
}

export default function PollResultsPie({
  yesVotes,
  noVotes,
}: PollResultsPieProps) {
  const totalVotes = yesVotes + noVotes;

  if (totalVotes === 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-4 w-80 text-center">
        <p className="text-sm text-gray-500">No poll results yet.</p>
      </div>
    );
  }

  const yesPercent = Math.round((yesVotes / totalVotes) * 100);
  const noPercent = 100 - yesPercent;

  const pieStyle = {
    background: `conic-gradient(#16a34a 0 ${yesPercent}%, #dc2626 ${yesPercent}% 100%)`,
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 w-80">
      <h2 className="text-lg font-bold mb-4 text-center">Poll Results</h2>

      {/* Pie chart circle */}
      <div className="flex justify-center mb-4">
        <div className="w-32 h-32 rounded-full" style={pieStyle} />
      </div>

      {/* Legend + numbers */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-600" />
          <span>
            Yes: {yesVotes} ({yesPercent}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-red-600" />
          <span>
            No: {noVotes} ({noPercent}%)
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500 text-right">
        Total votes: {totalVotes}
      </p>
    </div>
  );
}
