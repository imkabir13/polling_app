// lib/jwt.ts
import { SignJWT, jwtVerify } from "jose";

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const secret = new TextEncoder().encode(JWT_SECRET);

export interface VoteTokenPayload {
  sessionId: string;
  gender: string;
  age: string;
  iat?: number; // issued at
  exp?: number; // expiration
}

/**
 * Generate a signed JWT token for vote submission
 * Token expires in 2 minutes
 */
export async function generateVoteToken(
  payload: Omit<VoteTokenPayload, "iat" | "exp">
): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2m") // Token expires in 2 minutes
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 * Returns payload if valid, throws error if invalid/expired
 */
export async function verifyVoteToken(token: string): Promise<VoteTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    // Validate payload structure
    if (
      !payload.sessionId ||
      !payload.gender ||
      !payload.age ||
      typeof payload.sessionId !== "string" ||
      typeof payload.gender !== "string" ||
      typeof payload.age !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    return payload as unknown as VoteTokenPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("exp")) {
        throw new Error("Token expired");
      }
      if (error.message.includes("signature")) {
        throw new Error("Invalid token signature");
      }
    }
    throw new Error("Invalid token");
  }
}
