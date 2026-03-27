# PlanSketch API Pipeline v1

## 1. Objective

PlanSketch v1 should accept an uploaded base image and generate a presentation-grade planning expression image with minimal manual prompting.

Supported target outputs in v1:

- functional zoning map
- circulation analysis diagram
- bird's-eye concept expression

The pipeline should be optimized for:

- fast iteration
- stable prompt quality
- easy mocking during front-end development
- clear upgrade path to more professional workflows later

## 2. Recommended High-Level Flow

```text
Upload Image
  -> Input Normalization
  -> Vision Understanding
  -> Structured Scene Summary
  -> Prompt Builder
  -> Generation Request Builder
  -> Image Generation Provider
  -> Optional Light Post-Processing
  -> Output Asset + Metadata
```

## 3. Input Processing Design

### 3.1 Accepted Inputs For MVP

- site plan screenshots
- hand sketches
- planning board fragments
- aerial/reference screenshots
- CAD screenshots
- exported PNG/JPG plan images

Avoid in MVP:

- native DWG upload as first-class input
- multi-file project bundles
- vector-layer semantic ingestion

### 3.2 Input Normalization Stage

Responsibilities:

- validate file type and size
- generate a normalized working image
- create thumbnails
- preserve original upload reference
- capture basic metadata:
  - width
  - height
  - mime type
  - upload timestamp
  - source category

Recommended outputs:

```json
{
  "assetId": "upl_001",
  "originalUrl": "...",
  "normalizedUrl": "...",
  "thumbnailUrl": "...",
  "width": 2048,
  "height": 1536,
  "mimeType": "image/png",
  "sourceType": "cad_screenshot"
}
```

## 4. Vision Understanding Module

### 4.1 Module Goal

Convert the uploaded image into structured semantic data that downstream prompt building can trust.

The vision step should not directly generate the final output image. It should produce a machine-friendly interpretation.

### 4.2 Suggested Output Schema

```json
{
  "sceneType": "site_plan",
  "confidence": 0.86,
  "detectedElements": [
    "road network",
    "building footprints",
    "open space",
    "water edge"
  ],
  "composition": {
    "viewType": "top_down",
    "dominantOrientation": "north_up_like",
    "density": "medium"
  },
  "expressionHints": {
    "suitableOutputs": [
      "functional_zoning_map",
      "circulation_analysis"
    ],
    "visualClarity": "medium",
    "lineworkReadability": "high"
  },
  "risks": [
    "small labels unreadable",
    "boundary ambiguous"
  ],
  "userClarificationNeeded": false
}
```

### 4.3 Vision Module Responsibilities

- classify image category
- identify major spatial components
- infer likely planning-expression opportunities
- flag ambiguity or low-quality inputs
- detect whether the image is better suited for:
  - image-to-image generation
  - prompt-only regeneration with reference hints
  - clarification request

### 4.4 Failure Policy

If the vision module is uncertain:

- do not continue silently with a fabricated prompt
- mark the job as `needs_clarification` or degrade gracefully to a conservative template

## 5. Prompt Builder Design

### 5.1 Core Principle

Prompt building should be deterministic, structured, and versioned.

Do not concatenate raw user text with ad hoc instructions. Use a template engine with well-defined slots.

### 5.2 Inputs To Prompt Builder

- selected output type
- user free-text description
- image understanding JSON
- style preset
- prompt version

### 5.3 Internal Prompt Sections

1. task block
2. spatial content block
3. visual style block
4. composition block
5. negative constraint block
6. fidelity block

Example logical structure:

```json
{
  "task": "Create a report-grade functional zoning expression image.",
  "spatialIntent": [
    "preserve the overall site boundary logic",
    "clarify major land-use partitions",
    "highlight public space and water-edge areas"
  ],
  "visualStyle": [
    "clean planning board graphic style",
    "clear color partitions",
    "minimal but legible annotations"
  ],
  "constraints": [
    "avoid photorealism",
    "avoid messy text artifacts",
    "avoid excessive decorative rendering"
  ]
}
```

### 5.4 Prompt Versioning

Every prompt should record:

- `promptVersion`
- `templateId`
- `outputType`
- `providerAdapter`

This makes quality iteration measurable.

## 6. Image Generation Module

### 6.1 Generation Modes

For MVP, support these two modes:

1. reference-guided generation
   Best for screenshots / sketches / CAD screenshots

2. text + reference hybrid generation
   Best for bird's-eye concept expression

Avoid for MVP:

- full agentic multi-step image editing loops
- multi-pass automated compositing

### 6.2 Generation Request Contract

```json
{
  "jobId": "job_001",
  "mode": "image_reference_hybrid",
  "outputType": "functional_zoning_map",
  "referenceImages": ["..."],
  "prompt": "...",
  "negativePrompt": "...",
  "size": "1536x1024",
  "provider": "openai_images",
  "providerOptions": {
    "quality": "high"
  }
}
```

### 6.3 Post-Processing For MVP

Keep this light:

- output normalization
- asset storage
- metadata persistence
- optional watermark/tag for internal preview

Do not add heavy CV post-processing initially.

## 7. Mock vs Real API Switching

### 7.1 Why This Matters

The front-end and orchestration layer should be buildable even when:

- API keys are not ready
- costs need control
- prompts are still evolving
- provider choice may change

### 7.2 Adapter Interface

Use a provider abstraction like:

```ts
interface VisionProvider {
  analyze(input: AnalyzeInput): Promise<AnalyzeResult>;
}

interface ImageGenerationProvider {
  generate(input: GenerateInput): Promise<GenerateResult>;
}
```

### 7.3 Recommended Runtime Modes

- `mock`
- `hybrid`
- `real`

Behavior:

- `mock`: both vision and generation return deterministic fixture data
- `hybrid`: real vision, mock generation or the reverse
- `real`: both hit live providers

### 7.4 Mock Strategy

Mocks should include:

- successful job response
- low-confidence vision response
- generation timeout
- provider refusal / invalid prompt case

This is more valuable than a single happy-path mock.

## 8. Suggested API Surface

### 8.1 Core Endpoints

- `POST /api/uploads`
- `POST /api/vision/analyze`
- `POST /api/prompts/build`
- `POST /api/generations`
- `GET /api/generations/:jobId`

### 8.2 Simplified Job Flow

Option A: front-end composes pipeline via multiple calls

Pros:

- transparent debugging
- easier UI iteration

Cons:

- more client orchestration

Option B: server exposes one orchestration endpoint

- `POST /api/generate-from-image`

Pros:

- cleaner client
- easier provider switching

Cons:

- harder to inspect intermediate stages unless debug metadata is returned

Recommendation:

- expose orchestration endpoint for product flow
- keep internal stage endpoints or debug-only endpoints for development

## 9. Data Contracts Worth Storing

Persist these records:

- upload asset metadata
- vision JSON result
- prompt JSON and final rendered prompt
- generation request payload
- provider response summary
- final output asset URL
- latency and error metrics

This becomes the evaluation dataset for later tuning.

## 10. Extension Path To Professional Scenarios

Phase 2 additions:

- multi-image fusion
- preset libraries for different planning firms / board styles
- partial region editing
- text overlay suggestions
- user-editable scene interpretation

Phase 3 additions:

- CAD-aware preprocessing
- structured layer extraction
- rule-aware template packs
- project memory / style memory

## 11. MVP Non-Goals

Do not include in v1:

- GIS analysis
- native CAD export
- regulatory compliance checking
- exact geometry preservation guarantees
- full planning document automation
