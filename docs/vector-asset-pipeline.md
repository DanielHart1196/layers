# Vector Asset Pipeline

## Goal
- Keep runtime and export quality vector-first.
- Stop feeding raw third-party topology directly into rendering.
- Normalize layer assets offline so fill and stroke behavior is predictable across projections.

## Layer Contracts
- `landFill`
  - polygon-only
  - topology-safe for area fill
  - explicit fill rule
- `countryBorders`
  - stroke-only
  - no area-fill semantics
- `coastlines`
  - stroke-only
  - separate from political borders
- `empires`
  - polygon thematic layer with per-feature metadata

## Canonical Source Model
- Canonical assets stay in lon/lat GeoJSON (`EPSG:4326`).
- Each layer should have:
  - one canonical asset for export and rebuilds
  - one or more runtime LOD assets for interaction
- Runtime assets must be generated from the canonical source, not hand-picked ad hoc.

## Build Stages
1. Ingest source
2. Normalize geometry type and schema
3. Validate topology
4. Normalize winding and hole semantics
5. Generate layer-specific runtime LODs
6. Emit normalized GeoJSON artifacts and manifest entries

## Why This Exists
- The current renderer has shown that raw `land-*m` swaps can create fill-rule regressions.
- A normalized vector asset layer lets runtime code assume:
  - known geometry type
  - known fill rule
  - known topology semantics
- That is the prerequisite for reliable interaction and later SVG/PDF export.

## Runtime Intent
- Runtime should eventually load from `data/vector/manifest.json`, not directly from `world-atlas` URLs.
- The existing `data/manifest.json` remains the current runtime wiring until normalized assets are built.
- LOD selection belongs at runtime; geometry correctness belongs at build time.

## Export Intent
- Screen rendering may use runtime LODs.
- Export should always regenerate from canonical assets.
- That keeps print fidelity independent from interaction performance.
