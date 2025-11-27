import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";
import { voteRateLimiter } from "@/lib/ratelimit";
import { MAX_VOTES_PER_IP } from "@/lib/pollConfig";
import { verifyVoteToken } from "@/lib/jwt";

// Input validation schema
const VoteSchema = z.object({
  sessionId: z.string().uuid(),
  deviceId: z.string().uuid().nullable().optional(),
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(16).max(120),
  answer: z.enum(["yes", "no"]),
  voteToken: z.string(), // JWT token required
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
    const { sessionId, gender, age, answer, deviceId, voteToken } = validatedData;

    // SECURITY CHECK: Verify JWT token (prevents Postman/direct API attacks)
    try {
      const tokenPayload = await verifyVoteToken(voteToken);

      // Verify token data matches request data
      if (tokenPayload.sessionId !== sessionId) {
        return NextResponse.json(
          { error: "অননুমোদিত অনুরোধ।" }, // Unauthorized request
          { status: 401 }
        );
      }
      if (tokenPayload.gender !== gender || tokenPayload.age !== String(age)) {
        return NextResponse.json(
          { error: "অননুমোদিত অনুরোধ।" },
          { status: 401 }
        );
      }
    } catch (tokenError: any) {
      console.error("Token verification failed:", tokenError);
      return NextResponse.json(
        { error: "অননুমোদিত অনুরোধ। অনুগ্রহ করে পুনরায় চেষ্টা করুন।" }, // Unauthorized, please try again
        { status: 401 }
      );
    }

    const db = await getDb();
    const collection = db.collection("pollResponses");

    // CHECK 1: IP-based limit (max 20 votes per IP address)
    const ipVoteCount = await collection.countDocuments({ ip });
    if (ipVoteCount >= MAX_VOTES_PER_IP) {
      return NextResponse.json(
        { error: "দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।" },
        { status: 403 }
      );
    }

    // CHECK 2: Device-based blocking (server-side enforcement)
    if (deviceId) {
      const existingVote = await collection.findOne({ deviceId });
      if (existingVote) {
        return NextResponse.json(
          { error: "আপনি ইতিমধ্যে ভোট দিয়ে দিয়েছেন। একজন ভোটার কেবল একবারই ভোট দিতে পারবেন।" },
          { status: 403 }
        );
      }
    }

    // CHECK 3: Session-based blocking (prevent double-submit bugs)
    const existingSession = await collection.findOne({ sessionId });
    if (existingSession) {
      return NextResponse.json(
        { error: "এই সেশন থেকে ইতিমধ্যে ভোট জমা দেওয়া হয়েছে।" },
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
