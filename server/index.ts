import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { loadConfig } from './config.js';
import { createProviderBundle } from './providers/createProviderBundle.js';
import { PlanSketchGenerator } from './services/planSketchGenerator.js';
import type { GenerateRequest } from './types.js';

const app = express();
const config = loadConfig();
const providerBundle = createProviderBundle(config);
const generator = new PlanSketchGenerator(providerBundle);
const port = config.port;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'plansketch-mvp-api',
    mode: config.mode,
    fallbackToMock: config.fallbackToMock,
    providers: {
      imageUnderstanding: providerBundle.imageUnderstanding.metadata,
      promptBuilder: providerBundle.promptBuilder.metadata,
      imageGeneration: providerBundle.imageGeneration.metadata
    }
  });
});

app.post('/api/generate', async (request, response) => {
  const body = request.body as GenerateRequest;

  if (!body.outputType || !body.description || !body.referenceImageDataUrl) {
    response.status(400).send('缺少必要参数，请上传参考图并补充说明。');
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    const result = await generator.generate(body);
    response.json(result);
  } catch (error) {
    console.error(error);
    response.status(500).send('服务暂时不可用，请稍后重试。');
  }
});

app.listen(port, () => {
  console.log(`PlanSketch API listening on http://localhost:${port}`);
});
