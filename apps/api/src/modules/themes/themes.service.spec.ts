import { BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { HEXA_NOIR_TOKENS } from '@hexapixora/contracts/theme-pack/hexa-noir';
import { PrismaService } from '../../prisma/prisma.service';
import { ThemesService } from './themes.service';

const WOFF2 = Buffer.concat([Buffer.from('wOF2'), Buffer.alloc(8)]);

describe('ThemesService.saveVersion', () => {
  let service: ThemesService;
  const prisma = {
    themePack: { findUnique: jest.fn(), create: jest.fn() },
  };

  type CreatedPack = {
    id: string;
    css: string;
    author: string;
    sourceCss: string;
    assets: { create: unknown[] };
  };
  const createdPack = () =>
    (prisma.themePack.create.mock.calls[0] as [{ data: CreatedPack }])[0].data;

  beforeEach(async () => {
    jest.resetAllMocks();
    prisma.themePack.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({
        id: data.id,
        name: data.name,
        version: data.version,
        css: data.css,
        assets: data.assets,
      }),
    );
    const moduleRef = await Test.createTestingModule({
      providers: [
        ThemesService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();
    service = moduleRef.get(ThemesService);
  });

  it('saves edited built-in tokens as a new pack', async () => {
    prisma.themePack.findUnique.mockResolvedValue(null);
    const { pack } = await service.saveVersion({
      name: 'Hexa Noir (warm)',
      slug: 'hexa-noir-warm',
      version: '1.0.0',
      tokens: {
        ...HEXA_NOIR_TOKENS,
        colors: { ...HEXA_NOIR_TOKENS.colors, signal: '#ffb547' },
      },
    });
    const created = createdPack();
    expect(pack).toMatchObject({ name: 'Hexa Noir (warm)', version: '1.0.0' });
    expect(created.css).toContain('--color-signal:#ffb547');
    expect(created.assets.create).toEqual([]);
  });

  it('copies the base pack’s files and theme.css', async () => {
    prisma.themePack.findUnique
      .mockResolvedValueOnce({
        id: 'base',
        author: 'Studio',
        description: 'Light',
        sourceCss: '[data-block="cta"] { border-radius: 0 }',
        assets: [
          { path: 'assets/body.woff2', mime: 'font/woff2', bytes: WOFF2 },
        ],
      })
      .mockResolvedValueOnce(null);
    await service.saveVersion({
      baseId: '5f5f5f5f-5f5f-4f5f-8f5f-5f5f5f5f5f5f',
      name: 'Paper',
      slug: 'paper',
      version: '1.1.0',
      tokens: {
        fonts: {
          body: { family: 'Body', files: [{ src: 'assets/body.woff2' }] },
        },
      },
    });
    const created = createdPack();
    expect(created.author).toBe('Studio');
    expect(created.sourceCss).toContain('data-block');
    expect(created.assets.create).toHaveLength(1);
    expect(created.css).toMatch(
      new RegExp(`/api/themes/assets/${created.id}/body\\.woff2`),
    );
  });

  it('refuses invalid values, unknown fonts and an existing version', async () => {
    prisma.themePack.findUnique.mockResolvedValue(null);
    await expect(
      service.saveVersion({
        name: 'X',
        slug: 'x',
        version: '1.0.0',
        tokens: { colors: { page: 'red;}' } },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.saveVersion({
        name: 'X',
        slug: 'x',
        version: '1.0.0',
        tokens: {
          fonts: {
            body: { family: 'Body', files: [{ src: 'assets/missing.woff2' }] },
          },
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    prisma.themePack.findUnique.mockResolvedValue({ id: 'taken' });
    await expect(
      service.saveVersion({
        name: 'X',
        slug: 'x',
        version: '1.0.0',
        tokens: {},
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
