# PlanSketch API Selection v1

## 1. Purpose

This document aligns with the current PlanSketch MVP direction and existing provider architecture, and recommends which real APIs should be connected first.

Aligned sources:

- [available-skills-audit.md](/F:/PlanSketch/docs/available-skills-audit.md)
- [api-pipeline.md](/F:/PlanSketch/docs/api-pipeline.md)
- [prompt-strategy.md](/F:/PlanSketch/docs/prompt-strategy.md)
- [mvp-tech-plan.md](/F:/PlanSketch/docs/mvp-tech-plan.md)
- [provider-architecture.md](/F:/PlanSketch/docs/provider-architecture.md)
- [README.md](/F:/PlanSketch/README.md)

This recommendation also considers the current backend structure already present under [server/providers](/F:/PlanSketch/server/providers) and [server/services](/F:/PlanSketch/server/services).

## 2. Executive Recommendation

PlanSketch v1 should **first connect a real image understanding API**, not all three real APIs at once.

Most recommended first real API class:

- `image understanding provider`

Most recommended first vendor path:

- OpenAI Responses API for multimodal image understanding

Most recommended v1 staged combination:

1. `image-understanding`: real
2. `prompt-builder`: local deterministic templates first
3. `image-generation`: real in the second step, after vision and prompt contracts stabilize

Reason:

- current docs consistently position PlanSketch as an `AI expression accelerator`, not a GIS/CAD precision engine
- the existing provider split already isolates the three stages cleanly
- the largest early quality gain comes from better semantic understanding of the uploaded image
- prompt generation is already best handled with versioned templates
- image generation is the most visually important but also the most cost-sensitive and debugging-heavy stage

## 3. Recommended Real API Strategy By Stage

## 3.1 Image Understanding

Recommended v1 choice:

- OpenAI `Responses API`
- model tier recommendation:
  - default: `gpt-4.1-mini`
  - quality-upgrade option: `gpt-4.1`

Why this is the best first connection:

- OpenAI currently recommends the Responses API for new projects, with native multimodal support including image input
- `gpt-4.1-mini` supports image input, is much cheaper than larger general-purpose models, and is fast enough for MVP interaction loops
- this stage benefits more from structured JSON extraction than from long-form reasoning
- it matches the current PlanSketch design goal: convert screenshots / sketches / CAD screenshots into normalized scene summaries

What this provider should do:

- classify input type
- extract key spatial elements
- infer suitable output modes
- flag ambiguity and confidence
- return stable JSON matching the existing `ImageInsight` direction

Why not start with a heavier reasoning model here:

- the task is mostly multimodal parsing + structured extraction
- MVP should optimize latency and cost
- deep reasoning brings less marginal value here than a stable prompt/output schema

Relevant OpenAI docs:

- Responses API recommendation for new projects: [Migrate to the Responses API](https://platform.openai.com/docs/guides/responses-vs-chat-completions)
- image-input capable model reference: [GPT-4.1 mini](https://platform.openai.com/docs/models/gpt-4.1-mini)
- higher-quality option: [GPT-4.1](https://platform.openai.com/docs/models/gpt-4.1)

## 3.2 Prompt Generation

Recommended v1 choice:

- **do not prioritize a separate real provider first**
- keep `prompt-builder` as a local deterministic template module inside PlanSketch

Fallback/phase-1.5 option:

- if a real API is still desired, use OpenAI `Responses API` with a small text+vision-capable model, but only as a guarded helper and not as the source of truth

Why this is the right priority:

- existing docs already define prompt building as a structured, versioned, template-based system
- PlanSketch needs controllability more than “creative prompt writing”
- prompt quality in this product depends mainly on:
  - good scene understanding JSON
  - good template design
  - good output-type-specific constraints
- pushing prompt generation too early into a separate model API makes outputs harder to debug and harder to stabilize

Recommended v1 implementation mode:

- local templates by output type
- local style preset mapping
- local negative prompt blocks
- store `promptVersion`, `templateId`, `providerAdapter`

When to move prompt generation to a real model:

- phase 2, when you want:
  - adaptive prompt expansion
  - multi-image prompt fusion
  - project memory
  - semi-automatic style transfer recipes

## 3.3 Image Generation

Recommended v1 choice:

- OpenAI image generation API
- model tier recommendation:
  - cost-first default: `gpt-image-1-mini`
  - quality-first upgrade: `gpt-image-1`

Why this is the best second real connection:

- current OpenAI image models support text + image inputs and produce image outputs
- this fits PlanSketch's `reference-guided` and `text + reference hybrid` modes
- one vendor across image understanding and generation reduces integration overhead in v1
- the existing provider architecture makes later vendor replacement possible

How to use it in PlanSketch:

- zoning / circulation outputs:
  - start with reference-guided generation
- bird's-eye concept outputs:
  - use text + reference hybrid generation
- keep post-processing light
- save request/response metadata for tuning

Relevant OpenAI docs:

- image generation guide: [Image generation](https://platform.openai.com/docs/guides/tools-image-generation/)
- image API reference: [Images API overview](https://platform.openai.com/docs/api-reference/images/overview)
- low-cost model: [gpt-image-1-mini](https://platform.openai.com/docs/models/gpt-image-1-mini)
- higher-quality model: [gpt-image-1](https://platform.openai.com/docs/models/gpt-image-1)

## 4. Priority Order Recommendation

Recommended integration order:

1. real `image-understanding provider`
2. keep `prompt-builder provider` local/template-driven
3. real `image-generation provider`
4. only later consider model-assisted prompt optimization

Why this order is best:

### 4.1 First connect image understanding

- lowest coordination cost with current architecture
- clearest improvement to semantic accuracy
- easiest stage to evaluate with JSON fixtures
- least likely to destabilize front-end flow

### 4.2 Then stabilize prompt builder locally

- prompt strategy is already documented
- versioned templates are easier to debug than model-written prompts
- lets the team build an internal quality baseline

### 4.3 Then connect image generation

- biggest user-facing wow factor
- also highest risk for cost spikes and inconsistent outputs
- easier to tune once upstream understanding/prompt inputs are stable

## 5. Cost, Complexity, and Expected Gain

## 5.1 Comparison Table

| Stage | Recommended v1 approach | Cost | Implementation complexity | Expected quality gain | MVP fit |
| --- | --- | --- | --- | --- | --- |
| Image understanding | OpenAI Responses API + `gpt-4.1-mini` | Low to medium | Low to medium | High | Very high |
| Prompt generation | Local deterministic builder | Very low | Low | High stability, medium output lift | Very high |
| Prompt generation alternative | OpenAI model-generated prompts | Medium | Medium | Medium, but lower controllability | Medium |
| Image generation | OpenAI `gpt-image-1-mini` | Medium | Medium | High | High |
| Image generation upgrade | OpenAI `gpt-image-1` | Medium to high | Medium | Higher polish | Medium to high |

## 5.2 Interpretation

- the best cost-to-value first move is `real image understanding`
- the best stability-to-value move is `local prompt builder`
- the best visual-upside move is `real image generation`, but it should come after the first two are stable

## 6. MVP vs Phase 2

## 6.1 Suitable For MVP

- OpenAI Responses API for image understanding
- local prompt templates and negative prompt blocks
- one OpenAI image generation provider
- provider fallback to mock
- per-stage metadata persistence

## 6.2 Better In Phase 2

- model-assisted prompt rewriting
- multi-provider routing by output type
- multi-image fusion
- region editing / inpainting workflows
- firm-style presets
- adaptive prompt tuning based on prior outputs

## 6.3 High Risk, Do Not Prioritize Yet

- native CAD/DWG/DXF parsing providers
- GIS analysis APIs
- geometry-faithful generation promises
- compliance or regulation reasoning
- full multi-vendor orchestration from day one

## 7. Recommended Provider Naming

The current naming scheme already fits the project well. Keep provider names explicit and stage-specific.

Recommended stage names:

- `image-understanding`
- `prompt-builder`
- `image-generation`

Recommended provider IDs for v1:

- `mock`
- `generic-http`
- `openai-responses`
- `openai-images`

Recommended future provider IDs if needed later:

- `replicate-image`
- `fal-image`
- `vendor-x-http`

Recommended environment variable pattern:

```env
PLANSKETCH_IMAGE_UNDERSTANDING_PROVIDER=openai-responses
PLANSKETCH_PROMPT_BUILDER_PROVIDER=mock
PLANSKETCH_IMAGE_GENERATION_PROVIDER=openai-images
```

This is clearer than overloading everything into `generic-http` once the first true vendor adapter is introduced.

## 8. Recommended Connection Sequence In Current Codebase

Based on the existing structure in [createProviderBundle.ts](/F:/PlanSketch/server/providers/createProviderBundle.ts), the cleanest sequence is:

1. add `OpenAIResponsesImageUnderstandingProvider`
2. register provider key `openai-responses`
3. keep prompt builder on local/mock implementation
4. add `OpenAIImageGenerationProvider`
5. register provider key `openai-images`
6. keep `generic-http` as a neutral escape hatch for future vendor experiments

Suggested file naming style:

```text
server/providers/openAIResponsesImageUnderstandingProvider.ts
server/providers/openAIImageGenerationProvider.ts
```

If you want stricter consistency with existing file names, prefer:

```text
server/providers/openAIImageUnderstandingProvider.ts
server/providers/openAIImageGenerationProvider.ts
```

Either way, the provider key exposed to config should stay short and stable.

## 9. Final Recommendation

PlanSketch v1 should **first connect a real OpenAI multimodal image understanding API**, specifically through the Responses API, while keeping prompt building local and deterministic.

After that, connect a single OpenAI image generation provider.

This gives the best balance of:

- fast MVP delivery
- controllable outputs
- manageable costs
- low integration risk
- compatibility with the existing provider architecture

If a single sentence decision is needed:

`First connect real image understanding, then connect image generation, and keep prompt building local in v1.`
