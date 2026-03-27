# Layers Project Notes

## Repo
- Path: `/data/data/com.termux/files/home/layers`
- App is a static browser-based atlas prototype with projection switching, mobile-first gesture work, and layered raster/vector rendering.

## Current Projection Model
- `orthographic`, `azimuthal-equidistant`, and `mercator` behave like direct interactive projections.
- `natural-earth-ii`, `goode-homolosine`, and `waterman` are viewport-based flat projections.
- `dymaxion` remains special-cased and should be treated as lower-confidence for interaction work.

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

## Known Fragile Areas
- Projection switcher swipe logic in `enableProjectionSwitcher()`
- Flat projection raster/vector alignment
- Mobile touch-action interactions and browser zoom suppression
- Mercator drag feel near the poles
- Month overlay and floating controls leaking events into map gestures

## Editing Guidance
- After JS edits, run `node --check` on changed files.
- Prefer narrow fixes when a path is already working on Android Chrome.
- If changing flat projection interaction or rendering, verify:
  - zoom alignment
  - drag alignment
  - projection switch speed
  - mobile control hit areas
