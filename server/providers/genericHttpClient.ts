import type { ProviderApiErrorShape, ProviderEnvelope } from '../types.js';

interface JsonClientConfig {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs: number;
  providerName: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function unwrapProviderResponse<TResponse>(payload: unknown): TResponse {
  if (isObject(payload) && 'data' in payload) {
    return ((payload as unknown) as ProviderEnvelope<TResponse>).data;
  }

  return payload as TResponse;
}

function extractProviderErrorMessage(payload: unknown): string | undefined {
  if (!isObject(payload) || !('error' in payload)) {
    return undefined;
  }

  const errorShape = payload as ProviderApiErrorShape;
  return errorShape.error?.message;
}

export class GenericHttpClient {
  constructor(private readonly config: JsonClientConfig) {}

  // Contract:
  // - Sends JSON with Bearer auth
  // - Accepts either raw JSON result or { data, meta } envelope
  // - Throws normalized errors so bundle-level fallback can decide whether to use mock
  async postJson<TResponse>(path: string, payload: unknown): Promise<TResponse> {
    if (!this.config.baseUrl) {
      throw new Error(`[${this.config.providerName}] Missing base URL configuration.`);
    }

    if (!this.config.apiKey) {
      throw new Error(`[${this.config.providerName}] Missing API key configuration.`);
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(new URL(path, this.config.baseUrl).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`[${this.config.providerName}] ${message || `Request failed with status ${response.status}`}`);
      }

      const json = (await response.json()) as unknown;
      const providerMessage = extractProviderErrorMessage(json);

      if (providerMessage) {
        throw new Error(`[${this.config.providerName}] ${providerMessage}`);
      }

      return unwrapProviderResponse<TResponse>(json);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`[${this.config.providerName}] Request timed out after ${this.config.timeoutMs}ms.`);
      }

      throw error;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}
