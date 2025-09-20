import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current user ID
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('id')
      .eq('google_id', token.sub)
      .maybeSingle();

    if (currentUserError) {
      console.error('Error fetching current user:', currentUserError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = currentUser.id;

    // Get all matches for the user using the real matches table
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('id, created_at, user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
    }

    // Get user details for each match
    const matches = await Promise.all(
      (matchesData || []).map(async (match) => {
        const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
        
        const { data: otherUser, error: userError } = await supabase
          .from('users')
          .select('id, name, avatar_url')
          .eq('id', otherUserId)
          .single();

        if (userError || !otherUser) {
          console.error('Error fetching user:', userError);
          return null;
        }

        return {
          id: match.id,
          userId: otherUser.id,
          name: otherUser.name,
          avatar_url: otherUser.avatar_url,
          created_at: match.created_at
        };
      })
    ).then(results => results.filter(Boolean));

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}