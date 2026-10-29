import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import AdmZip from 'adm-zip';
import { randomUUID } from 'node:crypto';
import type { ThemeManifest } from '@hexapixora/contracts/theme-pack/schema';
import { env } from '../../config/env';
import { PrismaService } from '../../prisma/prisma.service';
import { compileThemeCss, unpackThemePack } from './theme-installer';

const PREVIEW_PURPOSE = 'theme-preview';
const PREVIEW_TTL_SECONDS = 60 * 60;

/** The admin list: everything but the CSS and the files. */
const SUMMARY = {
  id: true,
  slug: true,
  name: true,
  version: true,
  author: true,
  description: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class ThemesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  list() {
    return this.prisma.themePack.findMany({
      select: SUMMARY,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /** Unpacks, checks and stores a pack. It is not activated. */
  async install(zipBytes: Buffer) {
    const { manifest, sourceCss, assets } = unpackThemePack(zipBytes);

    const taken = await this.prisma.themePack.findUnique({
      where: {
        slug_version: { slug: manifest.slug, version: manifest.version },
      },
      select: { id: true },
    });
    if (taken) {
      throw new ConflictException(
        `${manifest.name} ${manifest.version} is already installed. Raise the version to install a new one.`,
      );
    }

    // The id is chosen first: the compiled CSS points at /themes/assets/<id>/….
    const id = randomUUID();
    let compiled: { css: string; removed: string[] };
    try {
      compiled = compileThemeCss(
        id,
        manifest,
        sourceCss,
        assets.map((a) => a.path),
      );
    } catch (err) {
      throw new BadRequestException(`theme.css: ${(err as Error).message}`);
    }

    const pack = await this.prisma.themePack.create({
      data: {
        id,
        slug: manifest.slug,
        name: manifest.name,
        version: manifest.version,
        author: manifest.author,
        description: manifest.description,
        manifest: manifest,
        sourceCss,
        css: compiled.css,
        assets: {
          create: assets.map((asset) => ({
            path: asset.path,
            mime: asset.mime,
            size: asset.bytes.length,
            bytes: new Uint8Array(asset.bytes),
          })),
        },
      },
      select: SUMMARY,
    });
    return { pack, removed: compiled.removed };
  }

  /** Makes `id` the one active pack (clears any other, like the homepage). */
  async activate(id: string) {
    await this.findOrThrow(id);
    await this.prisma.$transaction([
      this.prisma.themePack.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false },
      }),
      this.prisma.themePack.update({ where: { id }, data: { isActive: true } }),
    ]);
    return { id, isActive: true };
  }

  /** Back to the built-in theme. */
  async deactivate() {
    await this.prisma.themePack.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    return { isActive: false };
  }

  async remove(id: string) {
    const pack = await this.findOrThrow(id);
    if (pack.isActive) {
      throw new BadRequestException(
        'This theme is active. Activate another theme (or the built-in one) first.',
      );
    }
    await this.prisma.themePack.delete({ where: { id } });
  }

  /** The active pack's CSS for the site, or null for the built-in theme. */
  active() {
    return this.prisma.themePack.findFirst({
      where: { isActive: true },
      select: { id: true, slug: true, name: true, version: true, css: true },
    });
  }

  async asset(packId: string, file: string) {
    const asset = await this.prisma.themeAsset.findUnique({
      where: { packId_path: { packId, path: `assets/${file}` } },
      select: { mime: true, bytes: true },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  /** A short-lived token that lets one browser preview `id` on the site. */
  async previewToken(id: string) {
    await this.findOrThrow(id);
    const token = await this.jwt.signAsync(
      { purpose: PREVIEW_PURPOSE, packId: id },
      { secret: env.jwtAccessSecret, expiresIn: PREVIEW_TTL_SECONDS },
    );
    return { token, expiresIn: PREVIEW_TTL_SECONDS };
  }

  async preview(token: string) {
    let packId: string;
    try {
      const payload = await this.jwt.verifyAsync<{
        purpose?: string;
        packId?: string;
      }>(token, { secret: env.jwtAccessSecret });
      if (payload.purpose !== PREVIEW_PURPOSE || !payload.packId)
        throw new Error();
      packId = payload.packId;
    } catch {
      throw new UnauthorizedException(
        'This preview link is invalid or has expired.',
      );
    }
    const pack = await this.prisma.themePack.findUnique({
      where: { id: packId },
      select: { name: true, css: true },
    });
    if (!pack) throw new NotFoundException('Theme not found');
    return pack;
  }

  /** The pack as a zip again: theme.json, theme.css and assets/. */
  async download(id: string) {
    const pack = await this.prisma.themePack.findUnique({
      where: { id },
      include: { assets: { select: { path: true, bytes: true } } },
    });
    if (!pack) throw new NotFoundException('Theme not found');
    const zip = new AdmZip();
    const manifest = pack.manifest as ThemeManifest;
    zip.addFile('theme.json', Buffer.from(JSON.stringify(manifest, null, 2)));
    if (pack.sourceCss) zip.addFile('theme.css', Buffer.from(pack.sourceCss));
    for (const asset of pack.assets)
      zip.addFile(asset.path, Buffer.from(asset.bytes));
    return { name: `${pack.slug}-${pack.version}.zip`, bytes: zip.toBuffer() };
  }

  private async findOrThrow(id: string) {
    const pack = await this.prisma.themePack.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
    if (!pack) throw new NotFoundException('Theme not found');
    return pack;
  }
}
