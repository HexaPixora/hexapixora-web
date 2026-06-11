import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET() {
  revalidateTag('layouts');
  revalidateTag('pages');
  return NextResponse.json({ revalidated: true });
}
