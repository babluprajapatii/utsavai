/**
 * UtsavAI Server-Side Gemini AI Client Adapter
 * 
 * Provides an isolated, swappable server client for Google Gemini 1.5 Flash API.
 * Never exposes credentials to client-side code.
 */

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiGenerateOptions {
  systemPrompt?: string;
  messages: GeminiMessage[];
  responseMimeType?: 'application/json' | 'text/plain';
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GeminiGenerateResult {
  text: string;
  tokensUsed?: number;
  finishReason?: string;
}

export class AiProviderError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number = 500) {
    super(message);
    this.name = 'AiProviderError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Checks whether the server environment contains a configured Gemini API key.
 */
export function isGeminiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return false;
  const trimmed = apiKey.trim();
  return (
    trimmed.length > 0 &&
    !trimmed.includes('placeholder') &&
    trimmed !== 'your-gemini-api-key'
  );
}

/**
 * Returns server Gemini configuration.
 */
export function getGeminiConfig() {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const temperature = parseFloat(process.env.GEMINI_TEMPERATURE || '0.2');
  const maxOutputTokens = parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '4096', 10);

  return {
    apiKey,
    model,
    temperature,
    maxOutputTokens,
  };
}

/**
 * Executes a call to the Google Gemini generateContent REST endpoint.
 * Enforces timeouts, error handling, and response extraction.
 */
export async function callGeminiApi(
  options: GeminiGenerateOptions
): Promise<GeminiGenerateResult> {
  const { apiKey, model, temperature, maxOutputTokens } = getGeminiConfig();

  if (!isGeminiConfigured()) {
    throw new AiProviderError(
      'Gemini API key is not configured on the server.',
      'AI_PROVIDER_UNCONFIGURED',
      503
    );
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  // Assemble request body adhering to Google GenAI REST specifications
  const requestBody: Record<string, unknown> = {
    contents: options.messages,
    generationConfig: {
      temperature: options.temperature ?? temperature,
      maxOutputTokens: options.maxOutputTokens ?? maxOutputTokens,
      responseMimeType: options.responseMimeType ?? 'text/plain',
    },
  };

  if (options.systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: options.systemPrompt }],
    };
  }

  // Enforce 30-second timeout per specification
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new AiProviderError(
        'High planning demand on Gemini API. Please wait a moment and try again.',
        'AI_RATE_LIMITED',
        429
      );
    }

    if (response.status >= 500) {
      throw new AiProviderError(
        'The Gemini AI planning service is temporarily unavailable. Please try again.',
        'AI_PROVIDER_UNAVAILABLE',
        503
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = 'Gemini API returned an error';
      try {
        const errJson = JSON.parse(errorText);
        parsedMessage = errJson?.error?.message || parsedMessage;
      } catch {
        // use raw or fallback message
      }
      throw new AiProviderError(
        `Gemini API error: ${parsedMessage}`,
        'AI_PROVIDER_ERROR',
        response.status
      );
    }

    const json = await response.json();
    const candidate = json?.candidates?.[0];

    if (!candidate) {
      throw new AiProviderError(
        'Gemini returned an empty response. Please try rephrasing your request.',
        'AI_EMPTY_RESPONSE',
        422
      );
    }

    const textPart = candidate?.content?.parts?.[0]?.text;
    if (typeof textPart !== 'string' || textPart.trim().length === 0) {
      throw new AiProviderError(
        'Gemini returned a blank response.',
        'AI_EMPTY_RESPONSE',
        422
      );
    }

    const tokensUsed = json?.usageMetadata?.totalTokenCount;

    return {
      text: textPart,
      tokensUsed,
      finishReason: candidate?.finishReason,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof AiProviderError) {
      throw err;
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw new AiProviderError(
        'The planning engine took too long to respond. Please try again.',
        'AI_TIMEOUT',
        504
      );
    }

    const message = err instanceof Error ? err.message : 'Unknown network failure';
    throw new AiProviderError(
      `Failed to connect to Gemini API: ${message}`,
      'AI_PROVIDER_UNAVAILABLE',
      503
    );
  }
}

