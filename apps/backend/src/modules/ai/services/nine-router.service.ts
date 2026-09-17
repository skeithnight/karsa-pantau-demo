import { Injectable, Logger } from '@nestjs/common';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResult {
  content: string;
  tokensUsed?: number;
  model: string;
  latencyMs: number;
}

@Injectable()
export class NineRouterService {
  private readonly logger = new Logger(NineRouterService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor() {
    this.baseUrl = (process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1').replace(/\/+$/, '');
    this.apiKey = process.env.NINE_ROUTER_API_KEY || '';
    this.defaultModel = process.env.NINE_ROUTER_MODEL || 'karsacombo';
    if (!this.apiKey) {
      this.logger.warn('NINE_ROUTER_API_KEY is not set. AI Gateway calls will fail unless configured in environment.');
    }
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async isAvailable(): Promise<{ available: boolean; latencyMs?: number; error?: string }> {
    const start = Date.now();
    try {
      // Check 9Router root or /models endpoint
      const rootUrl = this.baseUrl.replace(/\/v1$/, '');
      const res = await fetch(`${rootUrl}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      const latencyMs = Date.now() - start;
      return { available: res.ok, latencyMs };
    } catch (err: any) {
      return { available: false, error: err.message };
    }
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options: { model?: string; temperature?: number; maxTokens?: number } = {},
  ): Promise<ChatCompletionResult> {
    const model = options.model || this.defaultModel;
    const start = Date.now();

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 1024,
        }),
        signal: AbortSignal.timeout(30000),
      });

      const latencyMs = Date.now() - start;

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`9Router error ${res.status}: ${text}`);
      }

      const data = (await res.json()) as any;
      const content = data.choices?.[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens;

      return {
        content,
        tokensUsed,
        model: data.model || model,
        latencyMs,
      };
    } catch (err: any) {
      this.logger.warn(`9Router chat completion failed: ${err.message}`);
      throw err;
    }
  }

  async createEmbedding(input: string, model = 'text-embedding-3-small'): Promise<number[]> {
    try {
      const res = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          input,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`9Router embedding error ${res.status}: ${text}`);
      }

      const data = (await res.json()) as any;
      return data.data?.[0]?.embedding || [];
    } catch (err: any) {
      this.logger.warn(`9Router embedding creation failed: ${err.message}`);
      throw err;
    }
  }

  async *streamChat(
    messages: ChatMessage[],
    options: { model?: string; temperature?: number; maxTokens?: number } = {},
  ): AsyncGenerator<string, void, unknown> {
    const model = options.model || this.defaultModel;

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1000,
        stream: true,
      }),
      signal: AbortSignal.timeout(180000),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`9Router stream error ${res.status}: ${text}`);
    }

    if (!res.body) {
      throw new Error('9Router response body is null');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {
            // ignore chunk parse errors
          }
        }
      }
    }
  }
}
