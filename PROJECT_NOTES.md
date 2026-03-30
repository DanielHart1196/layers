# Layers Project Notes

## Repo
- Path: `/data/data/com.termux/files/home/layers`
- App is a static browser-based atlas prototype with projection switching, mobile-first gesture work, and layered raster/vector rendering.

## Working Agreement
- Keep `PROJECT_NOTES.md` active, not archival.
- If a new architectural rule, repeated bug pattern, or workflow lesson becomes clear during implementation, capture it here.
- If a request appears to conflict with the current architecture direction, call out the conflict explicitly and decide whether:
  - the architecture should change
  - the request should be implemented narrowly without changing direction
- If a prompt is too vague for structural work, tighten the task first by writing down assumptions or asking a short clarifying question.
- Prefer small, self-contained changes when refactoring:
  - one coherent goal per change
  - behavior-preserving extraction separated from behavior-changing work
  - risky subsystems validated immediately after change
- When browser caching could affect diagnosis, prove runtime consistency before trusting debug output:
  - add a visible runtime/version token to temporary debug when needed
  - prefer cache-busted local scripts during active debugging
  - do not keep chasing render/math bugs until you know the browser is running one coherent code version

## Collaboration Expectations
- If the user forgets a previously agreed architecture goal, surface it and ask whether to stay aligned or intentionally diverge.
- If the user prompt is likely to cause avoidable rework, say so plainly and propose a tighter framing.
- When suggesting a solution, also suggest whether the rule belongs in `PROJECT_NOTES.md` or `AGENTS.md`.
- Treat the notes, registry, and existing working UI patterns as shared sources of truth, not optional context.

## Shared UI Architecture
- Prefer shared layout primitives for related controls.
- When two UI elements are meant to stay visually or behaviorally linked, derive them from the same variable, token, or state instead of duplicating values.
- Prefer a single source of truth for widths, anchors, spacing, control sizes, and other repeated layout constants.
- Favor derived layout over duplicated constants and structural relationships over matching magic numbers.
- Use shared design tokens, composable UI primitives, and constraint-driven UI when building linked controls so consistency is encoded in the structure instead of remembered manually.
- Allow intentional structural coupling when it preserves consistency between related controls, but keep the coupling explicit and inspectable.

## Git / Remote Notes
- Current primary branch: `main`
- HTTPS push is working for this repo.
- GitHub currently reports a redirect from the lowercase remote URL to:
  - `https://github.com/DanielHart1196/layers.git`
- If `git push` appears to hang in this environment, verify with a promptless retry before assuming auth is broken.

## Current Projection Model
- `orthographic`, `azimuthal-equidistant`, and `mercator` behave like direct interactive projections.
- `natural-earth-ii`, `goode-homolosine`, and `waterman` are viewport-based flat projections.
- `dymaxion` remains special-cased and should be treated as lower-confidence for interaction work.

## Projection Architecture Direction
- Long-term direction: one viewport/display architecture with many projection definitions, not separate globe-vs-flat app architectures.
- Prefer one shared display system for framing, zoom, clipping, hit behavior, and general viewport handling across all projections.
- Projection-specific code should primarily provide transformation math plus explicit metadata and constraints, rather than bespoke rendering or interaction stacks.
- Favor a projection contract over projection-specific pipelines. A projection definition should eventually be able to describe:
  - forward transform
  - inverse transform when available
  - frame or fit geometry
  - clipping shape / visible domain
  - interaction capabilities
  - zoom / pan / rotation constraints
- The goal is not fake uniformity. Different projections may still need different math, bounds, seams, or capability flags, but those differences should live behind one explicit contract.
- Prefer one shared interaction pipeline that routes drag, wheel, pinch, buttons, and other inputs through projection capabilities instead of branching into unrelated architectures.
- Prefer one shared render/display pipeline that asks the active projection how to transform and constrain coordinates, instead of letting each projection own its own framing and viewport behavior.
- When future projection work resumes, bias toward adding or refining projection definitions rather than creating new top-level systems.
- This direction should make future projection creation possible without rewriting the app architecture each time a new projection is introduced.
- Medium-term interaction direction: separate projection-internal camera movement from whole-projection frame movement.
- Projections should eventually support both:
  - moving / zooming within the projection
  - moving / scaling the projection frame itself
- Interaction modes or locks should make it explicit whether the user is manipulating projection content or the projection object as a whole.

## Zoom And Pan
- Global zoom state lives in `app.js`.
- Projection zoom bounds are defined in `getProjectionZoomBounds()`.
- `orthographic` and `azimuthal-equidistant` use globe-style latitude/longitude drag via `rotationOffset`.
- `mercator` also uses `rotationOffset`, but its north/south pan feel is damped near the poles in `getMercatorPhiSensitivityMultiplier()`.
- `natural-earth-ii`, `goode-homolosine`, and `waterman` use flat viewport pan offsets via `flatProjectionPanOffsets`.
- For those flat projections, drag-to-pan only activates once zoomed in (`zoomState.scale > 1.01`).

## Flat Projection Camera Rule
- For `natural-earth-ii`, `goode-homolosine`, and `waterman`, raster and vector layers must share the same post-projection camera transform.
- Do not bake zoom into the D3 projection for those three if the overlay layer is also being transformed in screen space.
- Do not mix projection-space pan for vectors with screen-space pan for raster; that causes visible drift.
- The intended model is:
  - canonical projection geometry
  - shared screen-space zoom/pan camera
  - same transform applied to flat raster and overlays

## Raster Rendering
- `atlas-earth.js` contains:
  - `createGlobeRenderer()` for globe/azi/mercator-style GPU rendering
  - `createFlatMapRenderer()` for flat projections
- Flat projection raster performance is sensitive. Avoid returning to “rebuild everything on every zoom tick”.
- `atlas-layers.js` owns flat raster prewarm behavior and integrates the flat renderer into overlay drawing.

## Empire Layer State Model
- `layerState.empires` is category visibility, not the canonical source of child preference truth.
- Empire sublayer preferences live separately in `empireLayerState`.
- Child selections should persist even if the parent `Empires` layer is turned off.
- Child checkmarks should only render as active when:
  - the parent `Empires` layer is on, and
  - the stored child preference for that layer is on
- Empire sublayers remain expandable/clickable even when the parent is off; clicking a child should be able to turn the parent back on.

## Borders Style Model
- Borders are no longer just a boolean layer toggle; they also carry style state in `borderStyleState`.
- Current border style fields:
  - `color`
  - `width`
  - `opacity`
  - `hue`
  - `saturation`
  - `value`
- `atlas-layers.js` reads `borderStyleState` through `layerStateRef().borderStyle`.
- The visible `Borders` section in the layer panel is now a grouped control with:
  - toggle row
  - stroke width slider
  - color swatch row
  - opacity slider
  - advanced color picker panel behind the `+`

## Border Color UX
- The `Line Color` row shows:
  - label
  - current hex
  - informational active color dot
- Beneath that is a single horizontal swatch row with:
  - `+` toggle first
  - custom saved colors immediately after
  - fixed default palette after that
- The default palette is currently:
  - white
  - black
  - red
  - orange
  - yellow
  - green
  - blue
  - purple
- The `+` rotates into an `x` while the advanced picker is open.
- The advanced picker is inline, not modal:
  - SV rectangle
  - hue slider
  - hex input with fixed `#`
  - `Add` button

## Custom Border Colors
- Custom border colors are stored locally in browser storage only.
- Storage key:
  - `atlas.border.customColors`
- Max saved custom colors:
  - `10`
- `Add` behavior:
  - default color attempted:
    - do not duplicate
    - scroll to default swatch
    - flash the swatch border
  - existing custom color attempted:
    - move to front of custom list
    - flash the swatch border
  - new color attempted:
    - add after `+`
    - flash the new custom swatch border
- Current add-feedback color is green.
- Long-press on a custom saved color should reveal a red remove button above it.
- Removing a custom color should update both runtime state and `localStorage`.

## Border Color UI Debt
- Advanced color picker handles can still clip or crowd at the control edges.
- The current picker works better with a separate hue slider than the earlier single-rectangle model.
- The swatch row and long-press remove affordance are sensitive to overflow clipping because the row is horizontally scrollable.
- If adjusting the custom remove button again:
  - check the scroll container top reserve space
  - check vertical overlap against the swatch footprint
  - do not nest buttons inside buttons

## Vector Asset Direction
- Long-term vector architecture should not depend on raw `world-atlas` topology objects directly in render code.
- Normalized vector assets now have a dedicated scaffold:
  - manifest: `data/vector/manifest.json`
  - build script: `scripts/build_vector_assets.py`
  - design notes: `docs/vector-asset-pipeline.md`
- The intended contract is:
  - build-time normalization for fill/stroke semantics
  - runtime LOD selection from validated assets
  - canonical vector assets reserved for export-quality output

## Mobile UI Behavior
- Hamburger menu is mobile-only and positioned on the right side.
- Refresh button sits above the hamburger on mobile.
- Hourglass button controls mobile month access when zoomed in.
- On mobile:
  - months are visible at the bottom when zoomed all the way out
  - once zoomed in, the month strip hides and the hourglass appears
- Projection switcher pill sits near the bottom center and supports drag/flick projection changes.

## Gesture Rules
- Keep working Chrome mobile behavior stable unless a change is clearly isolated.
- Firefox-specific fixes should be narrow and should not replace the working Chrome path wholesale.
- UI controls like months, layers, refresh menu, and projection pill must be excluded from map zoom/drag capture.
- `Azimuthal Eqd` depends on the full-screen workspace touch surface even though the visible map is circular.

## Mercator Performance Notes
- Mercator cost is heavily affected by horizontal wrap.
- Optimizations that bypass wrapped drawing can silently break repetition.
- Cached single-path rendering should not replace wrap-aware repeated draws unless the cache itself is wrap-aware.
- Mercator wrap should be viewport-aware so only intersecting repeated copies are drawn.

## Azimuthal Performance Notes
- `Azimuthal Eqd` is sensitive to continuous live reprojection cost.
- Current interaction tuning lowers projection precision during active drag/zoom, then returns to higher precision when settled.
- If azimuthal performance regresses, inspect projection precision and interaction-state invalidation before changing data sources.

## Known Fragile Areas
- Projection switcher swipe logic in `enableProjectionSwitcher()`
- Flat projection raster/vector alignment
- Mobile touch-action interactions and browser zoom suppression
- Mercator drag feel near the poles
- Month overlay and floating controls leaking events into map gestures
- Empire parent/child state synchronization in the layers panel

## Do Not Repeat
- Do not casually reintroduce empire polygon LOD switching.
- The previous naive Roman empire simplification introduced topology/fill regressions and wrong-looking colors at low zoom.
- If empire performance work is revisited, prefer projection/render-path optimizations over naive polygon simplification.

## Editing Guidance
- After JS edits, run `node --check` on changed files.
- Prefer narrow fixes when a path is already working on Android Chrome.
- If changing flat projection interaction or rendering, verify:
  - zoom alignment
  - drag alignment
  - projection switch speed
  - mobile control hit areas
- If adding temporary on-screen debug:
  - default to a floating top-left position
  - avoid blocking refresh, projection, layers, or month controls
  - remove it once the diagnosis is complete

## Debugging Lessons
- Browser caching can invalidate otherwise good diagnosis. If runtime behavior and code inspection disagree, verify loaded code first rather than stacking more theory on top.
- For projection/render debugging, separate:
  - geometry bounds
  - scene bounds
  - stage/canvas sizing
  - layer compositing
- When the issue is visually ambiguous, prefer targeted layer-isolation or numeric bounds debug over repeated subjective screenshot interpretation.
- `localhost` and `127.0.0.1` are different origins and can diverge due to separate caches. Do not treat one working origin as proof that the other is running the same code.
- Hand-versioning individual local script tags is fragile and can leave the app running a mixed module set after shared-interface changes.

## Build System Direction
- The long-term fix for cache/version drift is a real frontend build pipeline with hashed assets, not manual query-string management.
- Preferred direction:
  - adopt a minimal build tool such as Vite
  - migrate local JS from global ordered scripts toward module imports
  - emit hashed build assets so the browser cannot mix incompatible versions
- Recommended migration order:
  - audit the current script dependency graph from `index.html`
  - create one real app entry point
  - migrate leaf/helper modules first
  - migrate state/persistence/registry modules
  - migrate UI/controller modules
  - migrate render/core modules
  - remove legacy `window.Atlas...` script-order assumptions last
- Keep the first build milestone narrow:
  - one working app entry
  - hashed output
  - no fancy code splitting unless it clearly helps
- Do not mix build-system migration with unrelated feature work. Treat it as its own refactor track.

## Target App Architecture
- Current app-level complexity is concentrated too heavily in `app.js`.
- The long-term target should be:
  - thin bootstrap in `app.js`
  - state and persistence separated from DOM wiring
  - layer definitions centralized in a registry
  - reusable UI control controllers instead of repeated hand-plumbing
  - render scheduling and invalidation separated from input handling
  - export treated as a first-class pipeline, not an afterthought on the interactive renderer
- Treat the app as five cooperating areas:
  - state
  - layer definitions
  - UI/controllers
  - gestures
  - rendering
- Export should now be treated as a sixth area:
  - export
- Prefer module boundaries that follow single responsibility:
  - state modules should not query the DOM
  - UI modules should not own persistence rules
  - gesture modules should emit view updates, not directly manipulate layer markup
  - render modules should consume resolved state, not browser event details
  - export modules should consume resolved state and export settings, not viewport DOM state
- Keep parent layer visibility, child preferences, open/closed panel state, and transient preview/drag state as separate concerns.
- Avoid encoding business rules in click handlers when the rule belongs in a shared selector or state helper.

## Recommended Module Split
- `app.js`
  - boot only
  - create store/controllers
  - bind modules together
- `state/store.js`
  - canonical runtime state
  - getters, patch/update helpers, subscriptions
- `state/persistence.js`
  - load/save view state
  - load/save style settings
  - storage schema translation
- `layers/registry.js`
  - canonical definitions for layers, sublayers, controls, defaults, and persistence keys
- `layers/selectors.js`
  - derived rules such as parent/child visibility, effective styles, and UI display state
- `ui/layer-panel.js`
  - layer panel wiring
  - expand/collapse behavior
  - activation/deactivation events
- `ui/color-controls.js`
  - shared color picker setup and syncing
  - custom swatch persistence hooks
- `ui/projection-controls.js`
  - picker and switcher wiring
- `ui/month-controls.js`
  - month strip and hourglass behavior
- `gestures/map-gestures.js`
  - drag, pinch, double-tap, browser zoom suppression
- `gestures/projection-switcher.js`
  - projection swipe/flick logic
- `render/renderer.js`
  - render scheduling
  - pass orchestration
  - invalidation
- `render/layer-renderers.js`
  - layer-to-renderer mapping
- `export/export-controller.js`
  - export entry point
  - export settings validation
  - export job orchestration
- `export/export-scene.js`
  - scene resolution for print size, DPI, and aspect ratio
- `export/export-renderers.js`
  - export-target render pass mapping
- `export/pdf-renderer.js` and/or `export/svg-renderer.js`
  - vector-first printable output
- `export/export-manifest.js`
  - layer export capabilities
  - vector vs raster fallback rules

## Layer Registry Direction
- New layer and sublayer work should move toward a registry-driven model instead of manual wiring scattered across HTML, JS state objects, persistence code, and sync functions.
- The core domain model should now move toward:
  - every renderable/configurable thing is a `Layer`
  - layers can contain child layers recursively
  - parent layers are still layers, not a different ontology
  - UI sections are views over the layer tree, not the definition of it
- Each layer definition should eventually declare:
  - `id`
  - `nodeType`
  - `layerRole`
  - `ownerType`
  - `parentId` when applicable
  - child layer ids
  - default enabled state
  - default style state
  - persistence keys
  - control definitions
  - render binding / render source
  - UI section metadata
- The model should distinguish between:
  - layer definition
  - layer instance
- Reason:
  - the same layer definition may be used in multiple places with different local settings
  - example: top-level `Empires` can have one default configuration, while `MyFavLayers > Empires` can use the same definition with different instance-level state
- A layer instance should eventually carry:
  - `instanceId`
  - `definitionId`
  - parent instance id when nested
  - local enabled/open state
  - local overrides for settings and child composition
- This should support:
  - built-in system layers
  - user-created layers
  - reusable multi-layers
  - nested layer trees
- Current agreed interpretation:
  - `Earth` is a layer with child layers
  - `Empires` is a layer with child layers
  - `Graticule`, `Tissot`, `Roman`, `Mongol`, `British`, and `Borders` are also layers
- The registry should become the source of truth for:
  - default state creation
  - persistence hydration
  - consistent UI formatting and behavior
  - canonical layer shell rendering
  - future layer additions
- Goal:
  - adding a new layer should mostly be definition work, not repeated edits across many switch-style blocks
  - embedding an existing layer inside another layer should be instance work, not a special-case implementation

## Layer Definition Model
- Treat `Earth`, `Empires`, `Graticule`, `Tissot`, `Roman`, `Borders`, and future user-created items as the same fundamental type:
  - `Layer`
- Some layers have children and some do not.
- Some layers are utility/reference layers.
- Some layers are basemap-oriented layers.
- Those differences should be expressed as metadata on the same core type, not as unrelated UI species.
- This should let the app support a tree-capable schema even if the current UI only exposes one nested level at first.
- In the settings UI, everything should be represented as rows:
  - `layer` is a row type
  - sliders, colors, dropdowns, and other controls are row types
  - rows may contain child rows recursively
- The panel should prefer one canonical row system over separate architectural concepts like “controls section” or “child stack” when rows can represent those structures directly.
- A layer remains a real domain entity, but in the panel it is rendered as `row.type = "layer"`.
- The settings UI should eventually use one canonical row system:
  - same structure for top-level rows
  - same structure for nested rows
  - controls and children populated from row definitions
  - no bespoke Roman-vs-Graticule markup behavior

## Panel Row And Spacing Model
- Layer panel layout should be driven by explicit rows, not hidden spacing behavior.
- When spacing needs to be inspectable and guaranteed consistent across layers, prefer explicit spacer rows over implicit `gap` or padding-only layouts.
- The intended body structure is:
  - row
  - spacer
  - row
  - spacer
  - bottom spacer
- Parent containers should own outer spacing for their row list.
- Nested layers should own only their internal spacing, not extra external spacing that competes with the parent row system.
- If a nested expanded layer causes parent spacing to behave differently, treat that as a structural bug in the row model, not a one-off CSS tuning issue.

## Refactor Guardrails
- Do not treat file splitting alone as architectural progress.
- Strengthen the layer model and shared behavior contracts before introducing more abstractions.
- For rendering and gestures, prefer explicit contracts over clever indirection.
- Do not reintroduce pass-based redraw narrowing in behavior-sensitive paths until the invalidation contract is specific enough to prove correctness.
- For layer panel work, prefer row-based composition over layer-family-specific wrappers, per-layer spacing rules, or hidden layout contracts.
- When a refactor touches:
  - render timing
  - gesture semantics
  - projection math
  - layer visibility/state contracts
  validate those paths immediately before continuing broader cleanup.

## Validation Discipline
- For architecture-heavy changes, validate the exact behavior-sensitive paths touched instead of relying on generic smoke testing.
- Useful targeted checks include:
  - Earth raster and overlay zoom together
  - flat raster and vector alignment during pan/zoom
  - projection switcher responsiveness
  - expandable settings rows opening to full child content
  - parent/child layer state persistence
- For row/spacing changes, also validate:
  - spacer visibility and consistency across multiple expanded layers
  - nested layer expansion not collapsing parent bottom spacing
  - the same spacing contract on `Earth`, `Empires`, `Borders`, `Graticule`, and `Roman`
- Prefer a short explicit regression checklist over vague “test the UI” wording.

## Export Architecture Direction
- Printing and downloadable PDF output are major product requirements, not optional extras.
- Do not treat export as “the interactive renderer at a larger size”.
- The architecture should distinguish clearly between:
  - interactive rendering
  - export rendering
- Interactive rendering may use:
  - screen pixel ratio assumptions
  - runtime LODs
  - GPU paths
  - interaction-time shortcuts
  - caches tuned for responsiveness
- Export rendering should prefer:
  - deterministic output
  - explicit physical size or pixel dimensions
  - explicit DPI where relevant
  - canonical or validated export-grade vector assets
  - stable styling independent of viewport DOM state
- Export should be vector-first wherever the layer semantics allow it.
- Raster fallback in export should be explicit and controlled, not accidental.
- Export scene resolution should not depend on `window.innerWidth` or current viewport layout.
- Export should consume application state plus export settings and produce a render plan for a target:
  - PDF
  - SVG
  - high-resolution raster if needed
- The long-term target is:
  - UI acts as one client
  - interactive renderer acts as one client
  - export pipeline acts as another client over the same registry/state/selector layer

## Export Quality Rules
- Canonical vector assets should remain the source of truth for print/export quality output.
- Runtime interaction LODs are acceptable for screen rendering but should not silently become export assets.
- Export paths should avoid browser-interaction compromises such as reduced precision during drag or temporary render shortcuts.
- If a layer cannot export cleanly as vector, the fallback should be documented explicitly per layer.
- Export styling should be derived from canonical state and style selectors, not scraped from live DOM presentation.
- If export and interactive rendering diverge, preserve export correctness first and optimize the interactive path separately.

## Refactor Roadmap
- Phase 1: extract pure state and selectors without changing behavior
  - move layer defaults, style defaults, and derived visibility rules out of `app.js`
  - keep existing HTML and CSS contracts intact
- Phase 2: introduce the layer registry
  - describe existing Earth, Borders, Graticule, Empires, and empire sublayers in one place
  - keep current markup but drive more logic from definitions
- Phase 3: unify repeated control wiring
  - finish converging color controls on shared descriptors
  - apply the same pattern to sliders, grouped rows, and expandable sections
- Phase 4: split gesture handling from UI wiring
  - isolate map drag/pinch/double-tap logic from layer panel code
  - isolate projection switcher swipe logic from projection state and DOM sync
- Phase 5: formalize render invalidation
  - render only the passes affected by a state change
  - avoid using UI sync code as an indirect render trigger
- Phase 6: revisit markup generation
  - only after the state/registry model is stable
  - consider generating repeated layer rows from definitions if that improves clarity without breaking the existing UI contract
- Phase 7: formalize export
  - define export scene resolution separately from viewport scene resolution
  - define export-capable layer contracts
  - separate export render targets from interactive render targets
  - preserve vector-first output where possible

## Refactor Status
- Completed or meaningfully underway:
  - registry-backed defaults and hierarchy extraction
  - selector extraction for empire parent/child display rules
  - persistence extraction for style/view state
  - runtime state assembly extraction
  - action extraction for layer and sublayer state changes
  - layer panel UI sync extraction
  - layer panel controller extraction
  - gesture controller extraction
  - render invalidation pass model introduction
  - render scheduler extraction
  - shared color-control interaction binding extraction
- Current architectural split is now roughly:
  - `app.js`
    - composition/orchestration
    - remaining render-pass definitions
    - remaining color-control model helpers
  - registry/defaults
    - `layers-registry.js`
  - selectors
    - `layers-selectors.js`
  - state assembly
    - `app-state.js`
  - actions
    - `app-actions.js`
  - persistence
    - `state-persistence.js`
  - gestures
    - `app-gestures.js`
  - render state / scheduler
    - `app-render-state.js`
    - `app-renderer.js`
  - layer panel UI / controller
    - `app-layer-panel.js`
    - `app-layer-panel-controller.js`
  - color-control interaction binding
    - `app-color-controls.js`
- Remaining high-value work:
  - make registry more canonical for controls/render/export capabilities
  - move remaining color-control model helpers out of `app.js`
  - keep shrinking `app.js` from implementation file toward composition root
  - define export-side render targets when export work starts

## Shared Color Strategy
- Saved custom colors now use a shared palette model rather than siloed per-control lists.
- Current behavior:
  - one shared saved color collection for user-defined colors
  - controls still keep their own fixed default palettes
  - shared custom colors appear consistently across all compatible color controls
- Important distinction:
  - shared custom colors
  - control-specific currently selected color
- In practice:
  - `Land Color`, `Water Color`, `Borders`, `Graticule`, and `Roman Fill` can all draw from the same saved custom palette
  - selecting a color in one row only changes that row’s own target
- If a color is removed from the shared saved palette, it should not silently overwrite a control that is currently using that color.
- Shared saved colors should remain local/browser-persisted unless account sync is introduced later.
- Migration behavior:
  - legacy per-control saved palettes are merged into a deduplicated shared collection if the shared key is empty
  - current selected values in each control remain local to that control

## Readability Standards
- Do not add new features by extending `app.js` with another large inline state/sync block if the logic belongs in a focused module.
- Prefer named state helpers and selectors over duplicated inline conditions.
- Prefer declarative config for repeated UI patterns.
- Keep storage shape translation in one place so runtime state can stay clean.
- Keep renderer inputs explicit; do not make render code infer too much from DOM state.
- When a module becomes responsible for both DOM event handling and domain rules, split it.

## Performance Guidance
- Responsiveness matters more than raw throughput for this app; avoid changes that increase input latency during drag, pinch, or projection switching.
- Avoid repeated forced layout work in UI sync paths:
  - batch reads and writes
  - avoid measuring multiple expandable sections more often than necessary
- Prefer explicit render invalidation over redrawing from broad UI sync chains.
- Reuse cached DOM references and control instances rather than repeated document queries in hot paths.
- Be careful with global document listeners added per control pattern; shared delegation is preferable when behavior is structurally identical.
- Preserve the existing flat-projection camera rule:
  - raster and vector layers must stay on the same shared screen-space transform
- For browser performance guidance, keep paying attention to layout stability and input responsiveness; changes that add visual jank or delay user interaction are regressions even if total code size goes down.

## Export Performance Guidance
- Export performance matters, but correctness matters more than matching interactive renderer speed.
- Do not compromise print/PDF output correctness in order to reuse interactive shortcuts.
- Keep export rendering deterministic even if it is slower than interactive rendering.
- If export requires different asset selection, precision, or render passes, make that branch explicit in code.
