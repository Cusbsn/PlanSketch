import type { PromptBuilderPort } from './ports.js';
import type { GenerateRequest, ImageInsight, PromptPlan } from '../types.js';

const TITLES: Record<GenerateRequest['outputType'], string> = {
  功能分区图: '功能结构概念表达',
  流线分析图: '多层级流线分析表达',
  鸟瞰表达图: '总体鸟瞰氛围表达'
};

export class MockPromptBuilderService implements PromptBuilderPort {
  readonly metadata = {
    kind: 'prompt-builder' as const,
    name: 'mock',
    mode: 'mock' as const
  };

  async build(input: GenerateRequest, insight: ImageInsight): Promise<PromptPlan> {
    const title = TITLES[input.outputType];
    const summary = `${insight.sceneSummary} 当前重点：${insight.keyElements.join(' / ')}；空间关注：${insight.spatialFocus.join(' / ')}。`;
    const promptDraft = `${input.outputType}，规划表达，突出${insight.keyElements.join('、')}，重点关注${insight.spatialFocus.join('、')}，${input.description}`;

    return {
      title,
      summary,
      promptDraft
    };
  }
}
