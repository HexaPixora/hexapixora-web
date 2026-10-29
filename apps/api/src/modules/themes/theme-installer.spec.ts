import { BadRequestException } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { compileThemeCss, unpackThemePack } from './theme-installer';

const WOFF2 = Buffer.concat([Buffer.from('wOF2'), Buffer.alloc(16)]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);

const manifest = {
  name: 'Paper',
  slug: 'paper',
  version: '1.0.0',
  tokens: {
    colors: { page: '#f4efe6', copy: '#15161c' },
    fonts: {
      body: {
        family: 'Body',
        fallback: 'Arial, sans-serif',
        files: [{ src: 'assets/body.woff2', weight: 400 }],
      },
    },
  },
};

function zipOf(files: Record<string, Buffer | string>): Buffer {
  const zip = new AdmZip();
  for (const [path, content] of Object.entries(files)) {
    zip.addFile(
      path,
      Buffer.isBuffer(content) ? content : Buffer.from(content),
    );
  }
  return zip.toBuffer();
}

const errorsOf = (fn: () => unknown): string[] => {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(BadRequestException);
    const body = (err as BadRequestException).getResponse() as {
      errors?: string[];
      message?: string;
    };
    return body.errors ?? [String(body.message)];
  }
  throw new Error('expected the pack to be rejected');
};

describe('unpackThemePack', () => {
  it('unpacks a valid pack', () => {
    const pack = unpackThemePack(
      zipOf({
        'theme.json': JSON.stringify(manifest),
        'theme.css': '[data-block="cta"] { border-radius: 0 }',
        'assets/body.woff2': WOFF2,
        'assets/grain.png': PNG,
      }),
    );
    expect(pack.manifest.slug).toBe('paper');
    expect(pack.assets.map((a) => [a.path, a.mime])).toEqual([
      ['assets/body.woff2', 'font/woff2'],
      ['assets/grain.png', 'image/png'],
    ]);
    expect(pack.sourceCss).toContain('data-block');
  });

  it('rejects files that are not allowed, with every reason listed', () => {
    const errors = errorsOf(() =>
      unpackThemePack(
        zipOf({
          'theme.json': JSON.stringify(manifest),
          'assets/body.woff2': WOFF2,
          'assets/logo.svg': '<svg onload="alert(1)"/>',
          'index.html': '<script>',
          'assets/fake.png': '<script>',
        }),
      ),
    );
    expect(errors.join(' | ')).toMatch(/logo\.svg/);
    expect(errors.join(' | ')).toMatch(/index\.html/);
    expect(errors.join(' | ')).toMatch(/fake\.png" is not a real/);
  });

  it('rejects path traversal inside the zip', () => {
    const zip = new AdmZip();
    zip.addFile('theme.json', Buffer.from(JSON.stringify(manifest)));
    zip.addFile('assets/body.woff2', WOFF2);
    zip.addFile('x.png', PNG);
    // adm-zip normalises names on add; rename the entry the way a hostile zip would store it.
    zip.getEntry('x.png')!.entryName = '../../etc/x.png';
    const errors = errorsOf(() => unpackThemePack(zip.toBuffer()));
    expect(errors.join(' ')).toMatch(/not allowed/);
  });

  it('rejects a missing or invalid manifest and missing font files', () => {
    expect(
      errorsOf(() => unpackThemePack(zipOf({ 'theme.css': '' }))),
    ).toContain('The pack has no theme.json.');
    expect(
      errorsOf(() => unpackThemePack(zipOf({ 'theme.json': '{ nope' }))),
    ).toContain('theme.json is not valid JSON.');
    expect(
      errorsOf(() =>
        unpackThemePack(
          zipOf({
            'theme.json': JSON.stringify({ ...manifest, version: '1' }),
          }),
        ),
      ).join(' '),
    ).toMatch(/version/);
    expect(
      errorsOf(() =>
        unpackThemePack(zipOf({ 'theme.json': JSON.stringify(manifest) })),
      ).join(' '),
    ).toMatch(/assets\/body\.woff2, which is not in the pack/);
  });

  it('rejects something that is not a zip', () => {
    expect(errorsOf(() => unpackThemePack(Buffer.from('not a zip')))).toEqual([
      'The file is not a valid zip.',
    ]);
  });
});

describe('compileThemeCss', () => {
  it('combines tokens and cleaned theme.css with asset URLs under the pack id', () => {
    const { manifest: m } = unpackThemePack(
      zipOf({
        'theme.json': JSON.stringify(manifest),
        'assets/body.woff2': WOFF2,
      }),
    );
    const { css, removed } = compileThemeCss(
      'pack-1',
      m,
      'body { color: red } [data-surface="raised"] { background: url(assets/body.woff2) }',
      ['assets/body.woff2'],
    );
    expect(css).toContain('url("/api/themes/assets/pack-1/body.woff2")');
    expect(css).toContain('--color-page:#f4efe6');
    expect(css).not.toContain('color: red');
    expect(removed).toHaveLength(1);
  });
});
