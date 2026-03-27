import type { ImageGenerationPort } from './ports.js';
import type { GenerateRequest, GeneratedVariant, PromptPlan } from '../types.js';

const TYPE_THEMES: Record<GenerateRequest['outputType'], { palette: string[]; labels: string[] }> = {
  功能分区图: {
    palette: ['#E7B56A', '#7DB1A7', '#D97657', '#355C66'],
    labels: ['结构分区版', '层级强化版', '汇报配色版']
  },
  流线分析图: {
    palette: ['#D9654E', '#F0B85A', '#41838C', '#23444C'],
    labels: ['主次流线版', '节点组织版', '慢行系统版']
  },
  鸟瞰表达图: {
    palette: ['#87A97B', '#D8A569', '#4D7482', '#F5E6C8'],
    labels: ['暖调鸟瞰版', '公共空间版', '体块氛围版']
  }
};

function createSvgDataUrl(title: string, subtitle: string, palette: string[], index: number) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette[3]}" />
        <stop offset="100%" stop-color="${palette[1]}" />
      </linearGradient>
    </defs>
    <rect width="1200" height="760" fill="url(#bg)" />
    <g opacity="0.18">
      <circle cx="180" cy="180" r="140" fill="${palette[2]}" />
      <circle cx="980" cy="120" r="110" fill="${palette[0]}" />
      <circle cx="1040" cy="620" r="180" fill="${palette[2]}" />
    </g>
    <g stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.92">
      <path d="M120 520 C260 420, 360 430, 520 360 S820 280, 1080 170" />
      <path d="M160 620 C330 540, 470 560, 660 500 S940 420, 1100 340" opacity="0.65" />
      <path d="M220 160 L440 260 L390 470 L170 390 Z" fill="${palette[0]}" opacity="0.46" />
      <path d="M560 180 L860 260 L780 520 L500 440 Z" fill="${palette[1]}" opacity="0.46" />
      <path d="M860 300 L1030 360 L980 560 L780 520 Z" fill="${palette[2]}" opacity="0.42" />
    </g>
    <g fill="#F9F5ED">
      <text x="72" y="88" font-family="Segoe UI, sans-serif" font-size="42" font-weight="700">${title}</text>
      <text x="72" y="136" font-family="Segoe UI, sans-serif" font-size="24">${subtitle}</text>
      <text x="72" y="694" font-family="Segoe UI, sans-serif" font-size="18" opacity="0.85">PlanSketch Mock Variant 0${index + 1}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export class MockImageGenerationService implements ImageGenerationPort {
  readonly metadata = {
    kind: 'image-generation' as const,
    name: 'mock',
    mode: 'mock' as const
  };

  async generate(input: GenerateRequest, promptPlan: PromptPlan): Promise<GeneratedVariant[]> {
    const theme = TYPE_THEMES[input.outputType];

    return theme.labels.map((label, index) => ({
      id: `${input.outputType}-${index + 1}`,
      label,
      imageUrl: createSvgDataUrl(label, promptPlan.title, theme.palette, index),
      notes: `围绕“${promptPlan.title}”生成的 mock 变体，可替换为真实图像生成 API 返回结果。`
    }));
  }
}
