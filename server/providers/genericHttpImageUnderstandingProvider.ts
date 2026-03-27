import type { StageProviderConfig } from '../config.js';
import type { GenerateRequest, ImageInsight } from '../types.js';
import type { ImageUnderstandingPort } from '../services/ports.js';
import { GenericHttpClient } from './genericHttpClient.js';

function ensureImageInsightShape(value: ImageInsight): ImageInsight {
  if (!value.sceneSummary || !Array.isArray(value.keyElements) || !Array.isArray(value.spatialFocus)) {
    throw new Error('[generic-http:image-understanding] Invalid response shape. Expected ImageInsight.');
  }

  return value;
}

export class GenericHttpImageUnderstandingProvider implements ImageUnderstandingPort {
  readonly metadata = {
    kind: 'image-understanding' as const,
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
  // - Input: GenerateRequest
  // - Output: ImageInsight { sceneSummary, keyElements, spatialFocus }
  // - External provider may return raw ImageInsight or { data: ImageInsight }
  async analyze(input: GenerateRequest): Promise<ImageInsight> {
    const result = await this.client.postJson<ImageInsight>('/image-understanding', {
      model: this.config.model,
      input
    });

    return ensureImageInsightShape(result);
  }
}
