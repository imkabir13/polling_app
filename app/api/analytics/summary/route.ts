// app/api/analytics/summary/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    const analytics = db.collection("analyticsEvents");
    const pollResponses = db.collection("pollResponses");

    // -------- Vote counts --------
    const voteSubmittedCount = await analytics.countDocuments({ type: "vote_submitted" });
    const voteNotSubmittedCount = await analytics.countDocuments({ type: "vote_not_submitted" });

    const funnel = {
      voteSubmitted: voteSubmittedCount,
      voteNotSubmitted: voteNotSubmittedCount,
    };

    // -------- Vote Not Submitted by Gender --------
    const voteNotSubmittedByGender = await analytics
      .aggregate([
        { $match: { type: "vote_not_submitted" } },
        { $group: { _id: "$context.gender", count: { $sum: 1 } } },
      ])
      .toArray();

    // -------- Votes by answer / gender / total --------
    const totalVotes = await pollResponses.countDocuments();

    const votesByAnswer = await pollResponses
      .aggregate([{ $group: { _id: "$answer", count: { $sum: 1 } } }])
      .toArray();

    const votesByGender = await pollResponses
      .aggregate([{ $group: { _id: "$gender", count: { $sum: 1 } } }])
      .toArray();

    // -------- Age and Gender breakdown for YES and NO votes --------
    const ageRanges = [
      { range: "16-30", min: 16, max: 30 },
      { range: "31-50", min: 31, max: 50 },
      { range: "51-70", min: 51, max: 70 },
      { range: "71-90", min: 71, max: 90 },
      { range: "91-120", min: 91, max: 120 },
    ];

    // YES votes by age and gender
    const yesVotesByAgeAndGender = await Promise.all(
      ageRanges.map(async ({ range, min, max }) => {
        const maleCount = await pollResponses.countDocuments({
          answer: "yes",
          gender: "male",
          age: { $gte: min, $lte: max },
        });
        const femaleCount = await pollResponses.countDocuments({
          answer: "yes",
          gender: "female",
          age: { $gte: min, $lte: max },
        });
        return { range, male: maleCount, female: femaleCount };
      })
    );

    // NO votes by age and gender
    const noVotesByAgeAndGender = await Promise.all(
      ageRanges.map(async ({ range, min, max }) => {
        const maleCount = await pollResponses.countDocuments({
          answer: "no",
          gender: "male",
          age: { $gte: min, $lte: max },
        });
        const femaleCount = await pollResponses.countDocuments({
          answer: "no",
          gender: "female",
          age: { $gte: min, $lte: max },
        });
        return { range, male: maleCount, female: femaleCount };
      })
    );

    return NextResponse.json({
      funnel,
      voteNotSubmittedByGender,
      totalVotes,
      votesByAnswer,
      votesByGender,
      yesVotesByAgeAndGender,
      noVotesByAgeAndGender,
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
