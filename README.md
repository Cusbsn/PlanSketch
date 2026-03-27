# PlanSketch MVP

一个面向城乡规划 / 建筑表达场景的 AI 图像生成 Web 原型。

当前版本覆盖：

- 上传参考图（底图 / 截图 / 手绘 / CAD 截图）
- 选择输出类型：功能分区图、流线分析图、鸟瞰表达图
- 输入补充描述（风格、重点、色调）
- 完整前端流程：首页、上传区、类型选择、描述输入、生成中状态、结果展示页
- 可切换的 provider 架构：当前默认返回 mock 结果，后续可接入真实视觉理解、Prompt 生成、生图 API

## 技术栈

- 前端：React + TypeScript + Vite
- 后端：Express + TypeScript
- 开发体验：`tsx` + `concurrently`

选择原因：依赖少、启动快、结构简单，适合 MVP 先跑通流程，再继续迭代。

## 启动方式

1. 安装依赖

```bash
npm install
```

可选：复制环境变量模板并按需修改

```bash
copy .env.example .env
```

2. 启动前后端开发环境

```bash
npm run dev
```

3. 打开浏览器访问

```text
http://localhost:5173
```

前端会通过 Vite 代理将 `/api` 请求转发到 `http://localhost:8787`。

开发模式默认行为：

- `npm run dev`：同时启动前端 Vite 和后端 Express
- `npm run dev:client`：只启动前端
- `npm run dev:server`：只启动后端

## 构建

```bash
npm run build
```

这会输出：

- `dist/`：前端生产构建
- `dist-server/`：后端编译结果

## 预览生产构建

先执行：

```bash
npm run build
```

再执行：

```bash
npm run preview
```

预览模式默认行为：

- `npm run preview`：同时启动生产后端和 Vite preview
- `npm run preview:client`：只预览前端静态产物
- `npm run preview:server`：只启动编译后的后端服务

默认访问地址：

```text
http://localhost:4173
```

## 项目结构

```text
PlanSketch/
├─ src/
│  ├─ api/                # 前端 API 请求封装
│  ├─ components/         # UI 组件
│  ├─ App.tsx             # 主流程页面
│  ├─ main.tsx            # 前端入口
│  ├─ styles.css          # 页面样式
│  └─ types.ts            # 前端类型定义
├─ server/
│  ├─ providers/          # provider / adapter 层
│  ├─ config.ts           # 环境变量配置读取
│  ├─ services/
│  │  ├─ ports.ts                 # provider 接口与 metadata 定义
│  │  ├─ mockImageUnderstanding.ts# mock 图像理解 provider
│  │  ├─ mockPromptBuilder.ts     # mock prompt provider
│  │  ├─ mockImageGenerator.ts    # mock 生图 provider
│  │  └─ planSketchGenerator.ts   # 总编排服务
│  ├─ index.ts            # Express API 入口
│  └─ types.ts            # 后端类型定义
├─ docs/
│  ├─ provider-architecture.md
│  └─ provider-integration-guide.md
├─ .env.example
├─ .gitignore
├─ index.html
├─ package.json
├─ tsconfig*.json
└─ vite.config.ts
```

## Provider 架构说明

`POST /api/generate` 的内部流程拆成三段 provider，并由一个编排器串起来：

1. `ImageUnderstandingPort`
   - 从参考图中提取场地结构、道路、水系、体块等信息
   - 当前支持：`mock`、`generic-http`、`openai-responses`

2. `PromptBuilderPort`
   - 把表达类型 + 图像理解结果 + 用户描述整理成 Prompt
   - 当前支持：`mock`、`generic-http` 骨架

3. `ImageGenerationPort`
   - 输出变体图 URL、任务 ID、元数据等
   - 当前支持：`mock`、`generic-http` 骨架

编排逻辑在 `server/services/planSketchGenerator.ts`，provider 注册与 fallback 逻辑在 `server/providers/createProviderBundle.ts`。

## 如何切换 mock / real

### 默认：mock 模式

```env
PLANSKETCH_PROVIDER_MODE=mock
```

这时三个阶段都会直接使用 mock provider。

### 切到 real 骨架模式

```env
PLANSKETCH_PROVIDER_MODE=real
PLANSKETCH_FALLBACK_TO_MOCK=true
PLANSKETCH_IMAGE_UNDERSTANDING_PROVIDER=openai-responses
PLANSKETCH_PROMPT_BUILDER_PROVIDER=generic-http
PLANSKETCH_IMAGE_GENERATION_PROVIDER=generic-http
```

此时图像理解阶段会优先调用 OpenAI Responses 多模态 provider；如果缺少配置或调用失败，会自动回退到 mock。

### 常用环境变量

```env
PLANSKETCH_IMAGE_UNDERSTANDING_BASE_URL=
PLANSKETCH_IMAGE_UNDERSTANDING_API_KEY=
PLANSKETCH_IMAGE_UNDERSTANDING_MODEL=

PLANSKETCH_PROMPT_BUILDER_BASE_URL=
PLANSKETCH_PROMPT_BUILDER_API_KEY=
PLANSKETCH_PROMPT_BUILDER_MODEL=

PLANSKETCH_IMAGE_GENERATION_BASE_URL=
PLANSKETCH_IMAGE_GENERATION_API_KEY=
PLANSKETCH_IMAGE_GENERATION_MODEL=
```

完整示例见 `.env.example`。

### OpenAI Responses 图像理解推荐配置

```env
PLANSKETCH_PROVIDER_MODE=real
PLANSKETCH_FALLBACK_TO_MOCK=true
PLANSKETCH_IMAGE_UNDERSTANDING_PROVIDER=openai-responses
PLANSKETCH_IMAGE_UNDERSTANDING_BASE_URL=https://api.openai.com/
PLANSKETCH_IMAGE_UNDERSTANDING_API_KEY=your-openai-key
PLANSKETCH_IMAGE_UNDERSTANDING_MODEL=gpt-4.1-mini
```

当前 `openai-responses` adapter 会把参考图和用户描述一起发送给 Responses API，并统一转换回 `ImageInsight`：

```ts
{
  sceneSummary: string;
  keyElements: string[];
  spatialFocus: string[];
}
```

## 后续如何接入真实 API

### 1. 接入图像理解

- 推荐优先新增 `server/providers/<yourProvider>ImageUnderstandingProvider.ts`
- 让它实现 `ImageUnderstandingPort`
- 在 `server/providers/createProviderBundle.ts` 里按 provider 名注册
- 保持返回统一的 `ImageInsight` 结构

### 2. 接入 Prompt 生成

- 新增 `server/providers/<yourProvider>PromptBuilderProvider.ts`
- 实现 `PromptBuilderPort`
- 返回 `PromptPlan`，前端无需改动

### 3. 接入图像生成 API

- 新增 `server/providers/<yourProvider>ImageGenerationProvider.ts`
- 实现 `ImageGenerationPort`
- 建议返回远程图片 URL、任务状态、失败重试信息

### 当前推荐接法

- 第一优先：先接 `image understanding provider`
- 原因：它对现有结果质量提升最直接，同时不需要立刻引入复杂异步生图流程
- 第二步再接 `prompt builder provider`
- `image generation provider` 放在最后接，便于把前两段输入先稳定下来

### 4. 如果要支持异步任务

建议进一步扩展：

- 新增任务状态接口，例如 `GET /api/tasks/:id`
- 前端在“生成中”阶段轮询任务状态
- 将结果页改为读取任务结果而不是等待单次请求直接返回

## MVP 范围外

当前未实现：

- 登录
- 支付
- CAD 导出
- GIS 分析
- 地图抓取
- 复杂数据库

## 首次拉取建议

推荐顺序：

1. `npm install`
2. 可选执行 `copy .env.example .env`
3. 使用默认 mock 模式直接执行 `npm run dev`
4. 如果要接真实图像理解，再补 `PLANSKETCH_IMAGE_UNDERSTANDING_*` 环境变量

## 建议下一步

1. 优先新增一个真实 `image understanding provider`，验证参考图解析链路
2. 再接一个稳定的 `prompt builder provider`，把三种类型的 Prompt 模板沉淀下来
3. 最后替换 `image generation provider`，视目标服务决定是否升级为异步任务模式
4. 阅读 `docs/provider-architecture.md`，按 provider 名注册新 adapter
