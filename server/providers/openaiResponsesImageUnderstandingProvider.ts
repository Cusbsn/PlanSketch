import type { StageProviderConfig } from '../config.js';
import type { ImageUnderstandingPort, ProviderMetadata } from '../services/ports.js';
import type { GenerateRequest, ImageInsight } from '../types.js';

interface OpenAIResponsesOutputItem {
  type?: string;
  content?: Array<{
    type?: string;
    text?: string;
  }>;
}

interface OpenAIResponsesApiResponse {
  output?: OpenAIResponsesOutputItem[];
}

interface OpenAIImageInsightPayload {
  sceneSummary: string;
  keyElements: string[];
  spatialFocus: string[];
}

function ensureConfigured(config: StageProviderConfig, providerName: string) {
  if (!config.apiKey) {
    throw new Error(`[${providerName}] Missing API key configuration.`);
  }

  if (!config.model) {
    throw new Error(`[${providerName}] Missing model configuration.`);
  }
}

function ensureInsightShape(value: OpenAIImageInsightPayload): ImageInsight {
  if (!value.sceneSummary || !Array.isArray(value.keyElements) || !Array.isArray(value.spatialFocus)) {
    throw new Error('[openai-responses:image-understanding] Invalid response shape.');
  }

  return {
    sceneSummary: value.sceneSummary,
    keyElements: value.keyElements.filter(Boolean).slice(0, 8),
    spatialFocus: value.spatialFocus.filter(Boolean).slice(0, 6)
  };
}

function extractTextPayload(response: OpenAIResponsesApiResponse): string {
  const texts = (response.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
    .map((item) => item.text ?? '')
    .join('\n')
    .trim();

  if (!texts) {
    throw new Error('[openai-responses:image-understanding] Empty text output from Responses API.');
  }

  return texts;
}

export class OpenAIResponsesImageUnderstandingProvider implements ImageUnderstandingPort {
  readonly metadata: ProviderMetadata = {
    kind: 'image-understanding',
    name: 'openai-responses',
    mode: 'real'
  };

  constructor(private readonly config: StageProviderConfig) {}

  async analyze(input: GenerateRequest): Promise<ImageInsight> {
    ensureConfigured(this.config, this.metadata.name);

    if (!input.referenceImageDataUrl) {
      throw new Error('[openai-responses:image-understanding] Missing reference image data.');
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.config.timeoutMs);
    const endpoint = new URL('/v1/responses', this.config.baseUrl ?? 'https://api.openai.com').toString();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.config.model,
          input: [
            {
              role: 'system',
              content: [
                {
                  type: 'input_text',
                  text:
                    'You analyze planning and architectural reference images. Return strict JSON only with keys: sceneSummary(string), keyElements(string[]), spatialFocus(string[]). sceneSummary should be concise. keyElements should describe visible planning elements. spatialFocus should list the most important zones, edges, nodes, or spaces to emphasize later.'
                }
              ]
            },
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: `Output type: ${input.outputType}\nUser description: ${input.description}\nReference file: ${input.referenceImageName ?? 'unknown'}`
                },
                {
                  type: 'input_image',
                  image_url: input.referenceImageDataUrl,
                  detail: 'high'
                }
              ]
            }
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'image_insight',
              schema: {
                type: 'object',
                additionalProperties: false,
                required: ['sceneSummary', 'keyElements', 'spatialFocus'],
                properties: {
                  sceneSummary: {
                    type: 'string'
                  },
                  keyElements: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  spatialFocus: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`[${this.metadata.name}] ${message || `Request failed with status ${response.status}`}`);
      }

      const payload = (await response.json()) as OpenAIResponsesApiResponse;
      const textPayload = extractTextPayload(payload);
      const parsed = JSON.parse(textPayload) as OpenAIImageInsightPayload;
      return ensureInsightShape(parsed);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`[${this.metadata.name}] Request timed out after ${this.config.timeoutMs}ms.`);
      }

      throw error;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}
