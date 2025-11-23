import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const body = await req.json();
  const { sessionId, gender, age, answer, deviceId } = body;

  if (!sessionId || !gender || !age || !answer) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const collection = db.collection("pollResponses");

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
  } catch (err) {
    console.error("Error saving poll response:", err);
    return NextResponse.json(
      { error: "Failed to save poll response" },
      { status: 500 }
    );
  }
}
