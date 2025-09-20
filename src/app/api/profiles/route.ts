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
    
    // First, delete any existing profile for this user to enable refresh
    console.log('Deleting existing profile for user:', token.name);
    await supabase
      .from('users')
      .delete()
      .eq('google_id', token.sub);
    const { 
      core_traits, 
      potential_career_interests, 
      dream_date_profile, 
      ideal_date, 
      ideal_partner, 
      unique_scoring_chart, 
      summary, 
      core_personality_traits, 
      interests 
    } = body;

    console.log('Saving profile to Supabase for user:', token.name);
    console.log('Profile data:', body);

    // Insert fresh user profile (after deleting existing one)
    const { data, error } = await supabase
      .from('users')
      .insert({
        google_id: token.sub,
        email: token.email,
        name: token.name,
        avatar_url: token.picture,
        core_traits,
        potential_career_interests,
        dream_date_profile,
        ideal_date,
        ideal_partner,
        unique_scoring_chart,
        summary,
        core_personality_traits,
        interests
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Profile saved successfully to Supabase:', data);
    return NextResponse.json({ success: true, userId: data.id, user: data });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile", details: error instanceof Error ? error.message : String(error) },
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', token.sub)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}