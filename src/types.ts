export type OutputType = '功能分区图' | '流线分析图' | '鸟瞰表达图';

export type GenerationStep = 'welcome' | 'editing' | 'generating' | 'result';

export interface GenerateRequest {
  outputType: OutputType;
  description: string;
  referenceImageName?: string;
  referenceImageDataUrl?: string;
}

export interface GenerateResult {
  id: string;
  outputType: OutputType;
  title: string;
  summary: string;
  promptDraft: string;
  referenceImageName?: string;
  generatedAt: string;
  variants: Array<{
    id: string;
    label: string;
    imageUrl: string;
    notes: string;
  }>;
  suggestedNextActions: string[];
}
