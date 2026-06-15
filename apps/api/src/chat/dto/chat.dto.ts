import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class QuickReplyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label: string;

  // Optional canned answer. When present, the chip answers instantly with this
  // text; when omitted, clicking the chip sends the label to the AI.
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reply?: string;
}

export class StartConversationDto {
  @IsOptional() @IsString() @MaxLength(120) visitorName?: string;
  @IsOptional() @IsEmail() visitorEmail?: string;
}

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content: string;
}

export class ConversationActionDto {
  // takeover: a team member assumes control; release: hand back to the AI;
  // close: end the conversation.
  @IsIn(['takeover', 'release', 'close'])
  action: 'takeover' | 'release' | 'close';
}

export class UpdateChatbotConfigDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsString() @MaxLength(120) botName?: string;
  @IsOptional() @IsString() @MaxLength(500) welcomeMessage?: string;
  @IsOptional() @IsString() @MaxLength(4000) systemPrompt?: string;
  @IsOptional() @IsBoolean() aiEnabled?: boolean;
  @IsOptional() @IsString() @MaxLength(120) aiModel?: string;
  @IsOptional() @IsString() @MaxLength(20) accentColor?: string;
  @IsOptional() @IsString() @MaxLength(500) offlineMessage?: string;
  @IsOptional() @IsBoolean() collectLeads?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuickReplyDto)
  quickReplies?: QuickReplyDto[];

  // Widget appearance / behavior.
  @IsOptional() @IsIn(['bottom-right', 'bottom-left']) position?: string;
  @IsOptional()
  @IsIn(['message-circle', 'message-square', 'bot', 'sparkles', 'headset'])
  launcherIcon?: string;
  @IsOptional() @IsString() @MaxLength(120) headerSubtitle?: string;
  @IsOptional() @IsBoolean() showAgentHandoff?: boolean;
  @IsOptional() @IsString() @MaxLength(80) teamName?: string;
}
