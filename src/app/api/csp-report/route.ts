import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  console.warn('[CSP Violation]', JSON.stringify(body));
  return new NextResponse(null, { status: 204 });
}
