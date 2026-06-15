import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  // Next.js 16 requires a cache profile as the second argument; 'max' purges
  // the tag immediately regardless of its configured cacheLife.
  revalidateTag('layouts', 'max');
  revalidateTag('pages', 'max');
  return NextResponse.json({ revalidated: true });
}
