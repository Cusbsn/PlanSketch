# Provider Architecture

PlanSketch 当前把后端生成链路拆成三类 provider：

- `image understanding provider`
- `prompt builder provider`
- `image generation provider`

每一类 provider 都有统一接口，编排仍由 `server/services/planSketchGenerator.ts` 负责。

## 当前目录

```text
server/
├─ config.ts                         # 环境变量读取
├─ providers/
│  ├─ createProviderBundle.ts        # provider 注册和 fallback 组装
│  ├─ genericHttpClient.ts           # 通用 HTTP JSON client
│  ├─ genericHttpImageUnderstandingProvider.ts
│  ├─ openaiResponsesImageUnderstandingProvider.ts
│  ├─ genericHttpPromptBuilderProvider.ts
│  └─ genericHttpImageGenerationProvider.ts
└─ services/
   ├─ ports.ts                       # provider 接口与 metadata 定义
   ├─ planSketchGenerator.ts         # 三段能力编排
   ├─ mockImageUnderstanding.ts      # mock provider
   ├─ mockPromptBuilder.ts           # mock provider
   └─ mockImageGenerator.ts          # mock provider
```

## 切换逻辑

默认是 `mock` 模式。

如果设置：

```env
PLANSKETCH_PROVIDER_MODE=real
```

通常建议把 image understanding 单独切到 `openai-responses`，其他两段先保持 `mock` 或 `generic-http`。若请求失败，且：

```env
PLANSKETCH_FALLBACK_TO_MOCK=true
```

则会自动回退到 mock provider，保证前端流程还能跑通。

## openai-responses 的定位

`openai-responses` 是当前第一段真实能力的推荐接法，用于 image understanding。

它的特点：

- 使用 OpenAI Responses API 的多模态输入
- 发送参考图 + 用户描述 + 输出类型
- 通过 JSON schema 约束返回 `ImageInsight`
- 仍然服从统一 provider 接口，可失败后回退 mock

推荐环境变量：

```env
PLANSKETCH_PROVIDER_MODE=real
PLANSKETCH_FALLBACK_TO_MOCK=true
PLANSKETCH_IMAGE_UNDERSTANDING_PROVIDER=openai-responses
PLANSKETCH_IMAGE_UNDERSTANDING_BASE_URL=https://api.openai.com/
PLANSKETCH_IMAGE_UNDERSTANDING_API_KEY=your-openai-key
PLANSKETCH_IMAGE_UNDERSTANDING_MODEL=gpt-4.1-mini
```

## generic-http 的定位

`generic-http` 不是某一家的 SDK 绑定，而是一个最小适配骨架，约定按 HTTP JSON 方式调用外部能力：

- `POST /image-understanding`
- `POST /prompt-builder`
- `POST /image-generation`

它的意义是：

- 先把 provider 层职责和配置入口整理清楚
- 后续可以很容易替换成具体厂商的 adapter
- 不会现在就把项目绑死在某一个 API 结构上

## 如果要接真实服务，建议怎么改

### 接法 A：先替换单一阶段

推荐先从 `image understanding provider` 开始：

1. 新增一个 provider 文件，例如：
   - `server/providers/vendorXImageUnderstandingProvider.ts`
2. 让它实现 `ImageUnderstandingPort`
3. 在 `server/providers/createProviderBundle.ts` 里注册 provider 名称
4. 设置环境变量：

```env
PLANSKETCH_PROVIDER_MODE=real
PLANSKETCH_IMAGE_UNDERSTANDING_PROVIDER=vendor-x
```

如果你只是想先把真实图像理解接起来，当前最短路径是直接启用 `openai-responses`。

### 接法 B：三段分别使用不同厂商

当前架构支持每个阶段单独切：

```env
PLANSKETCH_IMAGE_UNDERSTANDING_PROVIDER=vendor-a
PLANSKETCH_PROMPT_BUILDER_PROVIDER=vendor-b
PLANSKETCH_IMAGE_GENERATION_PROVIDER=vendor-c
```

这适合后续把多模态理解、文本生成、图像生成拆开选型。

## 推荐实践

- 默认保留 `mock` 作为 fallback，避免真实接口不稳定时影响演示
- 先只接一类真实 provider，减少联调变量
- 优先保证返回结构与 `server/types.ts` 一致，让前端无需改动
