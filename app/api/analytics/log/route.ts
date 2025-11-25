import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

type AnalyticsEventType =
  | "poll_opened"
  | "user_info_modal_opened"
  | "user_info_modal_closed"
  | "user_info_modal_timeout"
  | "poll_question_modal_opened"
  | "poll_question_modal_closed"
  | "poll_question_modal_timeout"
  | "vote_submitted"
  | "vote_not_submitted";

interface AnalyticsBody {
  type: AnalyticsEventType;
  sessionId?: string | null;
  deviceId: string | null;
  context?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const body = (await req.json()) as AnalyticsBody;
    const { type, sessionId, deviceId, context } = body;

    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("analyticsEvents");

    await collection.insertOne({
      type,
      sessionId: sessionId ?? null,
      deviceId: deviceId ?? null,
      ip,
      context: context ?? {},
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error storing analytics event:", err);
    return NextResponse.json(
      {
        error: "Failed to store analytics event",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
