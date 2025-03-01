import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  
  // IP adresini al
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
  
  // User agent bilgisini al
  const userAgent = headersList.get('user-agent') || 'unknown';

  return NextResponse.json({ 
    ip, 
    userAgent 
  });
} 