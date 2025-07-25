import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
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
    // Fetch subscriptions
    let allSubscriptions: youtube_v3.Schema$Subscription[] = [];
    let subNextPageToken: string | undefined = undefined;
    do {
      const subResponse = await youtube.subscriptions.list({
        part: ["snippet"],
        mine: true,
        maxResults: 50,
        pageToken: subNextPageToken,
      });
      allSubscriptions = allSubscriptions.concat(subResponse.data.items || []);
      subNextPageToken = subResponse.data.nextPageToken || undefined;
    } while (subNextPageToken);

    // Fetch liked videos
    let allLikedVideos: youtube_v3.Schema$Video[] = [];
    let likedNextPageToken: string | undefined = undefined;
    do {
      const likedResponse = await youtube.videos.list({
        part: ["snippet"],
        myRating: "like",
        maxResults: 50,
        pageToken: likedNextPageToken,
      });
      allLikedVideos = allLikedVideos.concat(likedResponse.data.items || []);
      likedNextPageToken = likedResponse.data.nextPageToken || undefined;
    } while (likedNextPageToken);

    const youtubeData = {
      likedVideos: allLikedVideos.map((video) => video.snippet?.title),
      subscriptions: allSubscriptions.map((sub) => sub.snippet?.title),
    };

    const filePath = path.join(process.cwd(), "youtube.json");
    await fs.writeFile(filePath, JSON.stringify(youtubeData, null, 2));

    const prompt = `
      Based on the following YouTube data, create a detailed and nuanced profile of the user.
      Analyze their subscriptions and liked videos to infer their interests, potential profession, age range, and other relevant personality traits.
      Be mindful of potential biases in the data. For example, liked videos might not always represent genuine interests but could be influenced by trends or social pressure.
      Similarly, subscriptions might not reflect active interests.
      Your analysis should be as objective as possible, avoiding stereotypes and focusing on a holistic understanding of the user.
      Provide a comprehensive summary of your findings, highlighting key insights and potential contradictions in the data.

      ${JSON.stringify(youtubeData)}
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const geminiResponse = await result.response;
    const analysis = geminiResponse.text();

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch YouTube data or infer profile" }, { status: 500 });
  }
}
