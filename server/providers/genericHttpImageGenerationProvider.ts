import type { StageProviderConfig } from '../config.js';
import type { GenerateRequest, GeneratedVariant, PromptPlan } from '../types.js';
import type { ImageGenerationPort } from '../services/ports.js';
import { GenericHttpClient } from './genericHttpClient.js';

function ensureGeneratedVariantsShape(value: GeneratedVariant[]): GeneratedVariant[] {
  if (!Array.isArray(value)) {
    throw new Error('[generic-http:image-generation] Invalid response shape. Expected GeneratedVariant[].');
  }

  for (const item of value) {
    if (!item?.id || !item?.label || !item?.imageUrl || !item?.notes) {
      throw new Error('[generic-http:image-generation] Invalid variant item shape.');
    }
  }

  return value;
}

export class GenericHttpImageGenerationProvider implements ImageGenerationPort {
  readonly metadata = {
    kind: 'image-generation' as const,
    name: 'generic-http',
    mode: 'real' as const
  };

  private readonly client: GenericHttpClient;

  constructor(private readonly config: StageProviderConfig) {
    this.client = new GenericHttpClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      timeoutMs: config.timeoutMs,
      providerName: this.metadata.name
    });
  }

  // Contract:
  // - Input: GenerateRequest + PromptPlan
  // - Output: GeneratedVariant[]
  // - imageUrl may be remote URL, signed URL, or data URL as long as frontend can render it
  async generate(input: GenerateRequest, promptPlan: PromptPlan): Promise<GeneratedVariant[]> {
    const result = await this.client.postJson<GeneratedVariant[]>('/image-generation', {
      model: this.config.model,
      input,
      promptPlan
    });

    return ensureGeneratedVariantsShape(result);
  }
}
