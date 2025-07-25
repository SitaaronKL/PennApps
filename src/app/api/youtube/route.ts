import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token.accessToken as string });

  const youtube = google.youtube({ version: "v3", auth });

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'likedVideos') {
      let allLikedVideos: youtube_v3.Schema$Video[] = [];
      let nextPageToken: string | undefined = undefined;

      do {
        const response = await youtube.videos.list({
          part: ["snippet"],
          myRating: "like",
          maxResults: 50,
          pageToken: nextPageToken,
        });
        allLikedVideos = allLikedVideos.concat(response.data.items || []);
        nextPageToken = response.data.nextPageToken || undefined;
      } while (nextPageToken);

      console.log(JSON.stringify({ likedVideos: allLikedVideos, totalResults: allLikedVideos.length }, null, 2));
      return NextResponse.json({ likedVideos: allLikedVideos, totalResults: allLikedVideos.length });
    } else {
      // Existing logic for fetching subscriptions and inferring profile
      let allSubscriptions: youtube_v3.Schema$Subscription[] = [];
      let nextPageToken: string | undefined = undefined;

      do {
        const response = await youtube.subscriptions.list({
          part: ["snippet"],
          mine: true,
          maxResults: 50,
          pageToken: nextPageToken,
        });
        allSubscriptions = allSubscriptions.concat(response.data.items || []);
        nextPageToken = response.data.nextPageToken || undefined;
      } while (nextPageToken);

      const channelTitles = allSubscriptions.map(sub => sub.snippet.title);

      const prompt = `Based on the following YouTube channel subscriptions, infer the user's interests, hobbies, and general profile. Provide a concise summary:

${channelTitles.join(", ")}`;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const geminiResponse = await result.response;
      const inferredProfile = geminiResponse.text();

      console.log(JSON.stringify({ inferredProfile }, null, 2));
      return NextResponse.json({ inferredProfile });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch YouTube data or infer profile" }, { status: 500 });
  }
}