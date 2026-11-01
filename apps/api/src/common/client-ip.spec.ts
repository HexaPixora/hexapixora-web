import { clientIp } from './client-ip';

const SECRET = 'proxy-secret-for-tests';

describe('clientIp', () => {
  it('uses the forwarded IP when the proxy secret matches', () => {
    const req = {
      ip: '10.0.0.1',
      headers: { 'x-proxy-secret': SECRET, 'x-client-ip': '203.0.113.7' },
    };
    expect(clientIp(req, SECRET)).toBe('203.0.113.7');
  });

  it('accepts IPv6 addresses', () => {
    const req = {
      ip: '10.0.0.1',
      headers: { 'x-proxy-secret': SECRET, 'x-client-ip': '2001:db8::1' },
    };
    expect(clientIp(req, SECRET)).toBe('2001:db8::1');
  });

  it('ignores the forwarded IP without the secret', () => {
    const req = { ip: '10.0.0.1', headers: { 'x-client-ip': '203.0.113.7' } };
    expect(clientIp(req, SECRET)).toBe('10.0.0.1');
  });

  it('ignores the forwarded IP with a wrong secret', () => {
    const req = {
      ip: '10.0.0.1',
      headers: { 'x-proxy-secret': 'guess', 'x-client-ip': '203.0.113.7' },
    };
    expect(clientIp(req, SECRET)).toBe('10.0.0.1');
  });

  it('ignores the forwarded IP when no secret is configured', () => {
    const req = {
      ip: '10.0.0.1',
      headers: { 'x-proxy-secret': '', 'x-client-ip': '203.0.113.7' },
    };
    expect(clientIp(req, '')).toBe('10.0.0.1');
  });

  it('falls back to the connection address when the forwarded value is not an IP', () => {
    const req = {
      ip: '10.0.0.1',
      headers: { 'x-proxy-secret': SECRET, 'x-client-ip': 'unknown' },
    };
    expect(clientIp(req, SECRET)).toBe('10.0.0.1');
  });
});
