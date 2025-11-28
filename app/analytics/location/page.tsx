"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LocationData {
  country: string;
  countryCode: string;
  count: number;
}

interface LocationResponse {
  locations: LocationData[];
  totalVotes: number;
}

export default function LocationAnalyticsPage() {
  const [data, setData] = useState<LocationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocationData() {
      try {
        const res = await fetch("/api/analytics/location", {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to load location analytics", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLocationData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading location analytics...</p>
          <p className="text-gray-500 text-xs mt-2">
            This may take a moment as we lookup IP locations
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-sm">
          Failed to load location analytics.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.locations.map((l) => l.count), 1);
  const hasLocalVotes = data.locations.some(
    (l) => l.country === "Local/Private Network" || l.country === "Unknown"
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/analytics"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Main Analytics
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">Location Analytics</h1>
      <p className="text-gray-600 text-sm mb-6">
        Votes by Country (Total: {data.totalVotes})
      </p>

      {/* Development Notice */}
      {hasLocalVotes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">
                Development Mode Notice
              </h3>
              <p className="text-sm text-yellow-800">
                You&apos;re seeing &quot;Local/Private Network&quot; or
                &quot;Unknown&quot; because votes are coming from localhost
                (127.0.0.1) or private network IPs. When your app is deployed
                and users vote from real public IP addresses, you&apos;ll see
                actual countries like USA, UK, Pakistan, etc.
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                <strong>In production:</strong> The system will automatically
                detect real countries from voter IP addresses!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Votes by Country</h2>

        {data.locations.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No location data available yet.
          </p>
        ) : (
          <div className="space-y-4">
            {data.locations.map((location, index) => {
              const percentage = (location.count / maxCount) * 100;

              return (
                <div key={index} className="flex items-center gap-4">
                  {/* Country Flag & Name */}
                  <div className="w-40 flex items-center gap-2">
                    <span className="text-2xl">
                      {location.countryCode !== "XX"
                        ? String.fromCodePoint(
                            ...location.countryCode
                              .toUpperCase()
                              .split("")
                              .map((char) => 127397 + char.charCodeAt(0))
                          )
                        : location.country === "Local/Private Network"
                        ? "🏠"
                        : "🌍"}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {location.country}
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 ${
                          location.country === "Local/Private Network" ||
                          location.country === "Unknown"
                            ? "bg-gray-400"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 15 && (
                          <span className="text-white text-sm font-semibold">
                            {location.count}
                          </span>
                        )}
                      </div>
                    </div>

                    {percentage <= 15 && (
                      <span className="text-sm font-semibold text-gray-700 w-8">
                        {location.count}
                      </span>
                    )}
                  </div>

                  {/* Percentage */}
                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-600">
                      {((location.count / data.totalVotes) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Detailed Breakdown</h2>

        {data.locations.length === 0 ? (
          <p className="text-gray-500 text-sm">No data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Rank</th>
                  <th className="text-left py-2 px-3 font-semibold">Country</th>
                  <th className="text-right py-2 px-3 font-semibold">Votes</th>
                  <th className="text-right py-2 px-3 font-semibold">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.locations.map((location, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3 flex items-center gap-2">
                      <span className="text-xl">
                        {location.countryCode !== "XX"
                          ? String.fromCodePoint(
                              ...location.countryCode
                                .toUpperCase()
                                .split("")
                                .map((char) => 127397 + char.charCodeAt(0))
                            )
                          : location.country === "Local/Private Network"
                          ? "🏠"
                          : "🌍"}
                      </span>
                      {location.country}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {location.count}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-600">
                      {((location.count / data.totalVotes) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
