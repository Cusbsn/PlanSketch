import type { ProviderMode } from './services/ports.js';

export interface StageProviderConfig {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs: number;
}

export interface PlanSketchConfig {
  port: number;
  mode: ProviderMode;
  fallbackToMock: boolean;
  imageUnderstanding: StageProviderConfig;
  promptBuilder: StageProviderConfig;
  imageGeneration: StageProviderConfig;
}

function readString(name: string, fallback?: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

function readNumber(name: string, fallback: number) {
  const value = process.env[name]?.trim();
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBoolean(name: string, fallback: boolean) {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

function resolveMode(): ProviderMode {
  const mode = readString('PLANSKETCH_PROVIDER_MODE', 'mock');
  return mode === 'real' ? 'real' : 'mock';
}

function resolveStageConfig(stageName: 'IMAGE_UNDERSTANDING' | 'PROMPT_BUILDER' | 'IMAGE_GENERATION', defaultProvider: string): StageProviderConfig {
  return {
    provider: readString(`PLANSKETCH_${stageName}_PROVIDER`, defaultProvider) ?? defaultProvider,
    apiKey: readString(`PLANSKETCH_${stageName}_API_KEY`),
    baseUrl: readString(`PLANSKETCH_${stageName}_BASE_URL`),
    model: readString(`PLANSKETCH_${stageName}_MODEL`),
    timeoutMs: readNumber(`PLANSKETCH_${stageName}_TIMEOUT_MS`, 20000)
  };
}

export function loadConfig(): PlanSketchConfig {
  const mode = resolveMode();
  const defaultProvider = mode === 'real' ? 'generic-http' : 'mock';

  return {
    port: readNumber('PORT', 8787),
    mode,
    fallbackToMock: readBoolean('PLANSKETCH_FALLBACK_TO_MOCK', true),
    imageUnderstanding: resolveStageConfig('IMAGE_UNDERSTANDING', defaultProvider),
    promptBuilder: resolveStageConfig('PROMPT_BUILDER', defaultProvider),
    imageGeneration: resolveStageConfig('IMAGE_GENERATION', defaultProvider)
  };
}
