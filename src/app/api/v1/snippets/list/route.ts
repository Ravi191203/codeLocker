import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const COOKIE_NAME = 'session';

// This endpoint is protected and requires a valid JWT
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const language = searchParams.get('lang');
    const sort = searchParams.get('sort');

    const filter: any = {};
    if (language && language !== 'all') {
      filter.language = language;
    }
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ];
    }

    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'a-z':
        sortOption = { name: 1 };
        break;
      case 'z-a':
        sortOption = { name: -1 };
        break;
    }

    const snippets = await Snippet.find(filter).sort(sortOption);
    return NextResponse.json(JSON.parse(JSON.stringify(snippets)));
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
