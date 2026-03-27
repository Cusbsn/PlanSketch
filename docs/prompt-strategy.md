# PlanSketch Prompt Strategy v1

## 1. Goal

PlanSketch does not just need a prompt. It needs a repeatable prompt system that turns unstable visual/user input into stable planning-expression outputs.

The v1 prompt strategy should optimize for:

- consistency
- controllability
- output-type specialization
- low hallucination risk
- easy iteration through versioning

## 2. Prompt System Structure

Each generation prompt should be assembled from structured blocks:

1. output intent
2. spatial interpretation
3. visual language
4. composition guidance
5. constraints / negative instructions
6. optional emphasis block

This is better than free-form prompt concatenation because it allows:

- version control
- output-specific tuning
- analytics by prompt block
- safer provider switching

## 3. Core Prompt Inputs

The prompt builder should consume:

- `outputType`
- `userDescription`
- `visionSummary`
- `stylePreset`
- `clarityLevel`
- `promptVersion`

Optional future inputs:

- region mask
- project style memory
- firm template
- preferred palette

## 4. Output-Type-Specific Prompt Direction

### 4.1 Functional Zoning Map

Primary goals:

- clearly separated land-use areas
- readable color hierarchy
- planning-board legibility
- controlled annotation aesthetic

Prompt emphasis:

- planar composition
- clean boundaries
- district/color partition logic
- restrained presentation graphics

Negative emphasis:

- photorealistic textures
- random building detail
- cluttered text
- unnecessary perspective distortion

### 4.2 Circulation Analysis Diagram

Primary goals:

- clear primary/secondary routes
- legible movement arrows
- strong hierarchy
- overlay-style analytical graphics

Prompt emphasis:

- circulation arrows
- movement hierarchy
- entrances/exits
- pedestrian/vehicular distinction when relevant

Negative emphasis:

- decorative rendering overpowering analysis
- excessive color noise
- diagram symbols without spatial logic

### 4.3 Bird's-Eye Concept Expression

Primary goals:

- compelling but controlled presentation image
- conceptual site massing and open space reading
- presentation-board quality

Prompt emphasis:

- aerial oblique perspective
- concept-level massing
- clean landscape/road structure
- competition-board style clarity

Negative emphasis:

- over-photoreal faces/people/vehicles
- fantasy architecture
- over-detailed facade realism

## 5. Suggested Prompt Template

Use a logical structure like this:

```text
Task:
Create a {outputType} for a planning / architectural presentation.

Spatial Basis:
Based on the reference image, preserve the overall site structure, major boundaries, and dominant spatial organization.

Key Elements:
{detectedElements}

User Intent:
{userDescription}

Visual Language:
{stylePresetInstructions}

Composition Guidance:
{compositionInstructions}

Constraints:
{constraintInstructions}

Avoid:
{negativeInstructions}
```

## 6. Prompt Builder Rules

### 6.1 Rule: Prefer Structured Interpretation Over Literal OCR

Do not try to preserve every tiny label or unreadable annotation from the uploaded image.

Instead:

- preserve major logic
- reinterpret small noisy details into cleaner presentation graphics

### 6.2 Rule: Constrain Ambiguity Early

If the vision model has low confidence, the prompt builder should switch to safer wording, for example:

- based on the apparent site structure
- clarify the likely zoning relationship

Avoid overcommitting to uncertain semantics.

### 6.3 Rule: Separate Style From Content

Keep content decisions and style decisions in separate prompt blocks.

This allows:

- same site logic, multiple visual styles
- same style, different output types

### 6.4 Rule: Use Negative Instructions Aggressively

Planning-expression outputs are easily damaged by:

- broken text artifacts
- unnecessary photorealism
- visual clutter
- diagram symbols without hierarchy

Negative prompts should be template-level, not improvised each time.

## 7. Suggested Style Presets

MVP can start with three presets:

1. `board-clean`
   - white/neutral background
   - restrained palette
   - crisp diagram hierarchy

2. `competition-soft`
   - softer atmospheric rendering
   - presentation-friendly colors
   - more visual appeal for bird's-eye outputs

3. `analysis-strong`
   - bold arrows
   - stronger contrast
   - higher legibility for circulation/logic diagrams

## 8. Suggested Prompt JSON Model

```json
{
  "promptVersion": "v1",
  "outputType": "circulation_analysis",
  "stylePreset": "analysis-strong",
  "taskBlock": "...",
  "spatialBlock": ["..."],
  "visualBlock": ["..."],
  "compositionBlock": ["..."],
  "negativeBlock": ["..."],
  "finalPrompt": "..."
}
```

This lets the system inspect how the final prompt was assembled.

## 9. Evaluation Heuristics

Judge prompts by output usefulness, not by prompt elegance.

Useful internal review dimensions:

- zoning clarity
- circulation readability
- composition cleanliness
- style consistency
- artifact rate
- alignment with uploaded reference

## 10. High-Risk Prompt Areas

Avoid these in phase 1:

- asking for exact regulatory land-use categories automatically
- requesting faithful preservation of illegible source text
- promising precise architectural geometry
- mixing too many styles in one generation
- asking the model to invent detailed planning analysis

## 11. Recommended Phase-2 Prompt Enhancements

- user-editable prompt block preview
- firm-specific template packs
- image-region-conditioned prompting
- prompt A/B testing
- reusable project preset memory
