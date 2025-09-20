import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current user ID
    const userResult = await db.query(
      "SELECT id FROM app_users WHERE google_id = $1",
      [token.sub]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].id;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    // Get candidates using the stored procedure
    const candidatesResult = await db.query(
      "SELECT * FROM deck_candidates($1, $2, $3)",
      [userId, limit, offset]
    );

    // Get user details for each candidate
    const candidates = await Promise.all(
      candidatesResult.rows.map(async (candidate) => {
        const userDetails = await db.query(
          "SELECT name, avatar_url FROM app_users WHERE id = $1",
          [candidate.candidate_id]
        );
        
        return {
          id: candidate.candidate_id,
          name: userDetails.rows[0]?.name || "Unknown User",
          avatar_url: userDetails.rows[0]?.avatar_url,
          similarity: candidate.similarity,
          shared_channels: candidate.shared_channels || []
        };
      })
    );

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("Error fetching deck:", error);
    return NextResponse.json(
      { error: "Failed to fetch deck" },
      { status: 500 }
    );
  }
}