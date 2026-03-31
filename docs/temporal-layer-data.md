# Temporal Layer Data Contract

## Goal
- Build time support once at the layer-data level.
- Do not build a tectonics-specific frontend system.
- Do not build a separate rendering model for temporal layers.
- A temporal layer should behave like any other layer:
  - it has data
  - it has styling
  - it renders on the map
  - the only extra dimension is that it may have geometry for multiple times

## Core Principle
- Time belongs to layer data, not to a special layer type.
- If a layer has one geometry state, it is effectively static.
- If a layer has many geometry states, it is temporal.
- The renderer should not care why geometry changed.
- The renderer should only receive active geometry for the current time.

## Product Model
- The app has one current time value.
- Any layer can opt into that time value by providing geometry for one or more times.
- Any layer without matching temporal data simply uses its present/default geometry.
- This should work the same way for:
  - tectonic plates
  - fossils
  - Olympics birthplace medals
  - future historical boundaries
  - future climate/biome/coastline layers

## What We Are Not Building
- No runtime tectonic transformation engine in the browser.
- No layer-specific time systems.
- No separate projection pipeline for temporal data.
- No per-dataset UI architecture.

## Runtime Contract
- The frontend should resolve:
  - `layer id`
  - `current time`
  - optional filters
- and receive:
  - active geometry/features for that layer at that time

- Conceptually:
  - `getLayerFeaturesAtTime(layerId, time, filters?)`

## Data Contract
- A temporal layer runtime artifact should contain:
  - layer metadata
  - available times
  - feature data indexed by time
  - optional filter indexes/metadata

- At the logical level, the contract is:
  - one logical layer
  - many time states

- The physical storage layout can vary:
  - one packed file per layer
  - chunked files per layer
  - later, tile/range-based packaging

## Important Separation
- Source/master data:
  - raw uploads
  - preprocessing outputs
  - reconstruction outputs
  - can be messy and numerous

- Runtime/served data:
  - optimized for the app
  - ideally one logical artifact per layer
  - does not need to mirror source storage layout

## Recommended V1 Runtime Shape
- Start simple and explicit.
- One packed artifact per logical temporal layer.
- JSON is acceptable for the first proof.

Example shape:

```json
{
  "layerId": "olympic-medals-birthplace",
  "label": "Olympic Medals by Birthplace",
  "timeField": "year",
  "availableTimes": [2000, 2004, 2008],
  "filterFields": ["sport", "event", "medal"],
  "featuresByTime": {
    "2000": {
      "type": "FeatureCollection",
      "features": []
    },
    "2004": {
      "type": "FeatureCollection",
      "features": []
    },
    "2008": {
      "type": "FeatureCollection",
      "features": []
    }
  }
}
```

## Feature Properties
- Temporal filtering should come from feature properties, not custom code.
- For the Olympics test layer, likely properties are:
  - `year`
  - `athlete`
  - `country`
  - `sport`
  - `event`
  - `medal`
  - `birthplace_name`
  - `birthplace_country`

- For tectonics later, properties might include:
  - `plate_id`
  - `name`
  - `kind`

## Filters
- Filters should be generic layer-data filters.
- They should not be hardcoded for Olympics or tectonics.
- A temporal layer artifact can declare which fields are filterable.
- The layer system should treat those as data-driven controls.

## Why This Fits The Existing App Direction
- Rows already point at layer behavior rather than owning separate style context.
- Styles increasingly belong to the real layer.
- This temporal model follows the same rule:
  - time changes which data the layer uses
  - not how the renderer fundamentally works

## Scaling Up
- Do not assume one network file per time step.
- The logical model can still be time-indexed even if physical storage later becomes:
  - chunked by time range
  - compacted/binary
  - PMTiles/range-backed

- The frontend contract should stay the same even if the storage backend changes.

## First Test Dataset
- Use Olympics medals by athlete birthplace as the first temporal-layer test.
- Why:
  - clear years
  - naturally pressures time support
  - naturally pressures filter support
  - point data is simpler than tectonic polygons for the first end-to-end proof

## Current Real Source
- Current source candidate:
  - `OlympicsGoNUTS` / EDJNet
  - local source copies now live under `data/sources/olympicsgonuts/`
- Use `1996` onward for the first build.
- Treat `*_medalists_all.csv` as the canonical source input.
- Treat `*_missing_place_of_birth.csv` and related files as diagnostics/coverage reports, not the main runtime artifact source.
- Important finding:
  - the `*_medalists_all.csv` header is consistent from `1996` through `2024`
  - this is strong enough to justify one generic adapter rather than a year-specific importer

## First Implementation Steps
1. Add a generic temporal layer artifact loader/resolver.
2. Create one real Olympics packed data artifact from the `1996+` source CSVs.
3. Resolve active features by `current time`.
4. Render them with the normal layer pipeline.
5. Only after that, decide whether UI needs a generalized time control beyond the current month system.

## Decision Record
- No explicit `static` vs `temporal` declaration is required in the layer definition.
- Temporal behavior is implicit if multiple time states are present in the layer data.
