import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not found");
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    console.log("Generating embedding for text:", text.substring(0, 100) + "...");
    
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI embedding error:", errorText);
      return NextResponse.json({ error: "OpenAI embedding failed" }, { status: 500 });
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    console.log("Embedding generated successfully, length:", embedding.length);
    return NextResponse.json({ embedding });
  } catch (error) {
    console.error("Error generating embedding:", error);
    return NextResponse.json(
      { error: "Failed to generate embedding", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}