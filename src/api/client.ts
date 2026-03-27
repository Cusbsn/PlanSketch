import type { GenerateRequest, GenerateResult } from '../types';

export async function generatePlanSketch(payload: GenerateRequest): Promise<GenerateResult> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || '生成失败，请稍后重试。');
  }

  return response.json();
}
