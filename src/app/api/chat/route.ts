import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.name) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userName = token.name;
  const safeUserName = userName.replace(/[^a-zA-Z0-9]/g, '_');

  const userProfileDir = path.join(
    process.cwd(),
    "src",
    "app",
    "api",
    "user_profiles"
  );
  const userProfilePath = path.join(
    userProfileDir,
    `digital-fingerprint-${safeUserName}.json`
  );

  try {
    const { question: userQuestion } = await req.json();
    if (!userQuestion || typeof userQuestion !== 'string') {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Load the digital fingerprint
    let userProfileContent: string;
    try {
      userProfileContent = await fs.readFile(userProfilePath, "utf-8");
    } catch (readError) {
      console.error("Error reading user profile:", readError);
      return NextResponse.json(
        { error: "User profile not found. Please generate your profile first." },
        { status: 404 }
      );
    }

    const userProfile = JSON.parse(userProfileContent);
    const digitalFingerprint = userProfile.fingerprint;

    // Construct the prompt for Gemini
    const prompt = `You are an AI assistant designed to answer questions about a user's digital fingerprint. The user's digital fingerprint contains information about their YouTube subscriptions, liked videos, watch later list, playlists, and sent emails. Here is the digital fingerprint:

${JSON.stringify(digitalFingerprint, null, 2)}

Based on this digital fingerprint, answer the following question from the user:

User Question: ${userQuestion}

Provide a concise and helpful answer based *only* on the provided digital fingerprint. If the information is not available in the fingerprint, state that you cannot answer the question based on the provided data.`;

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY as string
    );
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const geminiResponse = await result.response;
    const answer = geminiResponse.text();

    return NextResponse.json({ answer });

  } catch (error: unknown) {
    console.error("Error in chat API:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to process chat request", details },
      { status: 500 }
    );
  }
}
