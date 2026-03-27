import type { GenerateRequest, GenerateResult } from '../types.js';
import type { ProviderBundle } from './ports.js';

export class PlanSketchGenerator {
  constructor(private readonly providers: ProviderBundle) {}

  async generate(input: GenerateRequest): Promise<GenerateResult> {
    const insight = await this.providers.imageUnderstanding.analyze(input);
    const promptPlan = await this.providers.promptBuilder.build(input, insight);
    const variants = await this.providers.imageGeneration.generate(input, promptPlan);

    return {
      id: `ps-${Date.now()}`,
      outputType: input.outputType,
      title: promptPlan.title,
      summary: promptPlan.summary,
      promptDraft: promptPlan.promptDraft,
      referenceImageName: input.referenceImageName,
      generatedAt: new Date().toISOString(),
      variants,
      suggestedNextActions: [
        '接入真实图像理解模型，自动抽取道路、边界、体块和开放空间要素',
        '将 PromptBuilder 替换为规则引擎或 LLM，形成更稳定的表达模板',
        '将 ImageGenerationPort 对接 Midjourney、Stable Diffusion 或其他图像 API'
      ]
    };
  }
}
