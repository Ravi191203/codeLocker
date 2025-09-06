'use server';

import dbConnect from '@/lib/db';
import Snippet from '@/models/Snippet';
import SnippetVersion from '@/models/SnippetVersion';
import User from '@/models/User';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12);

// --- AUTH ACTIONS ---

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const COOKIE_NAME = 'session';

export async function signup(data: any) {
  try {
    await dbConnect();
    const { email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

    cookies().set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function login(data: any) {
  try {
    await dbConnect();
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: 'Invalid credentials.' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid credentials.' };
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    cookies().set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function logout() {
  cookies().delete(COOKIE_NAME);
  redirect('/login');
}

export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return null;
    return { user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    return null;
  }
}

// --- SNIPPET ACTIONS ---

export async function getSnippets() {
  await dbConnect();
  const snippets = await Snippet.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(snippets));
}

export async function getFilteredSnippets({
  query,
  language,
  sort,
}: {
  query?: string;
  language?: string;
  sort?: string;
}) {
  await dbConnect();

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
  return JSON.parse(JSON.stringify(snippets));
}


export async function addSnippet(data: {
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string;
}) {
  await dbConnect();
  const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  const snippetData = { ...data, tags: tagsArray };

  const newSnippet = new Snippet(snippetData);
  await newSnippet.save();
  revalidatePath('/');
}

export async function updateSnippet(id: string, data: {
    name: string;
    description: string;
    code: string;
    language: string;
    tags: string;
}) {
    await dbConnect();

    const currentSnippet = await Snippet.findById(id);
    if (!currentSnippet) {
        throw new Error('Snippet not found');
    }

    // Create a version from the current state
    const versionData = {
        snippetId: currentSnippet._id,
        name: currentSnippet.name,
        description: currentSnippet.description,
        code: currentSnippet.code,
        language: currentSnippet.language,
        tags: currentSnippet.tags,
    };
    await new SnippetVersion(versionData).save();


    const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const updateData = { ...data, tags: tagsArray };

    await Snippet.findByIdAndUpdate(id, updateData);
    revalidatePath('/');
    revalidatePath(`/s/${currentSnippet.shareId}`);
}

export async function deleteSnippet(id: string) {
  await dbConnect();
  // Using a transaction to ensure both snippet and its versions are deleted
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Snippet.findByIdAndDelete(id, { session });
    await SnippetVersion.deleteMany({ snippetId: id }, { session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
  revalidatePath('/');
}

export async function getSnippetVersions(snippetId: string) {
    await dbConnect();
    const versions = await SnippetVersion.find({ snippetId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(versions));
}

export async function restoreSnippetVersion(versionId: string) {
    await dbConnect();
    const version = await SnippetVersion.findById(versionId);
    if (!version) {
        throw new Error('Version not found');
    }

    const currentSnippet = await Snippet.findById(version.snippetId);
    if (!currentSnippet) {
        throw new Error('Snippet not found');
    }
    
    // Create a new version from the current state before restoring
    const preRestoreVersionData = {
        snippetId: currentSnippet._id,
        name: currentSnippet.name,
        description: currentSnippet.description,
        code: currentSnippet.code,
        language: currentSnippet.language,
        tags: currentSnippet.tags,
    };
    await new SnippetVersion(preRestoreVersionData).save();
    
    // Restore the snippet to the selected version's state
    const updateData = {
        name: version.name,
        description: version.description,
        code: version.code,
        language: version.language,
        tags: version.tags,
    };

    await Snippet.findByIdAndUpdate(version.snippetId, updateData);

    revalidatePath('/');
    revalidatePath(`/s/${currentSnippet.shareId}`);
}

export async function updateSnippetSharing(id: string, isPublic: boolean) {
    await dbConnect();
    const snippet = await Snippet.findById(id);
    if (!snippet) {
        throw new Error('Snippet not found');
    }

    let shareId = snippet.shareId;
    if (isPublic && !shareId) {
        shareId = nanoid();
    }

    const updatedSnippet = await Snippet.findByIdAndUpdate(id, { isPublic, shareId }, { new: true });
    
    revalidatePath(`/s/${shareId}`);
    
    return JSON.parse(JSON.stringify(updatedSnippet));
}

export async function getSharedSnippet(shareId: string) {
    await dbConnect();
    const snippet = await Snippet.findOne({ shareId, isPublic: true });
    if (!snippet) {
        return null;
    }
    return JSON.parse(JSON.stringify(snippet));
}

// This function is being replaced by JWT auth but kept for now.
export async function getUser() {
  await dbConnect();
  let user = await User.findOne({ username: 'default' });

  if (!user) {
    const apiKey = `ck_live_${uuidv4().replace(/-/g, '')}`;
    user = new User({
        username: 'default',
        email: 'default@example.com',
        password: 'password', // In a real app, this should be securely hashed
        apiKey: apiKey
    });
    await user.save();
  }

  return JSON.parse(JSON.stringify(user));
}

export async function getSnippetById(id: string) {
    await dbConnect();
    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return null;
    }
    return JSON.parse(JSON.stringify(snippet));
}
