import type { PlanSketchConfig } from '../config.js';
import type {
  ImageGenerationPort,
  ImageUnderstandingPort,
  PromptBuilderPort,
  ProviderBundle
} from '../services/ports.js';
import { MockImageGenerationService } from '../services/mockImageGenerator.js';
import { MockImageUnderstandingService } from '../services/mockImageUnderstanding.js';
import { MockPromptBuilderService } from '../services/mockPromptBuilder.js';
import { GenericHttpImageGenerationProvider } from './genericHttpImageGenerationProvider.js';
import { GenericHttpImageUnderstandingProvider } from './genericHttpImageUnderstandingProvider.js';
import { GenericHttpPromptBuilderProvider } from './genericHttpPromptBuilderProvider.js';
import { OpenAIResponsesImageUnderstandingProvider } from './openaiResponsesImageUnderstandingProvider.js';

// This file is the single switchboard for provider selection.
// Reading order for new contributors:
// 1) resolve stage provider name from config
// 2) create primary provider for that stage
// 3) optionally wrap with fallback-to-mock behavior
// 4) return a ProviderBundle used by PlanSketchGenerator

function createFallbackWarning(primaryName: string, fallbackName: string, error: unknown) {
  console.warn(`[provider:fallback] provider ${primaryName} failed, using ${fallbackName}.`, error);
}

function wrapImageUnderstandingWithFallback(
  primary: ImageUnderstandingPort,
  fallback: ImageUnderstandingPort,
  enabled: boolean
): ImageUnderstandingPort {
  if (!enabled) return primary;

  return {
    metadata: primary.metadata,
    async analyze(...args) {
      try {
        return await primary.analyze(...args);
      } catch (error) {
        createFallbackWarning(primary.metadata.name, fallback.metadata.name, error);
        return fallback.analyze(...args);
      }
    }
  };
}

function wrapPromptBuilderWithFallback(
  primary: PromptBuilderPort,
  fallback: PromptBuilderPort,
  enabled: boolean
): PromptBuilderPort {
  if (!enabled) return primary;

  return {
    metadata: primary.metadata,
    async build(...args) {
      try {
        return await primary.build(...args);
      } catch (error) {
        createFallbackWarning(primary.metadata.name, fallback.metadata.name, error);
        return fallback.build(...args);
      }
    }
  };
}

function wrapImageGenerationWithFallback(
  primary: ImageGenerationPort,
  fallback: ImageGenerationPort,
  enabled: boolean
): ImageGenerationPort {
  if (!enabled) return primary;

  return {
    metadata: primary.metadata,
    async generate(...args) {
      try {
        return await primary.generate(...args);
      } catch (error) {
        createFallbackWarning(primary.metadata.name, fallback.metadata.name, error);
        return fallback.generate(...args);
      }
    }
  };
}

function createImageUnderstandingProvider(config: PlanSketchConfig): ImageUnderstandingPort {
  const mock = new MockImageUnderstandingService();
  if (config.imageUnderstanding.provider === 'mock') {
    return mock;
  }

  if (config.imageUnderstanding.provider === 'generic-http') {
    const primary = new GenericHttpImageUnderstandingProvider(config.imageUnderstanding);
    return wrapImageUnderstandingWithFallback(primary, mock, config.fallbackToMock);
  }

  if (config.imageUnderstanding.provider === 'openai-responses') {
    const primary = new OpenAIResponsesImageUnderstandingProvider(config.imageUnderstanding);
    return wrapImageUnderstandingWithFallback(primary, mock, config.fallbackToMock);
  }

  console.warn(`[provider] Unknown image understanding provider: ${config.imageUnderstanding.provider}. Falling back to mock.`);
  return mock;
}

function createPromptBuilderProvider(config: PlanSketchConfig): PromptBuilderPort {
  const mock = new MockPromptBuilderService();
  if (config.promptBuilder.provider === 'mock') {
    return mock;
  }

  if (config.promptBuilder.provider === 'generic-http') {
    const primary = new GenericHttpPromptBuilderProvider(config.promptBuilder);
    return wrapPromptBuilderWithFallback(primary, mock, config.fallbackToMock);
  }

  console.warn(`[provider] Unknown prompt builder provider: ${config.promptBuilder.provider}. Falling back to mock.`);
  return mock;
}

function createImageGenerationProvider(config: PlanSketchConfig): ImageGenerationPort {
  const mock = new MockImageGenerationService();
  if (config.imageGeneration.provider === 'mock') {
    return mock;
  }

  if (config.imageGeneration.provider === 'generic-http') {
    const primary = new GenericHttpImageGenerationProvider(config.imageGeneration);
    return wrapImageGenerationWithFallback(primary, mock, config.fallbackToMock);
  }

  console.warn(`[provider] Unknown image generation provider: ${config.imageGeneration.provider}. Falling back to mock.`);
  return mock;
}

export function createProviderBundle(config: PlanSketchConfig): ProviderBundle {
  return {
    imageUnderstanding: createImageUnderstandingProvider(config),
    promptBuilder: createPromptBuilderProvider(config),
    imageGeneration: createImageGenerationProvider(config)
  };
}
