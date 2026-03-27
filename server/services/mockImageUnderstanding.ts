import type { ImageUnderstandingPort } from './ports.js';
import type { GenerateRequest, ImageInsight } from '../types.js';

export class MockImageUnderstandingService implements ImageUnderstandingPort {
  readonly metadata = {
    kind: 'image-understanding' as const,
    name: 'mock',
    mode: 'mock' as const
  };

  async analyze(input: GenerateRequest): Promise<ImageInsight> {
    const keywords = input.description
      .split(/[，,。.;；\n]/)
      .map((item: string) => item.trim())
      .filter(Boolean)
      .slice(0, 4);

    return {
      sceneSummary: `识别到一张适合进行${input.outputType}表达的参考图，后续可结合真实视觉模型提取道路、边界、建筑体块和开放空间。`,
      keyElements: keywords.length > 0 ? keywords : ['公共空间', '道路骨架', '场地边界'],
      spatialFocus: ['主入口区域', '核心开放空间', '主要界面转折']
    };
  }
}
