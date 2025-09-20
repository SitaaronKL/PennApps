import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import db, { User, UserProfile } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subs, likes, pref_vec } = body;

    // First, ensure user exists
    const userResult = await db.query(
      `INSERT INTO app_users (google_id, email, name, avatar_url) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (google_id) DO UPDATE SET 
         email = EXCLUDED.email,
         name = EXCLUDED.name,
         avatar_url = EXCLUDED.avatar_url
       RETURNING id`,
      [token.sub, token.email, token.name, token.picture]
    );

    const userId = userResult.rows[0].id;

    // Insert or update user profile
    await db.query(
      `INSERT INTO user_profiles (user_id, pref_vec, subs, likes, subs_count, likes_count, last_synced)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         pref_vec = EXCLUDED.pref_vec,
         subs = EXCLUDED.subs,
         likes = EXCLUDED.likes,
         subs_count = EXCLUDED.subs_count,
         likes_count = EXCLUDED.likes_count,
         last_synced = NOW()`,
      [userId, pref_vec, subs, likes, subs.length, likes.length]
    );

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.query(
      `SELECT u.*, p.* FROM app_users u 
       LEFT JOIN user_profiles p ON u.id = p.user_id 
       WHERE u.google_id = $1`,
      [token.sub]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}