export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    console.log('Login attempt started');
    const { email, password } = await request.json();
    console.log('Received credentials for:', email);

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Validate input
    if (!normalizedEmail || !password) {
      console.log('Missing credentials');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin user
    console.log('Looking up admin user');
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      console.log('Admin not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('Verifying password');
    const isValidPassword = await compare(password, admin.password);

    if (!isValidPassword) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    console.log('Generating token');
    const token = sign(
      { 
        id: admin.id,
        email: admin.email,
        name: admin.name
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    console.log('Setting cookie');
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 1 day
    });

    console.log('Login successful');
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 