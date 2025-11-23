import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

type AnalyticsEventType =
  | "poll_opened"
  | "modal_opened"
  | "modal_closed"
  | "modal_timeout"
  | "vote_submitted";

interface AnalyticsBody {
  eventType: AnalyticsEventType;
  sessionId?: string | null;
  deviceId: string;
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
    const { eventType, sessionId, deviceId, context } = body;

    if (!eventType || !deviceId) {
      return NextResponse.json(
        { error: "eventType and deviceId are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("analyticsEvents");

    await collection.insertOne({
      eventType,
      sessionId: sessionId ?? null,
      deviceId,
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
