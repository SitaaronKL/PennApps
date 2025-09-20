import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
// Replaced Gemini with Cerebras chat completions via REST API
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
    const prompt = `You are an advanced AI assistant specializing in analyzing digital footprints. Your goal is to provide comprehensive, insightful, and highly detailed answers to user questions based *solely* on the provided digital fingerprint. This fingerprint contains extensive information about the user's YouTube subscriptions, liked videos, watch later list, playlists, sent emails, and inbox emails. 

Here is the user's complete digital fingerprint:

${JSON.stringify(digitalFingerprint, null, 2)}

User Question: ${userQuestion}

Based on this detailed digital fingerprint, provide a thorough and insightful answer to the user's question. 

- **Be comprehensive:** Elaborate on your answers, providing context and drawing connections between different data points within the fingerprint.
- **Be insightful:** Go beyond surface-level observations. Infer patterns, preferences, and potential underlying interests.
- **Be specific:** Refer to concrete examples from the fingerprint (e.g., specific channel names, video titles, email subjects) to support your analysis.
- **Maintain a helpful and analytical tone.**
- **If the information is genuinely not available or cannot be reasonably inferred from the provided fingerprint, clearly state that you cannot answer the question based on the available data, but avoid being dismissive. Suggest what kind of information *would* be needed to answer such a question.**

Your response should be well-structured and easy to read.`;
    const apiKey = process.env.CEREBRAS_API_KEY as string | undefined;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing CEREBRAS_API_KEY" },
        { status: 500 }
      );
    }

    const model = process.env.CEREBRAS_MODEL || "llama-4-scout-17b-16e-instruct";

    const resp = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      const details = await resp.text();
      return NextResponse.json(
        { error: "Cerebras API error", details },
        { status: 502 }
      );
    }

    const data = await resp.json() as {
      choices?: Array<{ message?: { content?: string }, text?: string }>;
    };
    const answer = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? "";

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
