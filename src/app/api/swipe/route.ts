import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/db";

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

    // Handle like/match logic with real database
    let matched = false;
    let matchId = null;

    if (didLike) {
      // Create or update the like record
      const { error: likeError } = await supabase
        .from('likes')
        .upsert({
          user_id: userId,
          target_id: targetId,
          liked: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,target_id'
        });

      if (likeError) {
        console.error('Error creating like:', likeError);
        return NextResponse.json({ error: "Failed to process like" }, { status: 500 });
      }

      console.log(`✅ User ${userId} liked user ${targetId}`);

      // FOR DEMO: Automatically create mutual like so we always get a match
      const { error: mutualLikeError } = await supabase
        .from('likes')
        .upsert({
          user_id: targetId,
          target_id: userId,
          liked: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,target_id'
        });

      if (mutualLikeError) {
        console.error('Error creating mutual like:', mutualLikeError);
      }

      console.log(`🔄 Auto-created mutual like for demo purposes`);

      // Now we always have a mutual like, so create a match
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: userId,
          user2_id: targetId,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (matchError && !matchError.message.includes('duplicate')) {
        console.error('Error creating match:', matchError);
      } else if (newMatch) {
        matched = true;
        matchId = newMatch.id;
        console.log(`🎉 MATCH CREATED! User ${userId} and ${targetId} matched!`);
      }
    }

    return NextResponse.json({ 
      matched: Boolean(matched), 
      matchId: matchId,
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