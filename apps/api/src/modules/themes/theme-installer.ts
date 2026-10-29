import { BadRequestException } from '@nestjs/common';
import AdmZip from 'adm-zip';
import {
  PACK_LIMITS,
  checkAsset,
  classifyPackPath,
} from '@hexapixora/contracts/theme-pack/files';
import {
  themeManifestSchema,
  type ThemeManifest,
} from '@hexapixora/contracts/theme-pack/schema';
import { sanitizeThemeCss } from '@hexapixora/contracts/theme-pack/sanitize-css';
import { tokensToCss } from '@hexapixora/contracts/theme-pack/tokens-to-css';

export type PackAsset = { path: string; mime: string; bytes: Buffer };

export type UnpackedPack = {
  manifest: ThemeManifest;
  sourceCss: string;
  assets: PackAsset[];
};

/** All files together, unpacked: guards against zip bombs. */
const MAX_UNPACKED_BYTES = 40 * 1024 * 1024;

/**
 * Reads a theme pack zip (plans/phase-3b) and checks everything in it:
 * paths, real file types, sizes, the manifest, and that every font file the
 * manifest names is in the pack. Throws a BadRequestException listing what
 * is wrong; nothing is stored here.
 */
export function unpackThemePack(zipBytes: Buffer): UnpackedPack {
  if (zipBytes.length > PACK_LIMITS.zipBytes) {
    throw new BadRequestException(
      `The pack is larger than ${PACK_LIMITS.zipBytes / 1024 / 1024} MB.`,
    );
  }

  let zip: AdmZip;
  try {
    zip = new AdmZip(zipBytes);
  } catch {
    throw new BadRequestException('The file is not a valid zip.');
  }

  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
  if (entries.length > PACK_LIMITS.entries) {
    throw new BadRequestException(
      `The pack has more than ${PACK_LIMITS.entries} files.`,
    );
  }
  const unpacked = entries.reduce((sum, entry) => sum + entry.header.size, 0);
  if (unpacked > MAX_UNPACKED_BYTES) {
    throw new BadRequestException('The pack is too large once unpacked.');
  }

  const errors: string[] = [];
  let manifestText: string | null = null;
  let sourceCss = '';
  const assets: PackAsset[] = [];

  for (const entry of entries) {
    const kind = classifyPackPath(entry.entryName);
    if ('error' in kind) {
      errors.push(kind.error);
      continue;
    }
    if (kind.kind === 'manifest') {
      if (entry.header.size > PACK_LIMITS.manifestBytes) {
        errors.push('theme.json is too large.');
        continue;
      }
      manifestText = entry.getData().toString('utf8');
    } else if (kind.kind === 'css') {
      sourceCss = entry.getData().toString('utf8');
    } else {
      const bytes = entry.getData();
      const checked = checkAsset(entry.entryName, kind.ext, bytes);
      if ('error' in checked) errors.push(checked.error);
      else assets.push({ path: entry.entryName, mime: checked.mime, bytes });
    }
  }

  if (manifestText === null) errors.push('The pack has no theme.json.');
  let manifest: ThemeManifest | null = null;
  if (manifestText !== null) {
    let json: unknown;
    try {
      json = JSON.parse(manifestText);
    } catch {
      errors.push('theme.json is not valid JSON.');
    }
    if (json !== undefined) {
      const parsed = themeManifestSchema.safeParse(json);
      if (parsed.success) manifest = parsed.data;
      else
        errors.push(
          ...parsed.error.issues.map(
            (issue) => `theme.json ${issue.path.join('.')}: ${issue.message}`,
          ),
        );
    }
  }

  if (manifest) {
    const present = new Set(assets.map((asset) => asset.path));
    for (const font of Object.values(manifest.tokens.fonts)) {
      for (const file of font?.files ?? []) {
        if (!present.has(file.src))
          errors.push(
            `theme.json names ${file.src}, which is not in the pack.`,
          );
      }
    }
  }

  if (errors.length > 0 || !manifest) {
    throw new BadRequestException({
      message: 'The theme pack was not installed.',
      errors,
    });
  }
  return { manifest, sourceCss, assets };
}

/** Where the site loads a pack's asset from (through its own /api rewrite). */
export const themeAssetUrl = (packId: string, path: string) =>
  `/api/themes/assets/${packId}/${path.replace(/^assets\//, '')}`;

/**
 * The CSS the site serves for a pack: its tokens, then its theme.css cleaned
 * again (so a stricter cleaner also applies to packs installed earlier).
 */
export function compileThemeCss(
  packId: string,
  manifest: ThemeManifest,
  sourceCss: string,
  assetPaths: Iterable<string>,
): { css: string; removed: string[] } {
  const url = (path: string) => themeAssetUrl(packId, path);
  const tokens = tokensToCss(manifest.tokens, url);
  const extra = sourceCss.trim()
    ? sanitizeThemeCss(sourceCss, url, new Set(assetPaths))
    : { css: '', removed: [] };
  return {
    css: [tokens, extra.css].filter(Boolean).join('\n'),
    removed: extra.removed,
  };
}
