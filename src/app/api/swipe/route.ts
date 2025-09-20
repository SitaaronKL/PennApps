import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { targetId, didLike } = body;

    if (!targetId || typeof didLike !== 'boolean') {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Get current user ID
    const userResult = await db.query(
      "SELECT id FROM app_users WHERE google_id = $1",
      [token.sub]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Use the stored procedure to handle swipe and potential matching
    const result = await db.query(
      "SELECT * FROM like_and_maybe_match($1, $2, $3)",
      [userId, targetId, didLike]
    );

    const { matched, match_id } = result.rows[0];

    return NextResponse.json({ 
      matched: Boolean(matched), 
      matchId: match_id,
      swiped: true 
    });
  } catch (error) {
    console.error("Error processing swipe:", error);
    return NextResponse.json(
      { error: "Failed to process swipe" },
      { status: 500 }
    );
  }
}