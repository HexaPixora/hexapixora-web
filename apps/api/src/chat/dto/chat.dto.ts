import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class QuickReplyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label: string;

  // Optional canned answer. When present (and the chip has no children), the
  // chip answers instantly with this text; when omitted, clicking sends the
  // label to the AI.
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reply?: string;

  // Nested sub-question chips. Clicking a chip that has children drills into
  // them instead of sending a message (a clarifying menu).
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuickReplyDto)
  children?: QuickReplyDto[];
}

export class CannedReplyDto {
  @IsString() @MinLength(1) @MaxLength(80) title: string;
  @IsString() @MinLength(1) @MaxLength(2000) text: string;
}

export class AddNoteDto {
  @IsString() @MinLength(1) @MaxLength(2000) content: string;
}

export class AssignConversationDto {
  // null/empty clears the assignment.
  @IsOptional() @IsString() assigneeId?: string | null;
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
  // close: end the conversation; reopen: bring a closed chat back to life.
  @IsIn(['takeover', 'release', 'close', 'reopen'])
  action: 'takeover' | 'release' | 'close' | 'reopen';
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
  @IsOptional() @IsString() @MaxLength(120) teamSubtitle?: string;
  @IsOptional() @IsString() @MaxLength(500) launcherIconUrl?: string;
  @IsOptional() @IsInt() @Min(0) @Max(3650) retentionDays?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CannedReplyDto)
  cannedReplies?: CannedReplyDto[];
}
