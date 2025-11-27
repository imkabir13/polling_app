import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";
import { voteRateLimiter } from "@/lib/ratelimit";

// Input validation schema
const VoteSchema = z.object({
  sessionId: z.string().uuid(),
  deviceId: z.string().uuid().nullable().optional(),
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(17).max(120),
  answer: z.enum(["yes", "no"]),
});

export async function POST(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Rate limiting: Prevent vote spamming
  const { success } = await voteRateLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many votes. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Validate input to prevent NoSQL injection
    const validatedData = VoteSchema.parse(body);
    const { sessionId, gender, age, answer, deviceId } = validatedData;

    const db = await getDb();
    const collection = db.collection("pollResponses");

    // SERVER-SIDE: Enforce one vote per device
    if (deviceId) {
      const existingVote = await collection.findOne({ deviceId });
      if (existingVote) {
        return NextResponse.json(
          { error: "This device has already voted" },
          { status: 403 }
        );
      }
    }

    // Also check sessionId to prevent duplicate submissions
    const existingSession = await collection.findOne({ sessionId });
    if (existingSession) {
      return NextResponse.json(
        { error: "This session has already submitted a vote" },
        { status: 403 }
      );
    }

    await collection.insertOne({
      sessionId,
      deviceId: deviceId ?? null,
      ip,
      gender,
      age,
      answer,
      createdAt: new Date(),
    });

    console.log("Poll submission stored:", {
      sessionId,
      deviceId,
      ip,
      gender,
      age,
      answer,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Handle validation errors
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: err.issues },
        { status: 400 }
      );
    }

    console.error("Error saving poll response:", err);
    return NextResponse.json(
      { error: "Failed to save poll response" },
      { status: 500 }
    );
  }
}
