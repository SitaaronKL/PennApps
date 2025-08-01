import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { google, youtube_v3 } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token.accessToken as string });
  const youtube = google.youtube({ version: "v3", auth });

  try {
    // --- Fetch subscriptions ---
    let allSubscriptions: youtube_v3.Schema$Subscription[] = [];
    let subNextPageToken: string | undefined;

    do {
      // pass a second `MethodOptions` arg (here `{}`) so TS picks the Promise overload
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

    // First, get the watch later playlist ID
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

    const gmailFilePath = path.join(process.cwd(), "gmail-analysis.json");
    let gmailData = [];
    try {
      const gmailFileContent = await fs.readFile(gmailFilePath, "utf-8");
      gmailData = JSON.parse(gmailFileContent);
    } catch (error) {
      console.error("Error reading gmail-analysis.json:", error);
      // It's okay if the file doesn't exist
      console.log("gmail-analysis.json not found, proceeding without it.");
    }

    // --- Write JSON file ---
    const digitalFingerprint = {
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
      sentEmails: gmailData,
    };
    const filePath = path.join(process.cwd(), "digital-fingerprint.json");
    await fs.writeFile(filePath, JSON.stringify(digitalFingerprint, null, 2));

    // --- Generate profile via Gemini ---
    const prompt = `
      Analyze the following YouTube and Gmail data to create a detailed user profile.

      **Long-Term Interests (Subscriptions):**
      This list represents the user's established, long-term interests. These are channels they have actively subscribed to, indicating a deeper level of engagement. Analyze the topics, styles, and themes of these channels to build a foundational understanding of the user's core passions and intellectual pursuits. Consider the channels as a hierarchy of interests, from broader topics to more niche ones.

      ${JSON.stringify(
        digitalFingerprint.subscriptions
      )}

      **Short-Term Interests (Liked Videos):**
      This list represents the user's more immediate, short-term interests. These are videos the user has liked, which could be spontaneous discoveries or related to their long-term interests. Use this information to add nuance and detail to the profile, identifying recent trends in their viewing habits and potential new areas of interest.

      ${JSON.stringify(digitalFingerprint.likedVideos)}

      **Aspirational Interests (Watch Later):**
      This list represents the user's aspirational interests and learning goals. These are videos the user has saved to watch later, indicating a desire to explore these topics in the future. Analyze these videos to understand what the user wants to learn about and what new skills they may be trying to acquire.

      ${JSON.stringify(digitalFingerprint.watchLater)}

      **Organized Interests (Playlists):**
      This list represents the user's self-organized interests. These are playlists created by the user, indicating a deliberate effort to categorize and curate content. Analyze the titles of the playlists and the videos within them to understand how the user structures their knowledge and interests. Look for themes and patterns across playlists to identify broader areas of passion and expertise.

      ${JSON.stringify(allPlaylists)}

      **Communications Analysis (Sent Emails):**
      This is a list of the user's recent sent emails. Analyze the content of these emails to understand their communication style, professional interests, and personal connections. Look for patterns in topics, language, and tone to add another layer of depth to the user profile.

      ${JSON.stringify(digitalFingerprint.sentEmails)}

      **Synthesize and Profile:**
      Combine the analysis of all these data points to create a comprehensive and insightful profile of the user. The profile should be well-structured, detailed, and read like a story of their intellectual and entertainment journey. Go beyond a simple list of topics and infer their personality, learning style, and potential future interests. Make it powerful and complex.
    `;
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY as string
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const geminiResponse = await result.response;
    const analysis = geminiResponse.text();

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data or infer profile" },
      { status: 500 }
    );
  }
}
