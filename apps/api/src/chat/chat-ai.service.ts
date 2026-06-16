import { Injectable, Logger } from '@nestjs/common';
import { env } from '../config/env';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateArgs {
  botName: string;
  siteName: string;
  model: string;
  servicesContext: string;
  extraSystemPrompt?: string | null;
  collectLeads: boolean;
  history: AiMessage[];
}

/**
 * Generates support-chat replies via any OpenAI-compatible Chat Completions
 * endpoint (Groq, Ollama, OpenRouter, etc.) using the global `fetch` — no SDK
 * dependency. The system prompt is built from the agency's own Services so the
 * bot only answers about HexaPixora's offerings.
 */
@Injectable()
export class ChatAiService {
  private readonly logger = new Logger(ChatAiService.name);

  isConfigured(): boolean {
    return env.ai.apiKey.length > 0;
  }

  private buildSystemPrompt(args: GenerateArgs): string {
    const { botName, siteName, servicesContext, extraSystemPrompt, collectLeads } = args;
    return [
      `You are ${botName}, the friendly support assistant for ${siteName}, a digital agency.`,
      `You ONLY help with questions about ${siteName}: its services, the kind of projects it takes on, how to get started, and booking a consultation.`,
      servicesContext
        ? `Here are ${siteName}'s services you can talk about:\n${servicesContext}`
        : '',
      `If a visitor asks about something unrelated to ${siteName} or its services, politely explain you can only help with ${siteName} topics, and offer to connect them with the team.`,
      `Never invent specific prices, timelines, or commitments. For anything pricing- or scope-specific, offer to set up a consultation with the team.`,
      `Keep replies concise and warm — usually 2 to 4 sentences. Use plain text, no markdown headings.`,
      collectLeads
        ? `When the visitor shows interest in working with ${siteName}, naturally ask for their name and email so the team can follow up. Do not be pushy.`
        : '',
      `If the visitor explicitly asks to speak to a human/person/agent, reassure them you'll connect them with the team.`,
      extraSystemPrompt ? `Additional instructions: ${extraSystemPrompt}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  /**
   * Returns the assistant reply text (or null on failure), plus a rateLimited
   * flag so the caller can alert the team when the provider throttles (429).
   */
  async generateReply(
    args: GenerateArgs,
  ): Promise<{ text: string | null; rateLimited: boolean }> {
    if (!this.isConfigured()) return { text: null, rateLimited: false };

    const messages: AiMessage[] = [
      { role: 'system', content: this.buildSystemPrompt(args) },
      ...args.history.slice(-20),
    ];

    try {
      const res = await fetch(`${env.ai.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.ai.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: args.model || env.ai.fallbackModel,
          messages,
          temperature: 0.4,
          max_tokens: 400,
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        const rateLimited = res.status === 429;
        this.logger[rateLimited ? 'warn' : 'error'](
          `AI endpoint ${rateLimited ? 'rate-limited (429)' : `error (${res.status})`}: ${detail.slice(0, 400)}`,
        );
        return { text: null, rateLimited };
      }

      const json: any = await res.json();
      const text: string | undefined = json?.choices?.[0]?.message?.content;
      return { text: text?.trim() || null, rateLimited: false };
    } catch (err) {
      this.logger.error(`AI request failed: ${(err as Error).message}`);
      return { text: null, rateLimited: false };
    }
  }

  /**
   * Best-effort extraction of a lead's email/name from free-text the visitor
   * typed. Deterministic (no model call) so it always runs, even with AI off.
   */
  extractContact(text: string): { email?: string; name?: string } {
    const result: { email?: string; name?: string } = {};
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (emailMatch) result.email = emailMatch[0].replace(/[.,;:]+$/, '');

    // "my name is X", "I'm X", "this is X" — capture 1-3 capitalized-ish words.
    const nameMatch = text.match(
      /(?:my name is|i am|i'm|this is|name's|it's)\s+([A-Za-z][A-Za-z'’-]+(?:\s+[A-Za-z][A-Za-z'’-]+){0,2})/i,
    );
    if (nameMatch) result.name = nameMatch[1].trim();

    return result;
  }
}
