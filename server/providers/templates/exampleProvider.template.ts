import type { StageProviderConfig } from '../../config.js';
import type {
  GenerateRequest,
  GeneratedVariant,
  ImageInsight,
  PromptPlan
} from '../../types.js';
import type {
  ImageGenerationPort,
  ImageUnderstandingPort,
  PromptBuilderPort,
  ProviderMetadata
} from '../../services/ports.js';

function assertConfigured(config: StageProviderConfig, providerName: string) {
  if (!config.baseUrl) {
    throw new Error(`[${providerName}] Missing baseUrl.`);
  }

  if (!config.apiKey) {
    throw new Error(`[${providerName}] Missing apiKey.`);
  }
}

export class ExampleImageUnderstandingProvider implements ImageUnderstandingPort {
  readonly metadata: ProviderMetadata = {
    kind: 'image-understanding',
    name: 'example-provider',
    mode: 'real'
  };

  constructor(private readonly config: StageProviderConfig) {}

  async analyze(input: GenerateRequest): Promise<ImageInsight> {
    assertConfigured(this.config, this.metadata.name);

    void input;

    // Return shape must match ImageInsight exactly:
    // {
    //   sceneSummary: string,
    //   keyElements: string[],
    //   spatialFocus: string[]
    // }
    throw new Error('Replace ExampleImageUnderstandingProvider.analyze() with real provider logic.');
  }
}

export class ExamplePromptBuilderProvider implements PromptBuilderPort {
  readonly metadata: ProviderMetadata = {
    kind: 'prompt-builder',
    name: 'example-provider',
    mode: 'real'
  };

  constructor(private readonly config: StageProviderConfig) {}

  async build(input: GenerateRequest, insight: ImageInsight): Promise<PromptPlan> {
    assertConfigured(this.config, this.metadata.name);

    void input;
    void insight;

    throw new Error('Replace ExamplePromptBuilderProvider.build() with real provider logic.');
  }
}

export class ExampleImageGenerationProvider implements ImageGenerationPort {
  readonly metadata: ProviderMetadata = {
    kind: 'image-generation',
    name: 'example-provider',
    mode: 'real'
  };

  constructor(private readonly config: StageProviderConfig) {}

  async generate(input: GenerateRequest, promptPlan: PromptPlan): Promise<GeneratedVariant[]> {
    assertConfigured(this.config, this.metadata.name);

    void input;
    void promptPlan;

    throw new Error('Replace ExampleImageGenerationProvider.generate() with real provider logic.');
  }
}
