import { NextRequest, NextResponse } from "next/server";

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

  console.log("Poll submission:", {
    sessionId,
    deviceId,
    ip,
    gender,
    age,
    answer,
  });

  return NextResponse.json({ ok: true });
}
