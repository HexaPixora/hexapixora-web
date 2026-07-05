import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AccountController } from './account.controller';
import { MailModule } from '../mail/mail.module';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [MailModule, TokensModule],
  controllers: [UsersController, AccountController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
