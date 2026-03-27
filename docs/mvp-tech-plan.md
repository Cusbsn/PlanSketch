# PlanSketch MVP Tech Plan

## 1. Product Focus

PlanSketch MVP should focus on a narrow, strong value proposition:

`Turn planning / architectural reference images into presentation-grade expression graphics faster.`

That means:

- support a small number of high-value output modes
- keep the AI pipeline inspectable
- minimize unstable magic
- avoid complex professional promises too early

## 2. Recommended MVP Scope

### In Scope

- image upload
- output type selection
- user supplemental description
- multimodal image understanding
- structured prompt building
- image generation orchestration
- mock/real provider switching
- result history metadata for debugging

### Explicitly Out Of Scope

- login
- payment
- GIS analysis
- native CAD export
- native DWG/DXF intelligence
- planning compliance automation
- full board-layout automation

## 3. Most Recommended API Combination

### First Recommendation

Use a two-part model strategy:

1. multimodal understanding: OpenAI vision-capable model
2. image generation: OpenAI image generation first, with adapter abstraction for future replacement

Why this is the best v1 default:

- simpler integration surface
- one provider can cover both semantic understanding and generation experiments
- easier prompt/debug loop
- lower orchestration complexity than mixing too many vendors immediately

### Practical MVP Module Split

- `Vision Provider`
  - analyze uploaded image
  - emit structured scene JSON

- `Prompt Builder`
  - assemble output-specific prompt blocks
  - apply prompt versioning

- `Generation Provider`
  - create output image from prompt + reference image

- `Pipeline Orchestrator`
  - coordinate job flow
  - persist metadata
  - expose one clean API for UI

## 4. Suggested Backend Module Layout

Use isolated modules, even if they start small:

```text
server/
  ai/
    vision/
      provider.ts
      mock.ts
      openai.ts
      schema.ts
    prompts/
      builder.ts
      templates.ts
      versions.ts
    generation/
      provider.ts
      mock.ts
      openai.ts
      schema.ts
    pipeline/
      orchestrator.ts
      jobs.ts
```

This structure keeps AI concerns out of page code and reduces conflict with ongoing UI work.

## 5. Mocking Strategy

PlanSketch should support development in three states:

1. all mocked
2. real understanding + mock generation
3. fully real

This is especially useful while:

- prompt quality is still evolving
- cost needs control
- provider reliability is inconsistent
- front-end flows are being built in parallel

## 6. What To Build Now vs Later

### Best To Build Now

1. upload normalization
2. vision JSON schema
3. prompt builder with 3 output templates
4. provider abstraction layer
5. orchestration endpoint
6. mock fixtures and debug metadata

These are the highest-leverage building blocks.

### Build In Phase 2

1. style preset library expansion
2. multi-image input
3. region editing / inpainting
4. user-visible prompt editor
5. reusable template memory
6. output comparison / variant generation

### High Risk, Delay Further

1. native DWG/DXF ingestion
2. GIS engine integration
3. exact geometry-preserving generation
4. compliance reasoning
5. CAD export round-trip

These can consume large engineering effort while still failing user expectations if attempted too early.

## 7. Main Technical Risks

### Risk 1: Visual Output Quality Is Inconsistent

Mitigation:

- constrain prompt templates tightly
- limit supported output categories
- store prompt/version metadata
- review outputs against fixed examples

### Risk 2: Users Expect CAD-Precision Fidelity

Mitigation:

- position product as expression accelerator
- avoid promises about exact geometry preservation
- label outputs as concept/presentation graphics

### Risk 3: Provider Lock-In Too Early

Mitigation:

- define provider interfaces now
- isolate vendor-specific payloads in adapters

### Risk 4: Pipeline Becomes Opaque

Mitigation:

- save intermediate JSON
- keep debug endpoints
- expose prompt/version metadata in job detail

## 8. Recommended Success Criteria For MVP

The MVP is successful if users can:

1. upload one planning-related image
2. choose one of three output types
3. get a visually useful result in a predictable time
4. understand why a result looks the way it does from stored metadata
5. iterate with a changed description and see controllable differences

## 9. Best Next Step After This Document

The next highest-value implementation task is:

`Build the backend AI module contracts and mocks first, before deeper provider-specific optimization.`

That gives the front-end team a stable integration target without forcing live-model dependence on day one.
