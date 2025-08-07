import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { google, youtube_v3, gmail_v1 } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  const gmail = google.gmail({ version: "v1", auth });

  try {
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

    // --- Fetch sent emails ---
    console.log("Fetching sent emails...");
    let allMessages: gmail_v1.Schema$Message[] = [];
    let messagesNextPageToken: string | undefined;

    do {
      const { data: gmailData } = await gmail.users.messages.list({
        userId: "me",
        q: "in:sent",
        maxResults: 50,
        pageToken: messagesNextPageToken,
      });
      allMessages = allMessages.concat(gmailData.messages ?? []);
      messagesNextPageToken = gmailData.nextPageToken ?? undefined;
      console.log(`Fetched ${gmailData.messages?.length ?? 0} messages. Next page token: ${messagesNextPageToken}`);
    } while (messagesNextPageToken);
    console.log(`Total sent emails fetched: ${allMessages.length}`);

    const sentEmails = await Promise.all(
        allMessages.map(async (message) => {
            const msg = await gmail.users.messages.get({
                userId: "me",
                id: message.id!,
            });
            const headers = msg.data.payload?.headers;
            const subject = headers?.find((header) => header.name === "Subject")?.value || "";
            const from = headers?.find((header) => header.name === "From")?.value || "";
            return {
                id: msg.data.id,
                subject,
                from,
                snippet: msg.data.snippet,
            };
        })
    );

    // --- Fetch inbox emails ---
    console.log("Fetching inbox emails...");
    const inboxResponse = await gmail.users.messages.list({
        userId: "me",
        q: "in:inbox",
        maxResults: 100, // Fetch up to 100 inbox emails
    });

    const inboxMessages = inboxResponse.data.messages || [];
    const inboxEmails = await Promise.all(
        inboxMessages.map(async (message) => {
            const msg = await gmail.users.messages.get({
                userId: "me",
                id: message.id!,
            });
            const headers = msg.data.payload?.headers;
            const subject = headers?.find((header) => header.name === "Subject")?.value || "";
            const from = headers?.find((header) => header.name === "From")?.value || "";
            return {
                id: msg.data.id,
                subject,
                from,
                snippet: msg.data.snippet,
            };
        })
    );

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
      sentEmails: sentEmails,
      inboxEmails: inboxEmails,
    };

    try {
      const existingProfileContent = await fs.readFile(userProfilePath, "utf-8");
      const existingProfile = JSON.parse(existingProfileContent);
      if (JSON.stringify(existingProfile.fingerprint) === JSON.stringify(newDigitalFingerprint)) {
        return NextResponse.json({ analysis: existingProfile.analysis });
      }
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // No existing profile, so we'll generate a new one
    }

    // --- Generate profile via Gemini ---
    const prompt = `
      Analyze the following YouTube and Gmail data for a user named ${userName} to create a detailed user profile.

      **Long-Term Interests (Subscriptions):**
      This list represents the user's established, long-term interests. These are channels they have actively subscribed to, indicating a deeper level of engagement. Analyze the topics, styles, and themes of these channels to build a foundational understanding of the user's core passions and intellectual pursuits. Consider the channels as a hierarchy of interests, from broader topics to more niche ones.

      ${JSON.stringify(
        newDigitalFingerprint.subscriptions
      )}

      **Short-Term Interests (Liked Videos):**
      This list represents the user's more immediate, short-term interests. These are videos the user has liked, which could be spontaneous discoveries or related to their long-term interests. Use this information to add nuance and detail to the profile, identifying recent trends in their viewing habits and potential new areas of interest.

      ${JSON.stringify(newDigitalFingerprint.likedVideos)}

      **Aspirational Interests (Watch Later):**
      This list represents the user's aspirational interests and learning goals. These are videos the user has saved to watch later, indicating a desire to explore these topics in the future. Analyze these videos to understand what the user wants to learn about and what new skills they may be trying to acquire.

      ${JSON.stringify(newDigitalFingerprint.watchLater)}

      **Organized Interests (Playlists):**
      This list represents the user's self-organized interests. These are playlists created by the user, indicating a deliberate effort to categorize and curate content. Analyze the titles of the playlists and the videos within them to understand how the user structures their knowledge and interests. Look for themes and patterns across playlists to identify broader areas of passion and expertise.

      ${JSON.stringify(allPlaylists)}

      **Communications Analysis (Sent Emails):**
      This is a list of the user's recent sent emails. Analyze the content of these emails to understand their communication style, professional interests, and personal connections. Look for patterns in topics, language, and tone to add another layer of depth to the user profile.

      ${JSON.stringify(newDigitalFingerprint.sentEmails)}

      **Inbox Communications Analysis (Inbox Emails):**
      This is a list of the user's recent inbox emails. Analyze the content of these emails to understand their incoming communications, interests, and interactions. Look for patterns in topics, senders, and content to further enrich the user profile.

      ${JSON.stringify(newDigitalFingerprint.inboxEmails)}

      **Synthesize and Profile:**
      Combine the analysis of all these data points to create a comprehensive and insightful profile of the user. The profile should be well-structured, detailed, and read like a story of their intellectual and entertainment journey. Go beyond a simple list of topics and infer their personality, learning style, and potential future interests. Make it powerful and complex. Do not use asterisks or markdown.

      **Dream Date Profile:**
      Now, using the same data, create a "Dream Date" profile for this user. This should include:
      1.  **Dating Persona:** A description of who the user is in a dating context.
      2.  **The Dream Date:** A detailed plan for a dream date, including the location, activities, and overall ambiance.
      3.  **Ideal Partner:** A description of the user's ideal partner.

      **Revolutionary Scoring Chart:**
      Finally, create a "Revolutionary Scoring Chart" that reveals hidden insights about the user. Instead of traditional scoring, use the data to create a unique and insightful chart that highlights the user's core characteristics and potential for growth. This should be something special and not seen before.

      - For example, you could use a spider chart to visualize the user's "Intellectual Curiosity," "Creative Expression," "Spontaneity," "Emotional Depth," and "Sense of Humor."
      - Or, you could create a "Personality Spectrum" that shows where the user falls on a range of different traits.
      - Be creative and insightful.
    `;
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY as string
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const geminiResponse = await result.response;
    const analysis = geminiResponse.text();

    const userProfile = {
      userName,
      analysis,
      fingerprint: newDigitalFingerprint,
    };

    await fs.writeFile(userProfilePath, JSON.stringify(userProfile, null, 2));

    return NextResponse.json({ analysis });
  } catch (_error: unknown) {
    console.error(_error);
    console.error("Error in youtube route:", _error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data or infer profile", details: _error instanceof Error ? _error.message : String(_error) },
      { status: 500 }
    );
  }
}
