import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();
    const events = db.collection("analyticsEvents");
    const responses = db.collection("pollResponses");

    const [
      pollOpenedCount,
      modalOpenedCount,
      modalTimeoutCount,
      voteSubmittedCount,
      totalVotes,
      votesByAnswer,
      votesByGender,
    ] = await Promise.all([
      events.countDocuments({ eventType: "poll_opened" }),
      events.countDocuments({ eventType: "modal_opened" }),
      events.countDocuments({ eventType: "modal_timeout" }),
      events.countDocuments({ eventType: "vote_submitted" }),
      responses.countDocuments({}),
      responses
        .aggregate([{ $group: { _id: "$answer", count: { $sum: 1 } } }])
        .toArray(),
      responses
        .aggregate([{ $group: { _id: "$gender", count: { $sum: 1 } } }])
        .toArray(),
    ]);

    return NextResponse.json({
      funnel: {
        pollOpened: pollOpenedCount,
        modalOpened: modalOpenedCount,
        modalTimeout: modalTimeoutCount,
        voteSubmitted: voteSubmittedCount,
      },
      totalVotes,
      votesByAnswer,
      votesByGender,
    });
  } catch (err: any) {
    console.error("Error fetching analytics summary:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch analytics summary",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
