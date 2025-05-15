import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Remove the auth-token cookie
  cookies().set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return NextResponse.json({ message: 'Logged out successfully' });
} 