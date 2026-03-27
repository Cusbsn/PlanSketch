# Provider Integration Guide

这份文档专门给后续接手 provider 的人看，目标是：

- 不改前端页面
- 不扩产品范围
- 只在现有三段能力里替换 provider 实现

## 先看这几个文件

后续接 provider 时，最关键先看：

- `server/services/ports.ts`
- `server/providers/createProviderBundle.ts`
- `server/config.ts`
- `server/providers/templates/exampleProvider.template.ts`
- `server/types.ts`

如果是先接图像理解，另外优先参考：

- `server/providers/openaiResponsesImageUnderstandingProvider.ts`

## 当前 provider 结构

系统把后端生成链路拆成三段：

1. `ImageUnderstandingPort`
2. `PromptBuilderPort`
3. `ImageGenerationPort`

编排固定在 `server/services/planSketchGenerator.ts`，不要把厂商逻辑写进编排器。

## 推荐接入步骤

### 1. 先决定接哪一段

建议顺序：

1. `image understanding`
2. `prompt builder`
3. `image generation`

原因是前两段更容易稳定输入输出，不会太早把系统拖进异步生图复杂度。

### 2. 复制模板文件

参考：

- `server/providers/templates/exampleProvider.template.ts`

按你的厂商拆成 1 个或 3 个 provider 文件都可以，但每个类只做一件事，分别实现对应 port。

### 3. 保持输入输出契约稳定

所有 provider 都必须对齐 `server/types.ts`：

- 图像理解返回 `ImageInsight`
- Prompt 构造返回 `PromptPlan`
- 生图返回 `GeneratedVariant[]`

如果厂商返回结构不同，应该在 provider 内部做转换，不要把脏结构传给上层。

### 4. 在 bundle 里注册 provider

修改：

- `server/providers/createProviderBundle.ts`

要做的事：

- 导入新的 provider 类
- 按环境变量里的 provider 名分支创建实例
- 保留 mock fallback

### 5. 配环境变量

修改：

- `.env`
- 如有必要补充 `.env.example`

每段一般至少会用到：

- provider 名
- base URL
- API key
- model
- timeout

## 当前 fallback 逻辑

如果启用：

```env
PLANSKETCH_FALLBACK_TO_MOCK=true
```

那么 real provider 失败时会自动退回 mock。

推荐在真实 provider 初接阶段始终保持开启，避免演示流程中断。

## 错误处理约定

provider 内建议遵守这几个规则：

- 配置缺失时，直接抛错
- 外部请求失败时，抛出带 provider 名的错误
- 返回结构不合法时，立即抛错
- 不要在 provider 内吞错并返回假数据

原因是：fallback 是否触发，依赖 provider 明确抛错。

## 最小返回结构要求

### ImageInsight

```ts
{
  sceneSummary: string;
  keyElements: string[];
  spatialFocus: string[];
}
```

### PromptPlan

```ts
{
  title: string;
  summary: string;
  promptDraft: string;
}
```

### GeneratedVariant[]

```ts
[
  {
    id: string;
    label: string;
    imageUrl: string;
    notes: string;
  }
]
```

## generic-http provider 的定位

当前已有的 `generic-http` provider 是一个最小参考实现：

- 演示 provider 应该怎么接进系统
- 演示怎么做配置校验、请求、错误抛出、结构约束
- 不是最终推荐绑定方式

如果后续接 SDK 型厂商，也建议保持外层接口不变，只替换 provider 内部实现。

## OpenAI Responses image understanding 接法

当前项目已经内置一个真实 image understanding adapter：

- `server/providers/openaiResponsesImageUnderstandingProvider.ts`

它做的事情是：

- 把 `referenceImageDataUrl` 作为多模态图片输入发送到 Responses API
- 把输出类型和用户补充描述一起发送
- 用 JSON schema 约束模型返回 `sceneSummary`、`keyElements`、`spatialFocus`
- 在 provider 内部完成结果解析和结构校验

推荐配置：

```env
PLANSKETCH_PROVIDER_MODE=real
PLANSKETCH_FALLBACK_TO_MOCK=true
PLANSKETCH_IMAGE_UNDERSTANDING_PROVIDER=openai-responses
PLANSKETCH_IMAGE_UNDERSTANDING_BASE_URL=https://api.openai.com/
PLANSKETCH_IMAGE_UNDERSTANDING_API_KEY=your-openai-key
PLANSKETCH_IMAGE_UNDERSTANDING_MODEL=gpt-4.1-mini
```

如果 OpenAI 请求失败，且开启 fallback，则自动退回 `mockImageUnderstanding`。

## 不建议做的事

- 不要把厂商 SDK 逻辑写进 `server/index.ts`
- 不要把厂商返回结构直接透传给前端
- 不要删除 mock provider
- 不要把 fallback 逻辑散落到多个文件

## 最短接入路径

如果你只想先打通一段真实 provider，最短路径是：

1. 参考 `server/providers/templates/exampleProvider.template.ts` 新建 provider
2. 修改 `server/providers/createProviderBundle.ts` 注册它
3. 配 `.env`
4. 保持 `PLANSKETCH_FALLBACK_TO_MOCK=true`
5. 先测 `GET /api/health` 和一次 `POST /api/generate`
