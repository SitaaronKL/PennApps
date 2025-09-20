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

    // Get all matches for the user
    const matchesResult = await db.query(
      `SELECT m.id, m.created_at,
              CASE 
                WHEN m.user_a = $1 THEN u2.id
                ELSE u1.id
              END as match_user_id,
              CASE 
                WHEN m.user_a = $1 THEN u2.name
                ELSE u1.name
              END as match_name,
              CASE 
                WHEN m.user_a = $1 THEN u2.avatar_url
                ELSE u1.avatar_url
              END as match_avatar_url
       FROM matches m
       JOIN app_users u1 ON m.user_a = u1.id
       JOIN app_users u2 ON m.user_b = u2.id
       WHERE m.user_a = $1 OR m.user_b = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );

    const matches = matchesResult.rows.map(row => ({
      id: row.id,
      userId: row.match_user_id,
      name: row.match_name,
      avatar_url: row.match_avatar_url,
      created_at: row.created_at
    }));

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}