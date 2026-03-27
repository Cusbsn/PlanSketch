export type OutputType = '功能分区图' | '流线分析图' | '鸟瞰表达图';

export interface GenerateRequest {
  outputType: OutputType;
  description: string;
  referenceImageName?: string;
  referenceImageDataUrl?: string;
}

export interface ImageInsight {
  sceneSummary: string;
  keyElements: string[];
  spatialFocus: string[];
}

export interface PromptPlan {
  title: string;
  summary: string;
  promptDraft: string;
}

export interface GeneratedVariant {
  id: string;
  label: string;
  imageUrl: string;
  notes: string;
}

export interface ProviderApiErrorShape {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export interface ProviderEnvelope<TData> {
  data: TData;
  meta?: {
    provider?: string;
    model?: string;
    requestId?: string;
  };
}

export interface GenerateResult {
  id: string;
  outputType: OutputType;
  title: string;
  summary: string;
  promptDraft: string;
  referenceImageName?: string;
  generatedAt: string;
  variants: GeneratedVariant[];
  suggestedNextActions: string[];
}
