import { BadRequestException } from '@nestjs/common';

/**
 * Minimal Supabase Storage client over the built-in fetch (no SDK dependency).
 *
 * Enabled only when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set — so
 * production persists media to Supabase (survives Railway redeploys) while
 * local dev falls back to the local ./uploads disk with no config.
 *
 * Requires a PUBLIC bucket (default name "media") created in the Supabase
 * dashboard so the object's public URL is readable without auth.
 */
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media';

export function isSupabaseStorageEnabled(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

export function supabasePublicUrl(objectPath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

export async function uploadToSupabase(
  objectPath: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(objectPath)}`,
    {
      method: 'POST',
      headers: {
        // Send the key in both headers so either a new `sb_secret_...` key or a
        // legacy service_role JWT works.
        apikey: SERVICE_KEY as string,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': contentType,
        // Content is content-addressed (sha256 filename), so caching forever is safe.
        'Cache-Control': 'public, max-age=31536000, immutable',
        'x-upsert': 'true',
      },
      // Buffer isn't a valid BodyInit in the fetch types; a Uint8Array view is.
      body: new Uint8Array(buffer),
    },
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new BadRequestException(
      `Supabase Storage upload failed (${res.status}): ${detail.slice(0, 200)}`,
    );
  }
  return supabasePublicUrl(objectPath);
}

export async function deleteFromSupabase(objectPath: string): Promise<void> {
  if (!isSupabaseStorageEnabled()) return;
  try {
    await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(objectPath)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: SERVICE_KEY as string,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      },
    );
  } catch {
    // Best-effort: a failed remote delete shouldn't block deleting the DB record.
  }
}
