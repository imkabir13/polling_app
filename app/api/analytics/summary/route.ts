// app/api/analytics/summary/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    const analytics = db.collection("analyticsEvents");
    const pollResponses = db.collection("pollResponses");

    // -------- Funnel counts by type --------
    const funnelAgg = await analytics
      .aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])
      .toArray();

    const funnel = {
      pollOpened: 0,
      userInfoModalOpened: 0,
      userInfoModalClosed: 0,
      userInfoModalTimeout: 0,
      pollQuestionModalOpened: 0,
      pollQuestionModalClosed: 0,
      pollQuestionModalTimeout: 0,
      voteSubmitted: 0,
      voteNotSubmitted: 0,
    };

    for (const row of funnelAgg) {
      switch (row._id) {
        case "poll_opened":
          funnel.pollOpened = row.count;
          break;
        case "user_info_modal_opened":
          funnel.userInfoModalOpened = row.count;
          break;
        case "user_info_modal_closed":
          funnel.userInfoModalClosed = row.count;
          break;
        case "user_info_modal_timeout":
          funnel.userInfoModalTimeout = row.count;
          break;
        case "poll_question_modal_opened":
          funnel.pollQuestionModalOpened = row.count;
          break;
        case "poll_question_modal_closed":
          funnel.pollQuestionModalClosed = row.count;
          break;
        case "poll_question_modal_timeout":
          funnel.pollQuestionModalTimeout = row.count;
          break;
        case "vote_submitted":
          funnel.voteSubmitted = row.count;
          break;
        case "vote_not_submitted":
          funnel.voteNotSubmitted = row.count;
          break;
        default:
          break;
      }
    }

    // -------- Votes by answer / gender / total --------
    const totalVotes = await pollResponses.countDocuments();

    const votesByAnswer = await pollResponses
      .aggregate([{ $group: { _id: "$answer", count: { $sum: 1 } } }])
      .toArray();

    const votesByGender = await pollResponses
      .aggregate([{ $group: { _id: "$gender", count: { $sum: 1 } } }])
      .toArray();

    return NextResponse.json({
      funnel,
      totalVotes,
      votesByAnswer,
      votesByGender,
    });
  } catch (err: any) {
    console.error("Error fetching analytics summary:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch summary",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
