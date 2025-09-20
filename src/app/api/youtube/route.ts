import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { google, youtube_v3 } from "googleapis";
// Replaced Gemini with Cerebras chat completions via REST API
import fs from "fs/promises";
import path from "path";

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

    try {
      const existingProfileContent = await fs.readFile(userProfilePath, "utf-8");
      const existingProfile = JSON.parse(existingProfileContent);
      if (JSON.stringify(existingProfile.fingerprint) === JSON.stringify(augmentedFingerprint)) {
        return NextResponse.json({ analysis: existingProfile.analysis });
      }
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // No existing profile, so we'll generate a new one
    }

    // --- Generate profile via Cerebras ---
    console.log("Starting Cerebras analysis...");
    
    // Create a simplified data summary to reduce payload size
    const subscriptions = newDigitalFingerprint.subscriptions.slice(0, 50).map(sub => sub.title);
    const likedVideos = newDigitalFingerprint.likedVideos.slice(0, 30).map(video => video.title);
    const watchLater = newDigitalFingerprint.watchLater.slice(0, 20).map(video => video.title);
    const playlistTitles = allPlaylists.slice(0, 10).map(playlist => playlist.title);
    
    const prompt = `Create a dating profile for ${userName} based on their YouTube data. Return ONLY valid JSON.

SUBSCRIPTIONS: ${subscriptions.slice(0, 20).join(', ')}
LIKED VIDEOS: ${likedVideos.slice(0, 15).join(', ')}

Return ONLY this JSON structure (no other text):
{
  "core_traits": "Brief personality description",
  "potential_career_interests": "Career interests based on content",
  "dream_date_profile": "Dating persona",
  "ideal_date": "Perfect date description", 
  "ideal_partner": "Ideal partner description",
  "unique_scoring_chart": "Personality breakdown",
  "summary": "Overall summary",
  "core_personality_traits": "Key traits",
  "interests": "Main interests"
}`;
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
          { role: "system", content: "You are a dating app profile generator. You MUST respond with ONLY valid JSON, no other text." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" }
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
    const rawAnalysis = data.choices?.[0]?.message?.content ?? "";
    console.log("Raw AI response:", rawAnalysis);
    
    // Parse the JSON response
    let structuredProfile;
    try {
      // Clean the response in case there's extra text
      const jsonMatch = rawAnalysis.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : rawAnalysis;
      structuredProfile = JSON.parse(jsonText);
      console.log("Parsed structured profile:", structuredProfile);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Raw response:", rawAnalysis);
      
      // Extract information from the text analysis if possible
      const textAnalysis = rawAnalysis;
      structuredProfile = {
        core_traits: textAnalysis.includes("humorous") || textAnalysis.includes("humor") ? "Humorous and witty individual" : "Creative and engaging personality",
        potential_career_interests: textAnalysis.includes("content creation") ? "Content creation, social media, digital marketing" : "Creative industries, technology, media",
        dream_date_profile: textAnalysis.includes("gaming") ? "Fun-loving gamer who enjoys memes and pop culture" : "Creative person who appreciates humor and entertainment",
        ideal_date: textAnalysis.includes("comedy") ? "Comedy show followed by gaming session and good conversation" : "Fun activity where we can laugh and enjoy each other's company",
        ideal_partner: textAnalysis.includes("sarcasm") ? "Someone with great sense of humor who appreciates witty banter and gaming" : "Someone who shares similar interests and enjoys good humor",
        unique_scoring_chart: "Humor: 9/10, Creativity: 8/10, Gaming Interest: 7/10, Social Engagement: 6/10",
        summary: `${userName} is a humor-loving individual with interests in gaming culture, memes, and social commentary`,
        core_personality_traits: textAnalysis.includes("sarcastic") ? "Humorous, sarcastic, appreciates wit" : "Creative, humorous, engaging",
        interests: subscriptions.length > 0 ? subscriptions.slice(0, 5).join(', ') : "Gaming, humor, internet culture"
      };
      console.log("Using fallback profile:", structuredProfile);
    }

    const userProfile = {
      userName,
      analysis: rawAnalysis, // Keep raw for legacy compatibility
      structured: structuredProfile,
      fingerprint: augmentedFingerprint,
      augmentationUsed: Boolean(hiddenAugmentation),
    };

    await fs.writeFile(userProfilePath, JSON.stringify(userProfile, null, 2));

    // Generate embedding from interests and traits for matching
    const embeddingText = [
      ...structuredProfile.core_interests,
      ...structuredProfile.personality_traits,
      ...structuredProfile.compatibility_factors,
      ...structuredProfile.interests_list,
      ...structuredProfile.niches_list
    ].join(', ');

    let embeddingVector = null;
    try {
      const embeddingResp = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: embeddingText })
      });
      const embeddingData = await embeddingResp.json();
      embeddingVector = embeddingData.embedding;
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
      analysis: rawAnalysis,
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
