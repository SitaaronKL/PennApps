import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: token.accessToken as string });
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "in:sent",
      maxResults: 20,
    });

    const messages = response.data.messages || [];
    const emails = await Promise.all(
      messages.map(async (message) => {
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

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
