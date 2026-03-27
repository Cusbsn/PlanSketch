import type { StageProviderConfig } from '../config.js';
import type { GenerateRequest, ImageInsight, PromptPlan } from '../types.js';
import type { PromptBuilderPort } from '../services/ports.js';
import { GenericHttpClient } from './genericHttpClient.js';

function ensurePromptPlanShape(value: PromptPlan): PromptPlan {
  if (!value.title || !value.summary || !value.promptDraft) {
    throw new Error('[generic-http:prompt-builder] Invalid response shape. Expected PromptPlan.');
  }

  return value;
}

export class GenericHttpPromptBuilderProvider implements PromptBuilderPort {
  readonly metadata = {
    kind: 'prompt-builder' as const,
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
  // - Input: GenerateRequest + ImageInsight
  // - Output: PromptPlan
  // - Keep prompt text normalized so downstream image generation stays provider-agnostic
  async build(input: GenerateRequest, insight: ImageInsight): Promise<PromptPlan> {
    const result = await this.client.postJson<PromptPlan>('/prompt-builder', {
      model: this.config.model,
      input,
      insight
    });

    return ensurePromptPlanShape(result);
  }
}
