import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current user's profile
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', token.sub)
      .maybeSingle();

    if (currentUserError) {
      console.error('Error fetching current user:', currentUserError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!currentUser) {
      return NextResponse.json({ 
        error: "Please create your profile first by going to 'Refresh Profile' section" 
      }, { status: 404 });
    }

    // Get all other users with complete profiles
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('google_id', token.sub)
      .not('core_traits', 'is', null)
      .not('ideal_partner', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Calculate compatibility scores using AI
    const usersWithScores = await Promise.all(
      allUsers.map(async (user) => {
        const compatibilityScore = await calculateCompatibilityScore(currentUser, user);
        return {
          id: user.id,
          name: user.name,
          avatar_url: user.avatar_url,
          core_traits: user.core_traits,
          dream_date_profile: user.dream_date_profile,
          ideal_partner: user.ideal_partner,
          interests: user.interests,
          compatibility_score: compatibilityScore.score,
          compatibility_reasons: compatibilityScore.reasons,
          personality_match: compatibilityScore.personality_match,
          interests_match: compatibilityScore.interests_match,
          dating_goals_match: compatibilityScore.dating_goals_match
        };
      })
    );

    // Sort by compatibility score (highest first)
    usersWithScores.sort((a, b) => b.compatibility_score - a.compatibility_score);

    return NextResponse.json({ users: usersWithScores });
  } catch (error) {
    console.error("Error in discover route:", error);
    return NextResponse.json(
      { error: "Failed to fetch discover users" },
      { status: 500 }
    );
  }
}

// Helper function for Gemini → OpenAI fallback (same as youtube route)
async function getCompatibilityAI(prompt: string): Promise<string> {
  // Try Gemini first
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      console.log("🔮 Trying Gemini for compatibility analysis...");
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(prompt + "\n\nIMPORTANT: Return ONLY valid JSON, no other text.");
      const response = await result.response;
      const text = response.text();
      
      if (text && text.length > 20) {
        console.log("✅ Gemini compatibility analysis succeeded");
        return text;
      }
    } catch (error) {
      console.log("❌ Gemini compatibility analysis failed:", error);
    }
  }

  // Fallback to OpenAI
  console.log("🤖 Falling back to OpenAI for compatibility...");
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error("Both Gemini and OpenAI API keys are missing");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a dating compatibility expert. You MUST respond with ONLY valid JSON, no other text." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" }
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const analysis = data.choices?.[0]?.message?.content ?? "";
  
  if (analysis && analysis.length > 0) {
    console.log("✅ OpenAI compatibility analysis succeeded");
    return analysis;
  }
  
  throw new Error("Both Gemini and OpenAI failed to generate compatibility analysis");
}

async function calculateCompatibilityScore(currentUser: any, targetUser: any) {
  try {
    const prompt = `You are a dating compatibility expert. Analyze these two users and provide a compatibility assessment.

User 1 (Current User):
- Core Traits: ${currentUser.core_traits || 'Not provided'}
- Dating Persona: ${currentUser.dream_date_profile || 'Not provided'}
- Ideal Partner: ${currentUser.ideal_partner || 'Not provided'}
- Interests: ${currentUser.interests || 'Not provided'}

User 2 (Potential Match):
- Core Traits: ${targetUser.core_traits || 'Not provided'}
- Dating Persona: ${targetUser.dream_date_profile || 'Not provided'}  
- Ideal Partner: ${targetUser.ideal_partner || 'Not provided'}
- Interests: ${targetUser.interests || 'Not provided'}

Return ONLY valid JSON with this structure:
{
  "score": 85,
  "reasons": ["Shared love of creativity", "Similar humor styles", "Compatible energy levels"],
  "personality_match": 90,
  "interests_match": 80,
  "dating_goals_match": 85
}

Score should be 0-100. Reasons should be specific compatibility factors.`;

    const rawAnalysis = await getCompatibilityAI(prompt);
    
    try {
      const parsed = JSON.parse(rawAnalysis);
      return {
        score: Math.max(0, Math.min(100, parsed.score || 50)),
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : ["General compatibility"],
        personality_match: Math.max(0, Math.min(100, parsed.personality_match || 50)),
        interests_match: Math.max(0, Math.min(100, parsed.interests_match || 50)),
        dating_goals_match: Math.max(0, Math.min(100, parsed.dating_goals_match || 50))
      };
    } catch (parseError) {
      console.error("Failed to parse compatibility score:", parseError);
      return {
        score: 50,
        reasons: ["Unable to analyze compatibility"],
        personality_match: 50,
        interests_match: 50,
        dating_goals_match: 50
      };
    }
  } catch (error) {
    console.error("Error calculating compatibility:", error);
    return {
      score: 50,
      reasons: ["Error analyzing compatibility"],
      personality_match: 50,
      interests_match: 50,
      dating_goals_match: 50
    };
  }
}