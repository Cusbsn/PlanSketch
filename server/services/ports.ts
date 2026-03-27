import type { GenerateRequest, GeneratedVariant, ImageInsight, PromptPlan } from '../types.js';

export type ProviderMode = 'mock' | 'real';

export interface ProviderMetadata {
  kind: 'image-understanding' | 'prompt-builder' | 'image-generation';
  name: string;
  mode: ProviderMode;
}

export interface ImageUnderstandingPort {
  readonly metadata: ProviderMetadata;
  analyze(input: GenerateRequest): Promise<ImageInsight>;
}

export interface PromptBuilderPort {
  readonly metadata: ProviderMetadata;
  build(input: GenerateRequest, insight: ImageInsight): Promise<PromptPlan>;
}

export interface ImageGenerationPort {
  readonly metadata: ProviderMetadata;
  generate(input: GenerateRequest, promptPlan: PromptPlan): Promise<GeneratedVariant[]>;
}

export interface ProviderBundle {
  imageUnderstanding: ImageUnderstandingPort;
  promptBuilder: PromptBuilderPort;
  imageGeneration: ImageGenerationPort;
}
