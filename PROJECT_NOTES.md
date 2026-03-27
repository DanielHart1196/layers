# Layers Project Notes

## Repo
- Path: `/data/data/com.termux/files/home/layers`
- App is a static browser-based atlas prototype with projection switching, mobile-first gesture work, and layered raster/vector rendering.

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
