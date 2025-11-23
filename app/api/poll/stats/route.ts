// app/api/poll/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection("pollResponses");

    const pipeline = [
      {
        $group: {
          _id: "$answer",
          count: { $sum: 1 },
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    let yesVotes = 0;
    let noVotes = 0;

    for (const row of results) {
      if (row._id === "yes") yesVotes = row.count;
      if (row._id === "no") noVotes = row.count;
    }

    return NextResponse.json({ yesVotes, noVotes });
  } catch (err: any) {
    console.error("Error fetching poll stats:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
