import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [NotificationsModule, MailModule, JwtModule.register({})],
  controllers: [NewsletterController],
  providers: [NewsletterService]
})
export class NewsletterModule {}
