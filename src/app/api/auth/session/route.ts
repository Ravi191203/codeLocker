import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const COOKIE_NAME = 'session';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: JSON.parse(JSON.stringify(user)) });
  } catch (error) {
    console.error('Session validation error:', error);
    // Clear invalid cookie
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
