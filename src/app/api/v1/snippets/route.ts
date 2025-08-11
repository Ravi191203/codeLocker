import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import User from '@/models/User';

export async function GET(request: Request) {
  await dbConnect();
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Authorization header missing or invalid.' }, { status: 401 });
  }

  const apiKey = authHeader.split(' ')[1];
  if (!apiKey) {
    return NextResponse.json({ message: 'API key is missing.' }, { status: 401 });
  }

  const user = await User.findOne({ apiKey });

  if (!user) {
    return NextResponse.json({ message: 'Invalid API key.' }, { status: 401 });
  }

  try {
    const snippets = await Snippet.find({}).sort({ createdAt: -1 });
    return NextResponse.json(snippets, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
