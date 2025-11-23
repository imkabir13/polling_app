import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      ok: true,
      collections: collections.map((c) => c.name),
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message) }, { status: 500 });
  }
}
