# PlanSketch Prompt Builder v1

## 1. Purpose

This document defines how PlanSketch v1 should build stable prompts from:

- image understanding output
- user supplemental description
- selected output type

It is aligned with:

- [api-pipeline.md](F:\PlanSketch\docs\api-pipeline.md)
- [prompt-strategy.md](F:\PlanSketch\docs\prompt-strategy.md)
- [mvp-tech-plan.md](F:\PlanSketch\docs\mvp-tech-plan.md)
- [provider-architecture.md](F:\PlanSketch\docs\provider-architecture.md)
- [README.md](F:\PlanSketch\README.md)

It also aligns with the current O2 direction that the image understanding stage should expose these key fields:

- `sceneSummary`
- `keyElements`
- `spatialFocus`

## 2. Core Recommendation

The best Prompt Builder for MVP is:

`template-first, with optional LLM assistance later`

That means:

- v1 should use deterministic prompt templates
- image understanding output should fill structured slots
- user description should be normalized and merged into controlled sections
- LLM-based prompt rewriting should be optional, not the default source of truth

Why:

- better controllability
- easier debugging
- clearer versioning
- lower cost
- more stable output across the three fixed output types

## 3. Prompt Builder Input Structure

## 3.1 Minimal Input Contract

Suggested v1 input shape:

```json
{
  "outputType": "functional_zoning",
  "userDescription": "Highlight public waterfront and make the main road hierarchy clearer.",
  "stylePreset": "board-clean",
  "promptVersion": "v1",
  "imageInsight": {
    "sceneSummary": "Top-down site plan with road grid, several building clusters, a water edge, and open public space.",
    "keyElements": [
      "road network",
      "building footprints",
      "waterfront",
      "open green space"
    ],
    "spatialFocus": [
      "central development zone",
      "main east-west road",
      "water-edge public interface"
    ]
  }
}
```

## 3.2 Field Meaning

- `outputType`
  - target output mode
  - required

- `userDescription`
  - user’s supplement about emphasis, style, priorities, and expected result
  - optional but strongly recommended

- `stylePreset`
  - style package selector
  - optional, can default

- `promptVersion`
  - prompt assembly version
  - required for traceability

- `imageInsight.sceneSummary`
  - short semantic summary of the input image
  - required

- `imageInsight.keyElements`
  - major spatial objects or systems detected in the image
  - required

- `imageInsight.spatialFocus`
  - areas or relationships the image understanding stage thinks matter most
  - optional but highly valuable

## 4. How The Three Fields Map Into Prompt Construction

## 4.1 `sceneSummary`

Role:

- defines the base scene understanding
- gives the model a concise reading of what the input image is about
- prevents the generation stage from drifting too far away from the reference

How it should be used:

- place it in the `Spatial Basis` block
- use it to anchor site type, view type, and dominant composition
- keep it concise and factual

Prompt effect:

- improves scene consistency
- reduces hallucinated site types
- helps the generation model preserve major spatial logic

Example usage:

`Base the output on a top-down site plan with road grid, clustered building footprints, waterfront edge, and open public space.`

## 4.2 `keyElements`

Role:

- lists the major things that must appear or remain legible in the output
- drives the content emphasis block

How it should be used:

- expand into explicit “must preserve / must clarify” phrases
- prioritize top 3 to 6 elements
- convert raw nouns into planning-expression instructions

Prompt effect:

- stabilizes important objects
- gives output-type-specific emphasis
- reduces generic or decorative outputs

Example mapping:

- `road network` -> `clarify the primary and secondary road hierarchy`
- `waterfront` -> `highlight the public waterfront interface`
- `building footprints` -> `preserve the main built mass distribution`

## 4.3 `spatialFocus`

Role:

- identifies what parts of the scene deserve special attention
- controls emphasis and composition priority

How it should be used:

- convert each focus item into an `Emphasis` block
- drive local importance, not full-scene rewriting
- if empty, degrade to using global `sceneSummary` + `keyElements`

Prompt effect:

- improves result relevance
- helps different output types focus on the right spatial relationships
- avoids evenly-distributed but weak outputs

Example usage:

`Emphasize the central development zone, the main east-west road, and the waterfront public interface.`

## 5. Prompt Builder Assembly Model

The Prompt Builder should build prompts in six sections:

1. task block
2. spatial basis block
3. key-elements block
4. emphasis block
5. visual/style block
6. constraints block

Suggested assembled JSON:

```json
{
  "promptVersion": "v1",
  "templateId": "functional-zoning.v1",
  "outputType": "functional_zoning",
  "stylePreset": "board-clean",
  "taskBlock": "Create a report-grade functional zoning expression image.",
  "spatialBasisBlock": "Base the output on a top-down site plan with road grid, clustered building footprints, waterfront edge, and open public space.",
  "keyElementsBlock": [
    "Preserve the main road network and building distribution.",
    "Clarify the waterfront and open green space structure."
  ],
  "emphasisBlock": [
    "Emphasize the central development zone.",
    "Emphasize the main east-west road hierarchy.",
    "Emphasize the water-edge public interface."
  ],
  "visualBlock": [
    "Use a clean planning board style.",
    "Maintain clear hierarchy and readable color zoning."
  ],
  "negativeBlock": [
    "Avoid photorealism.",
    "Avoid messy text artifacts."
  ],
  "finalPrompt": "..."
}
```

## 6. Output-Type-Specific Prompt Logic

## 6.1 Functional Zoning Map

Goal:

- clarify land-use partitions
- preserve overall site logic
- produce a clean, board-ready planar diagram

How to use `sceneSummary`:

- describe the site structure
- preserve broad district organization
- anchor planar/site-plan reading

How to use `keyElements`:

- convert elements into zoning-relevant categories
- highlight land-use-relevant systems like roads, open space, water edge, public zones

How to use `spatialFocus`:

- identify which districts or interfaces should be most visible
- prioritize specific nodes, corridors, waterfronts, centers, or development zones

Recommended task phrasing:

- create a report-grade functional zoning map
- preserve the overall site boundary logic
- clarify major land-use partitions and district relationships

Typical key-element mapping:

- road network -> zoning boundaries and district access logic
- open space -> public/open-space zone emphasis
- water edge -> waterfront activation or ecological/open-space edge emphasis
- building footprints -> built-up zones / development parcels

Typical prompt structure:

```text
Create a report-grade functional zoning map for a planning presentation.
Base the image on {sceneSummary}.
Preserve and clarify these major site elements: {keyElementsMapped}.
Emphasize these spatial areas and interfaces: {spatialFocusMapped}.
Integrate the user's priorities: {userIntent}.
Use clear zoning colors, clean boundaries, restrained annotation style, and strong planning-board legibility.
Avoid photorealistic textures, broken text, excessive decorative rendering, and unnecessary perspective distortion.
```

## 6.2 Circulation Analysis Diagram

Goal:

- emphasize movement logic
- show route hierarchy
- make analytical overlays legible

How to use `sceneSummary`:

- establish whether the image is top-down, corridor-based, campus-like, waterfront-oriented, or node-based

How to use `keyElements`:

- extract roads, entries, edges, open spaces, axes, and public connectors
- convert them into circulation semantics

How to use `spatialFocus`:

- determine which paths, entrances, central nodes, or connections deserve strongest treatment

Recommended task phrasing:

- create a circulation analysis diagram
- clarify movement hierarchy and major connections
- show spatial relationships through arrows, overlays, and contrast

Typical key-element mapping:

- road network -> primary and secondary vehicular flows
- open space -> pedestrian open-space movement spine
- building clusters -> destination nodes / entrances
- waterfront -> promenade or edge circulation

Typical prompt structure:

```text
Create a report-grade circulation analysis diagram for a planning presentation.
Base the image on {sceneSummary}.
Use these main site systems as the basis of movement logic: {keyElementsMapped}.
Focus analytical emphasis on: {spatialFocusMapped}.
Integrate the user's priorities: {userIntent}.
Show clear route hierarchy, legible arrows, node-to-node relationships, and a strong analytical overlay style.
Avoid decorative rendering, cluttered symbols, random arrows, broken text, and visual noise.
```

## 6.3 Bird's-Eye Concept Expression

Goal:

- produce a compelling but controlled presentation image
- keep major site logic while allowing more expressive rendering

How to use `sceneSummary`:

- define the site story and composition basis
- infer what kind of aerial concept rendering is appropriate

How to use `keyElements`:

- preserve major massing, open-space, road, and waterfront relationships
- prevent the image model from inventing unrelated site content

How to use `spatialFocus`:

- identify the key center, interface, landmark area, main corridor, or public edge that should dominate the composition

Recommended task phrasing:

- create a bird's-eye concept expression image
- preserve the main planning structure
- improve presentation quality without losing site logic

Typical key-element mapping:

- building footprints -> conceptual massing distribution
- road network -> primary access structure
- open space -> landscape/public realm system
- waterfront -> visual edge and major frontage

Typical prompt structure:

```text
Create a report-grade bird's-eye concept expression image for a planning presentation.
Base the scene on {sceneSummary}.
Preserve these major spatial systems and planning relationships: {keyElementsMapped}.
Let these areas guide the visual emphasis and composition: {spatialFocusMapped}.
Integrate the user's priorities: {userIntent}.
Use a clean aerial-oblique presentation style, concept-level massing clarity, readable landscape structure, and a polished competition-board visual language.
Avoid fantasy architecture, overly photorealistic people or vehicles, broken text, and irrelevant detail noise.
```

## 7. How User Description Should Be Merged

User description should not be pasted raw into the final prompt without processing.

Recommended normalization categories:

- emphasis
  - what to highlight

- style
  - cleaner / softer / stronger contrast / more atmospheric

- color
  - warm / restrained / strong zoning contrast

- caution
  - avoid too dense / avoid over-rendering / keep simple

Recommended merge rule:

- user description can refine emphasis and style
- user description should not override core scene logic if it conflicts with image understanding
- when there is conflict, the Prompt Builder should prefer:
  - image understanding for factual scene structure
  - user description for stylistic and emphasis adjustments

Safe merge example:

- image understanding says `waterfront site`
- user says `highlight central public green and main road`
- final prompt uses both

Unsafe merge example:

- image understanding says `top-down site plan`
- user says `make it a mountain resort with towers everywhere`
- Prompt Builder should not fully obey this without an explicit mode allowing reinterpretation

## 8. What Should Be Templated vs What Can Be Dynamic

## 8.1 Best For Templates In MVP

- output-type task block
- style preset instructions
- negative constraints
- base composition rules
- key-element mapping rules
- spatial-focus phrasing
- fallback wording for low-confidence cases

These are the most stable and highest-value pieces to template.

## 8.2 Best For Later LLM Assistance

- rewriting user description into cleaner planning language
- summarizing long user intent
- expanding sparse `sceneSummary` into better phrasing
- proposing alternative prompt variants
- generating richer bird's-eye descriptive language

Important rule:

- LLM output should assist a template system, not replace the prompt contract in MVP

## 9. Negative Constraints and Style Presets

## 9.1 Negative Constraints

Negative constraints should always be inserted as a dedicated block.

Shared baseline negatives:

- avoid broken text artifacts
- avoid meaningless labels
- avoid clutter
- avoid random decorative symbols

Output-type-specific negatives:

- functional zoning:
  - avoid photorealism
  - avoid excessive texture
  - avoid perspective distortion

- circulation analysis:
  - avoid decorative rendering overpowering analysis
  - avoid random arrows
  - avoid weak hierarchy

- bird's-eye expression:
  - avoid fantasy architecture
  - avoid over-realistic people/vehicles
  - avoid noisy facade detail

## 9.2 Style Presets

Recommended MVP presets:

- `board-clean`
- `analysis-strong`
- `competition-soft`

How to apply:

- style preset injects only the `visual/style block`
- it should not override task block or negative block
- it should remain independent from scene structure

## 10. Prompt Versioning Minimum Scheme

Minimum required metadata:

```json
{
  "promptVersion": "v1",
  "templateId": "functional-zoning.v1",
  "outputType": "functional_zoning",
  "stylePreset": "board-clean",
  "builderMode": "template",
  "insightSchemaVersion": "v1"
}
```

Minimum logging recommendation:

- prompt version
- template ID
- builder mode
- output type
- style preset
- image understanding snapshot
- final prompt text

This is enough for MVP debugging and evaluation.

## 11. Required Fields and Degradation Rules

## 11.1 Required Fields

Required:

- `outputType`
- `promptVersion`
- `imageInsight.sceneSummary`
- `imageInsight.keyElements`

Strongly recommended:

- `imageInsight.spatialFocus`
- `stylePreset`
- `userDescription`

## 11.2 Degradation Rules

If `spatialFocus` is empty:

- fall back to global emphasis from `sceneSummary`
- use top 2 to 3 `keyElements` as emphasis priorities

If `userDescription` is empty:

- build prompt from insight + output type + default style preset

If `stylePreset` is empty:

- default by output type:
  - functional zoning -> `board-clean`
  - circulation analysis -> `analysis-strong`
  - bird's-eye expression -> `competition-soft`

If `keyElements` is too short:

- use `sceneSummary` to infer a conservative list
- do not invent niche planning semantics

If `sceneSummary` is weak or uncertain:

- use guarded phrasing such as:
  - based on the apparent site structure
  - clarify the likely organization of the site

If both `sceneSummary` and `keyElements` are weak:

- degrade to low-confidence mode
- prefer asking for clarification or returning a conservative template-driven result

## 12. Best MVP Builder Choice

Best choice:

`pure template core, optionally with light LLM assistance outside the core path`

Why not full LLM:

- too hard to debug
- unstable wording
- harder to compare outputs
- weaker versioning discipline

Why not template+LLM as the default immediately:

- still adds complexity before the base mapping rules are proven
- current product has only three output types, which are perfect for strong templates

Why template-first is best:

- faster implementation
- better consistency
- lower cost
- easier to evaluate
- easiest to keep aligned with image understanding fields

## 13. Future Abstraction Layer Recommendation

If later integrating GPT-5.4, NanoBanana, Pro, or other advanced generation/rewriting abilities, the most important abstraction boundary to preserve is:

`Prompt Builder should output structured prompt blocks before producing final prompt text.`

That means keeping these layers separate:

1. insight normalization layer
2. prompt planning layer
3. final prompt rendering layer

This makes it easy later to:

- keep template planning but use LLM rendering
- use GPT-5.4 for prompt expansion only
- use another model for bird's-eye narrative enrichment
- compare multiple rendering providers against one stable prompt plan

## 14. Final Recommendation

For PlanSketch v1, the Prompt Builder should be a deterministic assembly system that:

- treats `sceneSummary` as spatial grounding
- treats `keyElements` as required content anchors
- treats `spatialFocus` as emphasis guidance
- merges user description as controlled refinement
- applies style presets and negative constraints as separate template blocks
- versions every prompt build

If one rule must be protected above all others:

`Prompt Builder must preserve scene logic first, and only stylize or emphasize on top of that logic.`
