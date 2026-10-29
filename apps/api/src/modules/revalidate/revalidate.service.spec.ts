import { RevalidateService } from './revalidate.service';
import { env } from '../../config/env';

describe('RevalidateService', () => {
  const fetchMock = jest.fn();
  let service: RevalidateService;

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock.mockReset().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock;
    env.revalidate.url = 'http://site.test/hooks/revalidate';
    env.revalidate.secret = 'secret';
    service = new RevalidateService();
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.useRealTimers();
  });

  it('collapses a burst of writes into one request', async () => {
    service.schedule();
    service.schedule();
    service.schedule();
    await jest.advanceTimersByTimeAsync(2_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://site.test/hooks/revalidate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'X-Revalidate-Secret': 'secret' },
      }),
    );
  });

  it('does nothing when unconfigured', async () => {
    env.revalidate.secret = '';
    service.schedule();
    await jest.advanceTimersByTimeAsync(2_000);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never throws when the site is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(service.send()).resolves.toBeUndefined();
  });
});
