import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatAiService } from './chat-ai.service';
import { ChatGateway } from './chat.gateway';
import { env } from '../config/env';

@Module({
  // JwtModule is used by the gateway to authenticate agent socket connections
  // from the access_token cookie.
  imports: [JwtModule.register({ secret: env.jwtAccessSecret })],
  controllers: [ChatController],
  providers: [ChatService, ChatAiService, ChatGateway],
})
export class ChatModule {}
