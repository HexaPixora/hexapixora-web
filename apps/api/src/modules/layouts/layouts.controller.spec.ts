import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LayoutsController } from './layouts.controller';
import { LayoutsService } from './layouts.service';

describe('LayoutsController', () => {
  let controller: LayoutsController;
  const layoutsService = { upsert: jest.fn(), findByKey: jest.fn() };

  beforeEach(async () => {
    layoutsService.upsert.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LayoutsController],
      providers: [{ provide: LayoutsService, useValue: layoutsService }],
    }).compile();
    controller = module.get(LayoutsController);
  });

  it('saves a known layout document as-is', async () => {
    const header = { logo: '/logo.svg', links: [{ label: 'Home', href: '/' }] };
    layoutsService.upsert.mockResolvedValue({ key: 'header', data: header });
    await controller.upsert('header', header);
    expect(layoutsService.upsert).toHaveBeenCalledWith('header', header);
  });

  it('accepts an array for navigations', async () => {
    const navigations = [{ id: 'main', items: [] }];
    await controller.upsert('navigations', navigations);
    expect(layoutsService.upsert).toHaveBeenCalledWith(
      'navigations',
      navigations,
    );
  });

  it('rejects an unknown key without writing', () => {
    expect(() => controller.upsert('anything', {})).toThrow(
      BadRequestException,
    );
    expect(layoutsService.upsert).not.toHaveBeenCalled();
  });

  it('rejects a non-JSON body without writing', () => {
    expect(() => controller.upsert('footer', 'text')).toThrow(
      BadRequestException,
    );
    expect(() => controller.upsert('footer', null)).toThrow(
      BadRequestException,
    );
    expect(layoutsService.upsert).not.toHaveBeenCalled();
  });
});
