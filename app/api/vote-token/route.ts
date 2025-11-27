// app/api/vote-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateVoteToken } from "@/lib/jwt";
import { z } from "zod";

// Validation schema for token request
const TokenRequestSchema = z.object({
  sessionId: z.string().uuid(),
  gender: z.enum(["male", "female"]),
  age: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = TokenRequestSchema.parse(body);

    // Generate signed token
    const token = await generateVoteToken({
      sessionId: validatedData.sessionId,
      gender: validatedData.gender,
      age: validatedData.age,
    });

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error("Error generating vote token:", err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
