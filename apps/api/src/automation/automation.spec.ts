import {
  BadRequestException,
  ConflictException,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { AutomationKeyGuard } from './automation-key.guard';
import { AutomationService } from './automation.service';
import { AutomationPostDto } from './dto/automation-post.dto';

jest.mock('fs', () => ({
  ...jest.requireActual<typeof import('fs')>('fs'),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

const ctx = (headers: Record<string, string>) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  }) as unknown as ExecutionContext;

describe('AutomationKeyGuard', () => {
  const guard = new AutomationKeyGuard();
  afterEach(() => (env.automationApiKey = ''));

  it('is disabled when no key is configured', () => {
    expect(() => guard.canActivate(ctx({ 'x-automation-key': 'x' }))).toThrow(
      ServiceUnavailableException,
    );
  });

  it('rejects missing and wrong keys, accepts the right one', () => {
    env.automationApiKey = 'secret-key';
    expect(() => guard.canActivate(ctx({}))).toThrow(UnauthorizedException);
    expect(() =>
      guard.canActivate(ctx({ 'x-automation-key': 'nope' })),
    ).toThrow(UnauthorizedException);
    expect(guard.canActivate(ctx({ 'x-automation-key': 'secret-key' }))).toBe(
      true,
    );
  });
});

describe('AutomationService.createPost', () => {
  const dto = (over: Partial<AutomationPostDto> = {}): AutomationPostDto => ({
    title: 'How AI agents cut cloud costs',
    slug: 'ai-agents-cloud-costs',
    markdown: '## Intro\n\nHello <script>alert(1)</script> world',
    excerpt: 'Short excerpt',
    metaTitle: 'AI agents and cloud costs',
    metaDescription: 'Meta description',
    categories: ['AI', 'unknown-cat'],
    ...over,
  });

  let prisma: {
    auditLog: { count: jest.Mock; create: jest.Mock };
    blog: { findUnique: jest.Mock; create: jest.Mock };
    category: { findMany: jest.Mock };
  };
  let service: AutomationService;

  beforeEach(() => {
    prisma = {
      auditLog: { count: jest.fn().mockResolvedValue(0), create: jest.fn() },
      blog: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve({ id: 'b1', ...data }),
        ),
      },
      category: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'c1', name: 'AI', slug: 'ai' }]),
      },
    };
    service = new AutomationService(prisma as unknown as PrismaService);
  });

  // The `data` passed to the first prisma.blog.create call.
  const createdData = () =>
    (
      prisma.blog.create.mock.calls as [[{ data: Record<string, unknown> }]]
    )[0][0].data;

  it('publishes immediately, escapes raw HTML, and links only known categories', async () => {
    const res = await service.createPost(dto());
    const data = createdData();

    expect(data.status).toBe(ContentStatus.PUBLISHED);
    expect(data.isPublished).toBe(true);
    expect(data.content).toContain('<h2>Intro</h2>');
    expect(data.content).not.toContain('<script>');
    expect(data.categories).toEqual({ connect: [{ id: 'c1' }] });
    expect(res.url).toMatch(/\/insights\/ai-agents-cloud-costs$/);
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it('schedules when publishAt is in the future', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    await service.createPost(dto({ publishAt: future }));
    const data = createdData();

    expect(data.status).toBe(ContentStatus.SCHEDULED);
    expect(data.isPublished).toBe(false);
    expect(data.publishAt).toEqual(new Date(future));
  });

  it('enforces the daily limit', async () => {
    prisma.auditLog.count.mockResolvedValue(3);
    await expect(service.createPost(dto())).rejects.toBeInstanceOf(
      HttpException,
    );
    expect(prisma.blog.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate slugs', async () => {
    prisma.blog.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(service.createPost(dto())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

describe('AutomationService images', () => {
  let prisma: {
    auditLog: { count: jest.Mock; create: jest.Mock };
    blog: { findUnique: jest.Mock; update: jest.Mock };
    media: { findFirst: jest.Mock; create: jest.Mock };
  };
  let service: AutomationService;
  const png = {
    buffer: Buffer.from('fake-png'),
    mimetype: 'image/png',
    originalname: 'x.png',
  };

  beforeEach(() => {
    prisma = {
      auditLog: { count: jest.fn().mockResolvedValue(0), create: jest.fn() },
      blog: {
        findUnique: jest.fn().mockResolvedValue({ id: 'b1' }),
        update: jest.fn(),
      },
      media: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(({ data }: { data: { url: string } }) =>
          Promise.resolve({ id: 'm1', ...data }),
        ),
      },
    };
    service = new AutomationService(prisma as unknown as PrismaService);
  });

  it('rejects non-raster types such as SVG', async () => {
    await expect(
      service.uploadImage({ ...png, mimetype: 'image/svg+xml' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores a new image content-addressed, and dedupes repeats', async () => {
    const res = await service.uploadImage(png);
    expect(res.url).toMatch(/^\/api\/media\/file\/[0-9a-f]{64}\.png$/);
    expect(prisma.auditLog.create).toHaveBeenCalled();

    prisma.media.findFirst.mockResolvedValue({ id: 'm1', url: res.url });
    await expect(service.uploadImage(png)).resolves.toMatchObject({
      deduped: true,
    });
  });

  it('refuses to edit posts the automation did not create', async () => {
    prisma.auditLog.count.mockResolvedValue(0);
    await expect(
      service.setPostImage('hand-written', '/x.png'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.blog.update).not.toHaveBeenCalled();
  });

  it('requires the image to be in the media library', async () => {
    prisma.auditLog.count.mockResolvedValue(1);
    prisma.media.findFirst.mockResolvedValue(null);
    await expect(
      service.setPostImage('auto-post', 'https://evil.example/x.png'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sets thumbnail and ogImage on an automation post', async () => {
    prisma.auditLog.count.mockResolvedValue(1);
    prisma.media.findFirst.mockResolvedValue({ id: 'm1' });
    await service.setPostImage('auto-post', '/api/media/file/a.png');
    expect(prisma.blog.update).toHaveBeenCalledWith({
      where: { id: 'b1' },
      data: {
        thumbnail: '/api/media/file/a.png',
        ogImage: '/api/media/file/a.png',
      },
    });
  });
});
