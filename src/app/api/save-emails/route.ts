import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const emails = await req.json();
    const filePath = path.join(process.cwd(), 'gmail-analysis.json');
    await fs.writeFile(filePath, JSON.stringify(emails, null, 2));
    return NextResponse.json({ message: 'Emails saved successfully' });
  } catch (error) {
    console.error('Error saving emails:', error);
    return NextResponse.json({ error: 'Failed to save emails' }, { status: 500 });
  }
}
