// app/api/analytics/location/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

interface LocationData {
  country: string;
  countryCode: string;
  count: number;
}

async function getCountryFromIP(
  ip: string
): Promise<{ country: string; countryCode: string }> {
  // Check for localhost/private IPs
  if (
    ip === "unknown" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return { country: "Local/Private Network", countryCode: "XX" };
  }

  try {
    // Using ip-api.com free API (no key required, 45 requests/minute limit)
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=country,countryCode`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.log(`Failed to fetch country for IP: ${ip}`);
      return { country: "Unknown", countryCode: "XX" };
    }

    const data = await response.json();

    if (data.status === "fail") {
      console.log(`IP lookup failed for: ${ip}, reason: ${data.message}`);
      return { country: "Unknown", countryCode: "XX" };
    }

    return {
      country: data.country || "Unknown",
      countryCode: data.countryCode || "XX",
    };
  } catch (error) {
    console.error("Error fetching country from IP:", ip, error);
    return { country: "Unknown", countryCode: "XX" };
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const pollResponses = db.collection("pollResponses");

    // Get all poll responses with IP addresses
    const responses = await pollResponses.find({}).toArray();

    if (responses.length === 0) {
      return NextResponse.json({
        locations: [],
        totalVotes: 0,
      });
    }

    // Count votes by IP
    const ipCounts = new Map<string, number>();

    for (const response of responses) {
      const ip = response.ip || "unknown";
      ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
    }

    console.log(`Processing ${ipCounts.size} unique IPs...`);

    // Get country for each unique IP with delay to respect rate limits
    const locationResults: LocationData[] = [];
    const uniqueIPs = Array.from(ipCounts.keys());

    for (let i = 0; i < uniqueIPs.length; i++) {
      const ip = uniqueIPs[i];
      const { country, countryCode } = await getCountryFromIP(ip);

      locationResults.push({
        country,
        countryCode,
        count: ipCounts.get(ip) || 0,
      });

      // Add small delay between requests to respect rate limits (only if not localhost)
      if (
        i < uniqueIPs.length - 1 &&
        !ip.startsWith("127.") &&
        !ip.startsWith("192.168.") &&
        !ip.startsWith("10.")
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Aggregate by country
    const countryMap = new Map<string, LocationData>();

    for (const result of locationResults) {
      const existing = countryMap.get(result.country);
      if (existing) {
        existing.count += result.count;
      } else {
        countryMap.set(result.country, {
          country: result.country,
          countryCode: result.countryCode,
          count: result.count,
        });
      }
    }

    // Convert to array and sort by count (descending)
    const locationData = Array.from(countryMap.values()).sort(
      (a, b) => b.count - a.count
    );

    console.log(`Location breakdown:`, locationData);

    return NextResponse.json({
      locations: locationData,
      totalVotes: responses.length,
    });
  } catch (err: any) {
    console.error("Error fetching location analytics:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch location analytics",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
