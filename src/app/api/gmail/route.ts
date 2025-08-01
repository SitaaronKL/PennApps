
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

async function getAuthenticatedClient(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    throw new Error('User not authenticated');
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: token.accessToken as string,
    refresh_token: token.refreshToken as string,
  });

  return google.gmail({ version: 'v1', auth });
}

export async function GET(req: NextRequest) {
  try {
    const gmail = await getAuthenticatedClient(req);
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:sent',
      maxResults: 10, // Fetch the 10 most recent sent emails
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      return NextResponse.json({ emails: [] });
    }

    const emailPromises = messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
      });
      const { payload } = msg.data;
      const headers = payload?.headers;
      const subject = headers?.find((header) => header.name === 'Subject')?.value || 'No Subject';
      const from = headers?.find((header) => header.name === 'From')?.value || 'No Sender';
      const snippet = msg.data.snippet || '';

      return { id: msg.data.id, subject, from, snippet };
    });

    const emails = await Promise.all(emailPromises);

    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    return NextResponse.json({ error: 'Failed to fetch sent emails' }, { status: 500 });
  }
}
