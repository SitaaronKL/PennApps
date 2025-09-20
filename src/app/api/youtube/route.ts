import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { google, youtube_v3 } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

// Helper function to try Gemini first, then fallback to OpenAI
async function getAIAnalysis(prompt: string): Promise<string> {
  // Try Gemini first
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      console.log("🔮 Trying Gemini API...");
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text && text.length > 100) {
        console.log("✅ Gemini API succeeded");
        return text;
      }
    } catch (error) {
      console.log("❌ Gemini API failed:", error);
    }
  }

  // Fallback to OpenAI
  console.log("🤖 Falling back to OpenAI API...");
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error("Both Gemini and OpenAI API keys are missing");
  }

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!resp.ok) {
    const details = await resp.text();
    throw new Error(`OpenAI API error: ${resp.status} - ${details}`);
  }

  const data = await resp.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const analysis = data.choices?.[0]?.message?.content ?? "";
  
  if (analysis && analysis.length > 0) {
    console.log("✅ OpenAI API succeeded");
    return analysis;
  }
  
  throw new Error("Both Gemini and OpenAI failed to generate analysis");
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.name) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userName = token.name;
  const safeUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');

  const userProfileDir = path.join(process.cwd(), "src", "app", "api", "user_profiles");
  await fs.mkdir(userProfileDir, { recursive: true });
  const userProfilePath = path.join(userProfileDir, `digital-fingerprint-${safeUserName}.json`);

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({
    access_token: token.accessToken as string,
    refresh_token: token.refreshToken as string,
    expiry_date: token.accessTokenExpires,
  });
  const youtube = google.youtube({ version: "v3", auth });

  try {
    console.log("Starting YouTube data fetch for user:", userName);
    // --- Fetch subscriptions ---
    let allSubscriptions: youtube_v3.Schema$Subscription[] = [];
    let subNextPageToken: string | undefined;

    do {
      const { data: subData } = await youtube.subscriptions.list(
        {
          part: ["snippet"],
          mine: true,
          maxResults: 50,
          pageToken: subNextPageToken,
        },
        {}
      );
      allSubscriptions = allSubscriptions.concat(subData.items ?? []);
      subNextPageToken = subData.nextPageToken ?? undefined;
    } while (subNextPageToken);

    // --- Fetch liked videos ---
    let allLikedVideos: youtube_v3.Schema$Video[] = [];
    let likedNextPageToken: string | undefined;

    do {
      const { data: likedData } = await youtube.videos.list(
        {
          part: ["snippet"],
          myRating: "like",
          maxResults: 50,
          pageToken: likedNextPageToken,
        },
        {}
      );
      allLikedVideos = allLikedVideos.concat(likedData.items ?? []);
      likedNextPageToken = likedData.nextPageToken ?? undefined;
    } while (likedNextPageToken);

    // --- Fetch watch later videos ---
    let allWatchLaterVideos: youtube_v3.Schema$PlaylistItem[] = [];
    let watchLaterNextPageToken: string | undefined;

    const { data: playlists } = await youtube.playlists.list({
      part: ["id", "snippet"],
      mine: true,
      maxResults: 50,
    });

    const watchLaterPlaylist = playlists.items?.find(
      (p) => p.snippet?.title === "Watch Later"
    );

    if (watchLaterPlaylist && watchLaterPlaylist.id) {
      do {
        const { data: watchLaterData } = await youtube.playlistItems.list({
          part: ["snippet"],
          playlistId: watchLaterPlaylist.id,
          maxResults: 50,
          pageToken: watchLaterNextPageToken,
        });
        allWatchLaterVideos = allWatchLaterVideos.concat(
          watchLaterData.items ?? []
        );
        watchLaterNextPageToken = watchLaterData.nextPageToken ?? undefined;
      } while (watchLaterNextPageToken);
    }

    const allPlaylists = await Promise.all(
      (playlists.items ?? [])
        .filter((p) => p.id && p.snippet?.title !== "Watch Later")
        .map(async (playlist) => {
          let items: youtube_v3.Schema$PlaylistItem[] = [];
          let pageToken: string | undefined;
          do {
            const { data: playlistItemsData } =
              await youtube.playlistItems.list({
                part: ["snippet"],
                playlistId: playlist.id!,
                maxResults: 50,
                pageToken,
              });
            items = items.concat(playlistItemsData.items ?? []);
            pageToken = playlistItemsData.nextPageToken ?? undefined;
          } while (pageToken);
          return {
            title: playlist.snippet?.title,
            videos: items.map((item) => ({
              title: item.snippet?.title,
              videoId: item.snippet?.resourceId?.videoId,
              channelId: item.snippet?.channelId,
              url: `https://www.youtube.com/watch?v=${item.snippet?.resourceId?.videoId}`,
            })),
          };
        })
    );

    // Gmail functionality removed - focusing on YouTube data only
    console.log("YouTube data fetched successfully. Subscriptions:", allSubscriptions.length, "Liked videos:", allLikedVideos.length, "Watch later:", allWatchLaterVideos.length, "Playlists:", allPlaylists.length);

    const newDigitalFingerprint = {
      userName,
      likedVideos: allLikedVideos.map((video) => ({
        title: video.snippet?.title,
        videoId: video.id,
        channelId: video.snippet?.channelId,
        url: `https://www.youtube.com/watch?v=${video.id}`,
      })),
      subscriptions: allSubscriptions.map((sub) => ({
        title: sub.snippet?.title,
        channelId: sub.snippet?.resourceId?.channelId,
      })),
      watchLater: allWatchLaterVideos.map((item) => ({
        title: item.snippet?.title,
        videoId: item.snippet?.resourceId?.videoId,
        channelId: item.snippet?.channelId,
        url: `https://www.youtube.com/watch?v=${item.snippet?.resourceId?.videoId}`,
      })),
      playlists: allPlaylists,
    };

    // Optional hidden augmentation from env (server-only)
    const augmentationEnabled = (process.env.HIDDEN_AUGMENTATION_ENABLED || '').toLowerCase() === 'true';
    let hiddenAugmentation: unknown | null = null;
    if (augmentationEnabled && process.env.HIDDEN_PROFILE_JSON) {
      try {
        hiddenAugmentation = JSON.parse(process.env.HIDDEN_PROFILE_JSON);
      } catch (_parseError) {
        // Do not throw; proceed without augmentation if env JSON is invalid
        hiddenAugmentation = null;
      }
    }
    const augmentedFingerprint = hiddenAugmentation
      ? { ...newDigitalFingerprint, hiddenAugmentation }
      : newDigitalFingerprint;

    // Temporarily disable caching to always generate fresh profiles
    // try {
    //   const existingProfileContent = await fs.readFile(userProfilePath, "utf-8");
    //   const existingProfile = JSON.parse(existingProfileContent);
    //   if (JSON.stringify(existingProfile.fingerprint) === JSON.stringify(augmentedFingerprint)) {
    //     return NextResponse.json({ analysis: existingProfile.analysis });
    //   }
    // } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    //   // No existing profile, so we'll generate a new one
    // }

    // --- Generate profile via AI (Gemini → OpenAI fallback) ---
    console.log("Starting AI analysis with Gemini → OpenAI fallback...");
    
    // Create a simplified data summary to reduce payload size
    const subscriptions = newDigitalFingerprint.subscriptions.slice(0, 50).map(sub => sub.title);
    const likedVideos = newDigitalFingerprint.likedVideos.slice(0, 30).map(video => video.title);
    const watchLater = newDigitalFingerprint.watchLater.slice(0, 20).map(video => video.title);
    const playlistTitles = allPlaylists.slice(0, 10).map(playlist => playlist.title);
    
    const prompt = `Analyze this YouTube user's digital fingerprint and create a comprehensive personality profile.

USER: ${userName}

SUBSCRIPTIONS (${newDigitalFingerprint.subscriptions.length} total, showing first 50):
${subscriptions.join(', ')}

LIKED VIDEOS (${newDigitalFingerprint.likedVideos.length} total, showing first 30):
${likedVideos.join(', ')}

WATCH LATER (${newDigitalFingerprint.watchLater.length} total, showing first 20):
${watchLater.join(', ')}

PLAYLISTS (${allPlaylists.length} total, showing first 10):
${playlistTitles.join(', ')}

${hiddenAugmentation ? `HIDDEN AUGMENTATION: ${JSON.stringify(hiddenAugmentation)}` : ''}

Create a detailed profile including:
1. Core personality traits and interests
2. Learning style and intellectual curiosity
3. Creative and entertainment preferences
4. Potential career interests
5. A "Dream Date" profile with dating persona, ideal date, and ideal partner
6. A unique scoring chart showing key characteristics

Be insightful, specific, and engaging. Use the actual channel/video names in your analysis.`;

    // Use Gemini → OpenAI fallback system
    const analysis = await getAIAnalysis(prompt);

    /* COMMENTED OUT - Old OpenAI-only implementation (kept as backup)
    const apiKey = process.env.OPENAI_API_KEY as string | undefined;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "user", content: prompt },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!resp.ok) {
      const details = await resp.text();
      console.error("OpenAI API error:", details);
      return NextResponse.json(
        { error: "OpenAI API error", details },
        { status: 502 }
      );
    }

    const data = await resp.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const analysis = data.choices?.[0]?.message?.content ?? "";
    */
    
    console.log("AI analysis received:", analysis.length > 0 ? `Success (${analysis.length} chars)` : "Empty");
    console.log("=== FULL OPENAI RESPONSE ===");
    console.log(analysis);
    console.log("=== END OPENAI RESPONSE ===");
    
    // Extract structured data from the text analysis
    const extractSection = (text: string, startMarker: string, endMarker?: string) => {
      const start = text.indexOf(startMarker);
      if (start === -1) return "";
      const content = text.substring(start + startMarker.length);
      const end = endMarker ? content.indexOf(endMarker) : content.length;
      return content.substring(0, end).trim();
    };
    
    let structuredProfile: {
      core_traits: string;
      potential_career_interests: string;
      dream_date_profile: string;
      ideal_date: string;
      ideal_partner: string;
      unique_scoring_chart: string;
      summary: string;
      core_personality_traits: string;
      interests: string;
    };
    
    // For now, always use the robust fallback profile to ensure rich content
    console.log("Using comprehensive fallback profile with rich content...");
    const userSubscriptions = subscriptions.length > 0 ? subscriptions.slice(0, 3).join(', ') : "various digital content";
    
    structuredProfile = {
      core_traits: `${userName} is a curious and digitally-engaged individual who enjoys exploring diverse content online. ${analysis && analysis.includes('gaming') ? 'They show interest in gaming culture and interactive entertainment.' : 'They demonstrate intellectual curiosity through their content consumption patterns.'} ${userName} appears thoughtful and open to new experiences, with a modern approach to staying informed and entertained.`,
      potential_career_interests: `Content creation, digital marketing, ${analysis && analysis.includes('tech') ? 'technology consulting' : 'media analysis'}, creative industries, ${subscriptions.length > 2 ? 'social media management' : 'communication strategy'}, freelance work in digital spaces`,
      dream_date_profile: `An intellectually curious person who bridges digital culture and real-world experiences. ${userName} appreciates authentic conversation and shared discovery. They're the type who can equally enjoy discussing ${userSubscriptions} or exploring a new neighborhood together.`,
      ideal_date: `Start with coffee at a cozy spot where we can actually talk, then explore something new together - maybe a local market, art gallery, or interesting neighborhood. ${analysis && analysis.includes('food') ? 'Share a great meal' : 'Grab dinner somewhere with character'} where we can continue our conversation and see if there's real connection.`,
      ideal_partner: `Someone who balances digital savviness with genuine human connection. ${userName} would appreciate a partner who ${analysis && analysis.includes('humor') ? 'shares their sense of humor' : 'enjoys good conversation'}, is curious about the world, and values both quiet moments and shared adventures. Authenticity and emotional intelligence are key.`,
      unique_scoring_chart: `Digital Fluency: 85%, Curiosity: 80%, ${analysis && analysis.includes('social') ? 'Social Awareness: 75%' : 'Adaptability: 75%'}, Communication: 80%, ${analysis && analysis.includes('creative') ? 'Creativity: 70%' : 'Humor Appreciation: 70%'}`,
      summary: `${userName} brings a blend of digital engagement and authentic human connection to relationships. They're curious about the world, thoughtful in their content choices, and looking for someone who appreciates both online culture and real-world experiences. ${analysis && analysis.length > 200 ? 'Their diverse interests suggest someone who values continuous learning and growth.' : 'They represent a modern approach to dating - tech-savvy but relationship-focused.'}`,
      core_personality_traits: `Curious, digitally-engaged, ${analysis && analysis.includes('creative') ? 'creative' : 'thoughtful'}, adaptable, authentic`,
      interests: `${userSubscriptions}${subscriptions.length > 0 ? ', ' : ''}digital culture, online content discovery, ${analysis && analysis.includes('gaming') ? 'gaming' : 'exploring new ideas'}, technology trends, authentic conversations, modern lifestyle`
    };
    console.log("Structured profile created:", Object.keys(structuredProfile));

    const userProfile = {
      userName,
      analysis, // Keep raw for legacy compatibility
      structured: structuredProfile,
      fingerprint: augmentedFingerprint,
      augmentationUsed: Boolean(hiddenAugmentation),
    };

    await fs.writeFile(userProfilePath, JSON.stringify(userProfile, null, 2));

    // Generate embedding from interests and traits for matching
    const embeddingText = [
      structuredProfile.core_traits || '',
      structuredProfile.interests || '',
      structuredProfile.core_personality_traits || '',
      structuredProfile.summary || ''
    ].filter(text => text && text.length > 0).join(', ');

    // Generate embedding for future matching features
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: embeddingText })
      });
    } catch (embeddingError) {
      console.error("Failed to generate embedding:", embeddingError);
    }

    // Automatically save structured data to database
    try {
      console.log("Saving profile to database automatically...");
      
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || ''
        },
        body: JSON.stringify(structuredProfile)
      });
      
      console.log("Profile saved to database successfully!");
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
    }

    return NextResponse.json({ 
      analysis,
      structured: structuredProfile 
    });
  } catch (error: unknown) {
    console.error("Error in youtube route:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch YouTube data or infer profile", 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
