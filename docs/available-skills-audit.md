# PlanSketch Available Skills Audit

## 1. Audit Scope

This document audits the AI-related skills and implementation capabilities currently available to the PlanSketch project, based on:

- the active Codex environment capabilities
- the skills explicitly available in this session
- the project goal: AI-assisted planning / architecture expression image generation
- the constraint that UI/page work is handled by another agent

The goal is not to claim full production readiness for every ability, but to identify what is realistically usable in the first version of the product.

## 2. Confirmed Skills Available In This Session

The Codex session exposes these named skills:

1. `openai-docs`
   Use case:
   - official OpenAI product/API guidance
   - choosing models
   - up-to-date integration patterns

2. `skill-creator`
   Use case:
   - creating reusable Codex skills/workflows later if PlanSketch wants a dedicated internal skill

3. `skill-installer`
   Use case:
   - installing additional Codex skills later from curated sources or repos

These three are the only explicitly registered Codex skills in the current session.

## 3. Practical Capability Audit

Even though the named skill list is small, the current agent still has broader engineering capability that is relevant to PlanSketch.

### 3.1 Image Understanding

Status: available, suitable for MVP

What is realistically usable:

- understand uploaded screenshots, renderings, diagrams, maps, sketches, hand-drawn massing, and CAD screenshots
- extract scene type, composition, visible labels, linework density, dominant regions, orientation hints, circulation hints, and visual style cues
- produce structured semantic summaries for downstream prompt building
- detect whether the source looks more like:
  - a site plan
  - a zoning / functional partition base
  - a circulation sketch
  - a perspective / bird's-eye reference
  - a noisy screenshot that needs user clarification

MVP recommendation:

- use multimodal vision input as a semantic parser, not as a GIS/CAD measurement engine
- output normalized JSON, not long prose

### 3.2 Prompt Generation / Optimization

Status: strongly available, core MVP capability

What is realistically usable:

- convert user intent + image understanding output into structured generation prompts
- maintain output-type-specific prompt templates
- add negative prompts / forbidden artifacts
- build style-control blocks for planning presentation visuals
- vary prompt detail by target mode:
  - functional zoning map
  - circulation analysis diagram
  - bird's-eye concept expression

This is one of the highest-value areas to implement immediately.

### 3.3 Image Generation Strategy Design

Status: available at architecture/prompt level; generation quality depends on chosen external API

What is realistically usable:

- define generation call contracts
- design image-to-image and reference-image workflows
- define fallback paths and mock layers
- define output post-processing stages

Important limitation:

- this environment can design and wire the pipeline, but final visual quality depends heavily on the external image model used

### 3.4 CAD / DWG / DXF Understanding

Status: partial / limited for MVP

What is realistically usable now:

- reason about CAD screenshots as images
- infer common planning/architectural drawing patterns from raster captures
- define a future ingestion architecture for DXF/DWG

What is not suitable for phase 1:

- robust DWG parsing
- geometric entity extraction from native CAD files
- standards-level CAD semantics
- CAD export round-trip

Conclusion:

- for MVP, only support CAD screenshots or exported plan images
- do not promise native DWG/DXF intelligence in the first version

### 3.5 Architecture Design

Status: strongly available

What is realistically usable:

- modular AI pipeline design
- server-side orchestration design
- mock-vs-real provider abstraction
- storage, task state, observability, retry, and versioning strategy
- progressive capability roadmap

This is a strong fit for the current task.

### 3.6 API Pipeline Design

Status: strongly available

What is realistically usable:

- define input contracts
- define internal pipeline stages
- define typed JSON handoff formats
- support sync + async job patterns
- provider adapters
- versioned prompt builders
- evaluation and fallback hooks

This should be implemented before deeper front-end behavior is finalized.

### 3.7 Planning / Architecture Expression Knowledge

Status: available at product/prompt/representation level, but not a substitute for licensed professional review

What is realistically usable:

- understand common urban design / planning presentation outputs
- structure prompts around functional zoning, circulation, open space, interface, massing, and bird's-eye expression
- enforce report-grade expression conventions:
  - clean hierarchy
  - clear color zoning
  - legible arrows
  - restrained annotation style
  - presentation-board composition

What is not safe to overclaim:

- formal planning compliance judgment
- regulatory interpretation
- accurate quantitative planning analysis

## 4. Capability Fit For PlanSketch

Best-fit capabilities for immediate product value:

1. multimodal image understanding
2. structured prompt builder
3. controlled image generation routing
4. planning-expression template library
5. mock/real API switching

Medium-fit, phase-2 capabilities:

1. multi-image fusion
2. fine-grained style presets
3. partial region editing / inpainting
4. project memory and reusable prompt recipes
5. automatic legend / label overlay assistance

Low-fit for phase 1, high complexity:

1. native CAD parsing
2. GIS computation
3. precise geometry extraction
4. planning rule validation
5. CAD export

## 5. Recommended MVP Positioning

For version 1, PlanSketch should position itself as:

`AI expression accelerator for planning and architecture reference images`

It should not yet position itself as:

- a GIS analysis platform
- a CAD automation platform
- a regulation-compliance engine
- a precise quantitative design tool

## 6. Immediate Recommendations

1. Treat uploaded content as `visual reference input`, not as exact geometric source-of-truth.
2. Invest early in prompt templates and output-type-specific JSON schemas.
3. Use a provider abstraction so mock, OpenAI vision, and image-generation backends can be swapped cleanly.
4. Delay all native CAD/DWG/DXF work until there is stable user demand and a dedicated parsing strategy.
5. Build evaluation around presentation usefulness first, not technical drawing accuracy.
