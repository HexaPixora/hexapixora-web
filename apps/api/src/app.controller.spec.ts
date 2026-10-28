import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = { health: jest.fn() };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should report liveness', () => {
      expect(appController.ping()).toEqual({ status: 'ok' });
    });
  });

  describe('health', () => {
    it('returns the payload when the database is up', async () => {
      const up = { status: 'ok', db: 'up', uptime: 1, timestamp: 't' };
      appService.health.mockResolvedValue(up);
      await expect(appController.health()).resolves.toEqual(up);
    });

    it('throws 503 when the database is down', async () => {
      appService.health.mockResolvedValue({ status: 'degraded', db: 'down', uptime: 1, timestamp: 't' });
      await expect(appController.health()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });
});
