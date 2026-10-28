import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { AutomationKeyGuard } from './guards/automation-key.guard';

@Module({
  controllers: [AutomationController],
  providers: [AutomationService, AutomationKeyGuard],
})
export class AutomationModule {}
