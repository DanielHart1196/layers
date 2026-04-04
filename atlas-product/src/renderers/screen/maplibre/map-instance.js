import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import polygonClipping from "polygon-clipping";
import {
  createGeojsonVectorSourceSpec,
  installAtlasVectorTileProtocol,
  registerGeojsonVectorTileSource,
} from "./vector-tiles.js";

let protocolInstalled = false;
const LAND_SOURCE_ID = "atlas-country-vector";
const LAND_TILE_SOURCE_ID = "atlas-country-vector-tiles";
const LAND_TILE_SOURCE_LAYER = "land";
const LAND_FILL_LAYER_ID = "atlas-country-vector-fill";
const LAND_LINE_LAYER_ID = "atlas-country-vector-line";
const COUNTRY_VECTOR_URL = "/data/external-countries.geojson";
const GRATICULES_SOURCE_ID = "atlas-graticules";
const GRATICULES_TILE_SOURCE_ID = "atlas-graticules-tiles";
const GRATICULES_TILE_SOURCE_LAYER = "graticules";
const GRATICULES_LINE_LAYER_ID = "atlas-graticules-line";
const GRATICULES_VECTOR_URL = "/data/graticules/world-graticules-10deg.geojson";
const ROMAN_SOURCE_ID = "atlas-roman-empire";
const ROMAN_FILL_SOURCE_ID = "atlas-roman-empire-fill-source";
const ROMAN_FILL_SOURCE_LAYER = "roman-fill";
const ROMAN_FILL_LAYER_ID = "atlas-roman-empire-fill";
const ROMAN_LINE_LAYER_ID = "atlas-roman-empire-line";
const ROMAN_VECTOR_URL = "/data/empires/roman_empire_117ad_major_empires_source.geojson";
const MONGOL_SOURCE_ID = "atlas-mongol-empire";
const MONGOL_FILL_LAYER_ID = "atlas-mongol-empire-fill";
const MONGOL_LINE_LAYER_ID = "atlas-mongol-empire-line";
const MONGOL_FILL_SOURCE_ID = "atlas-mongol-empire-fill-source";
const MONGOL_FILL_SOURCE_LAYER = "mongol-fill";
const MONGOL_VECTOR_URL = "/data/empires/mongol_empire_1279_extent.medium.self-cutout.geojson";
const MONGOL_FILL_VECTOR_URL = "/data/empires/mongol_empire_1279_extent.medium.dissolved-fill.geojson";
const BRITISH_SOURCE_ID = "atlas-british-empire";
const BRITISH_FILL_SOURCE_ID = "atlas-british-empire-fill-source";
const BRITISH_FILL_SOURCE_LAYER = "british-fill";
const BRITISH_FILL_LAYER_ID = "atlas-british-empire-fill";
const BRITISH_LINE_LAYER_ID = "atlas-british-empire-line";
const BRITISH_VECTOR_URL = "/data/empires/british_empire_1921_extent.low.self-cutout.geojson";
const EMPIRE_FILL_LAYER_IDS = {
  roman: ROMAN_FILL_LAYER_ID,
  mongol: MONGOL_FILL_LAYER_ID,
  british: BRITISH_FILL_LAYER_ID,
};
const EMPIRE_LINE_LAYER_IDS = {
  roman: ROMAN_LINE_LAYER_ID,
  mongol: MONGOL_LINE_LAYER_ID,
  british: BRITISH_LINE_LAYER_ID,
};
const LINE_LAYER_IDS = {
  countries: LAND_LINE_LAYER_ID,
  ...EMPIRE_LINE_LAYER_IDS,
  graticules: GRATICULES_LINE_LAYER_ID,
};
const WATER_BACKGROUND_COLOR = { r: 44, g: 111, b: 146 };
const DEFAULT_LAND_FILL_COLOR = "#6EAA6E";
const DEFAULT_OCEAN_FILL_COLOR = "#2C6F92";
const DEFAULT_GRATICULE_LINE_COLOR = "#8FA9BC";

function getFirstExistingLayerId(map, candidateIds) {
  return candidateIds.find((id) => map.getLayer(id)) ?? null;
}

function getLogicalLayerBundles() {
  return {
    earth: {
      graticules: [GRATICULES_LINE_LAYER_ID],
    },
    empires: {
      roman: [ROMAN_FILL_LAYER_ID, ROMAN_LINE_LAYER_ID],
      mongol: [MONGOL_FILL_LAYER_ID, MONGOL_LINE_LAYER_ID],
      british: [BRITISH_FILL_LAYER_ID, BRITISH_LINE_LAYER_ID],
    },
  };
}

function applyLogicalLayerOrder(map, parentId, orderedLayerIds) {
  const bundles = getLogicalLayerBundles()[parentId];
  if (!bundles) {
    return;
  }

  const flattened = orderedLayerIds
    .flatMap((layerId) => bundles[layerId] ?? [])
    .filter((layerId) => map.getLayer(layerId));

  const anchorBeforeId = parentId === "earth"
    ? getFirstExistingLayerId(map, [
      ROMAN_FILL_LAYER_ID,
      ROMAN_LINE_LAYER_ID,
      MONGOL_FILL_LAYER_ID,
      MONGOL_LINE_LAYER_ID,
      BRITISH_FILL_LAYER_ID,
      BRITISH_LINE_LAYER_ID,
    ])
    : null;

  for (let index = flattened.length - 1; index >= 0; index -= 1) {
    map.moveLayer(flattened[index], anchorBeforeId ?? undefined);
  }
}

function isRealPmtilesUrl(url) {
  const normalized = String(url ?? "").trim();
  return normalized.endsWith(".pmtiles");
}

function buildStyle(manifest) {
  const layers = [
    {
      id: "atlas-water",
      type: "background",
      paint: {
        "background-color": "#2c6f92",
      },
    },
  ];

  return {
    version: 8,
    projection: {
      type: "globe",
    },
    sources: {},
    layers,
  };
}

function getLayerStyleValue(layerState, layerId, key, fallback) {
  const nextValue = layerState?.[layerId]?.[key];
  return nextValue === undefined ? fallback : nextValue;
}

function hexToRgb(value, fallback) {
  const normalized = String(value ?? "").trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16),
      g: Number.parseInt(normalized.slice(2, 4), 16),
      b: Number.parseInt(normalized.slice(4, 6), 16),
    };
  }

  return fallback;
}

function buildWaterBackgroundColor(fillColor, alphaPercent) {
  const rgb = hexToRgb(fillColor, WATER_BACKGROUND_COLOR);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Number(alphaPercent) / 100})`;
}

function getLayoutVisibility(layerState, layerId) {
  return getLayerStyleValue(layerState, layerId, "visible", true) ? "visible" : "none";
}

function getEmpireLayoutVisibility(layerState, layerId) {
  const groupVisible = getLayerStyleValue(layerState, "empires", "visible", true);
  const layerVisible = getLayerStyleValue(layerState, layerId, "visible", true);
  return groupVisible && layerVisible ? "visible" : "none";
}

function geometryToMultiPolygonCoordinates(geometry) {
  if (!geometry) {
    return [];
  }

  if (geometry.type === "Polygon") {
    return [geometry.coordinates];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates;
  }

  return [];
}

function buildEmpireOutlineFeatureCollection(featureCollection) {
  const polygonSets = [];

  for (const feature of featureCollection?.features ?? []) {
    const polygons = geometryToMultiPolygonCoordinates(feature.geometry);
    if (polygons.length > 0) {
      polygonSets.push(polygons);
    }
  }

  if (polygonSets.length === 0) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const dissolved = polygonClipping.union(...polygonSets);
  const lineFeatures = [];

  for (const polygon of dissolved ?? []) {
    for (const ring of polygon ?? []) {
      lineFeatures.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: ring,
        },
      });
    }
  }

  return {
    type: "FeatureCollection",
    features: lineFeatures,
  };
}

function ensureProtocol() {
  if (protocolInstalled) {
    return;
  }

  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  installAtlasVectorTileProtocol(maplibregl);
  registerGeojsonVectorTileSource({
    id: LAND_TILE_SOURCE_ID,
    dataUrl: COUNTRY_VECTOR_URL,
    sourceLayer: LAND_TILE_SOURCE_LAYER,
  });
  registerGeojsonVectorTileSource({
    id: GRATICULES_TILE_SOURCE_ID,
    dataUrl: GRATICULES_VECTOR_URL,
    sourceLayer: GRATICULES_TILE_SOURCE_LAYER,
  });
  registerGeojsonVectorTileSource({
    id: ROMAN_FILL_SOURCE_ID,
    dataUrl: ROMAN_VECTOR_URL,
    sourceLayer: ROMAN_FILL_SOURCE_LAYER,
  });
  registerGeojsonVectorTileSource({
    id: MONGOL_FILL_SOURCE_ID,
    dataUrl: MONGOL_FILL_VECTOR_URL,
    sourceLayer: MONGOL_FILL_SOURCE_LAYER,
  });
  registerGeojsonVectorTileSource({
    id: BRITISH_FILL_SOURCE_ID,
    dataUrl: BRITISH_VECTOR_URL,
    sourceLayer: BRITISH_FILL_SOURCE_LAYER,
  });
  protocolInstalled = true;
}

async function loadRomanEmpireVector() {
  const response = await fetch(ROMAN_VECTOR_URL);
  if (!response.ok) {
    throw new Error(`Failed to load Roman empire vector: ${response.status}`);
  }

  return response.json();
}

async function loadMongolEmpireVector() {
  const response = await fetch(MONGOL_VECTOR_URL);
  if (!response.ok) {
    throw new Error(`Failed to load Mongol empire vector: ${response.status}`);
  }

  return response.json();
}

async function loadBritishEmpireVector() {
  const response = await fetch(BRITISH_VECTOR_URL);
  if (!response.ok) {
    throw new Error(`Failed to load British empire vector: ${response.status}`);
  }

  return response.json();
}

async function attachLandVectorLayer(map, layerState) {
  if (map.getSource(LAND_SOURCE_ID)) {
    if (map.getLayer(LAND_LINE_LAYER_ID)) {
      map.removeLayer(LAND_LINE_LAYER_ID);
    }
    if (map.getLayer(LAND_FILL_LAYER_ID)) {
      map.removeLayer(LAND_FILL_LAYER_ID);
    }
    map.removeSource(LAND_SOURCE_ID);
  }

  map.addSource(LAND_SOURCE_ID, createGeojsonVectorSourceSpec(LAND_TILE_SOURCE_ID));

  map.addLayer({
    id: LAND_FILL_LAYER_ID,
    type: "fill",
    source: LAND_SOURCE_ID,
    "source-layer": LAND_TILE_SOURCE_LAYER,
    layout: {
      visibility: getLayoutVisibility(layerState, "countries"),
    },
    paint: {
      "fill-color": getLayerStyleValue(layerState, "countries", "fillColor", DEFAULT_LAND_FILL_COLOR),
      "fill-opacity": Number(getLayerStyleValue(layerState, "countries", "fillOpacity", 100)) / 100,
    },
  });

  map.addLayer({
    id: LAND_LINE_LAYER_ID,
    type: "line",
    source: LAND_SOURCE_ID,
    "source-layer": LAND_TILE_SOURCE_LAYER,
    layout: {
      visibility: getLayoutVisibility(layerState, "countries"),
    },
    paint: {
      "line-color": getLayerStyleValue(layerState, "countries", "lineColor", "#e1efe4"),
      "line-width": buildLineWidthExpression(getLayerStyleValue(layerState, "countries", "lineWeight", 1)),
      "line-opacity": Number(getLayerStyleValue(layerState, "countries", "lineOpacity", 0)) / 100,
    },
  });
}

function buildLineWidthExpression(weightPx) {
  return Math.max(0, Number(weightPx) || 0);
}

async function attachGraticulesLayer(map, layerState) {
  if (map.getSource(GRATICULES_SOURCE_ID)) {
    if (map.getLayer(GRATICULES_LINE_LAYER_ID)) {
      map.removeLayer(GRATICULES_LINE_LAYER_ID);
    }
    map.removeSource(GRATICULES_SOURCE_ID);
  }

  map.addSource(GRATICULES_SOURCE_ID, createGeojsonVectorSourceSpec(GRATICULES_TILE_SOURCE_ID));

  map.addLayer({
    id: GRATICULES_LINE_LAYER_ID,
    type: "line",
    source: GRATICULES_SOURCE_ID,
    "source-layer": GRATICULES_TILE_SOURCE_LAYER,
    layout: {
      visibility: getLayoutVisibility(layerState, "graticules"),
    },
    paint: {
      "line-color": getLayerStyleValue(layerState, "graticules", "lineColor", DEFAULT_GRATICULE_LINE_COLOR),
      "line-width": buildLineWidthExpression(getLayerStyleValue(layerState, "graticules", "lineWeight", 1)),
      "line-opacity": Number(getLayerStyleValue(layerState, "graticules", "lineOpacity", 100)) / 100,
    },
  });
}

async function attachRomanEmpireLayer(map, layerState) {
  const romanFeatureCollection = await loadRomanEmpireVector();
  attachEmpireLayer(map, {
    layerState,
    layerId: "roman",
    sourceId: ROMAN_SOURCE_ID,
    fillSourceId: ROMAN_FILL_SOURCE_ID,
    fillSourceLayer: ROMAN_FILL_SOURCE_LAYER,
    fillLayerId: ROMAN_FILL_LAYER_ID,
    lineLayerId: ROMAN_LINE_LAYER_ID,
    featureCollection: romanFeatureCollection,
    fallbackColor: "#8c6a2a",
    lineColor: "#c89a42",
  });
}

function attachEmpireLayer(map, {
  layerState,
  layerId,
  sourceId,
  fillSourceId = sourceId,
  fillSourceLayer = null,
  fillLayerId,
  lineLayerId,
  featureCollection,
  fallbackColor,
  lineColor,
}) {
  const outlineSourceId = `${sourceId}-outline`;
  const outlineSourceLayer = `${layerId}-outline`;

  if (map.getSource(sourceId)) {
    if (map.getLayer(lineLayerId)) {
      map.removeLayer(lineLayerId);
    }
    if (map.getLayer(fillLayerId)) {
      map.removeLayer(fillLayerId);
    }
    if (map.getSource(outlineSourceId)) {
      map.removeSource(outlineSourceId);
    }
    if (fillSourceId !== sourceId && map.getSource(fillSourceId)) {
      map.removeSource(fillSourceId);
    }
    map.removeSource(sourceId);
  }

  map.addSource(sourceId, {
    type: "geojson",
    data: featureCollection,
  });

  if (fillSourceId !== sourceId) {
    map.addSource(fillSourceId, createGeojsonVectorSourceSpec(fillSourceId));
  }

  map.addLayer({
    id: fillLayerId,
    type: "fill",
    source: fillSourceId,
    ...(fillSourceLayer ? { "source-layer": fillSourceLayer } : {}),
    layout: {
      visibility: getEmpireLayoutVisibility(layerState, layerId),
    },
    paint: {
      "fill-color": getLayerStyleValue(layerState, layerId, "fillColor", fallbackColor),
      "fill-opacity": Number(getLayerStyleValue(layerState, layerId, "fillOpacity", 100)) / 100,
    },
  });

  registerGeojsonVectorTileSource({
    id: outlineSourceId,
    data: buildEmpireOutlineFeatureCollection(featureCollection),
    sourceLayer: outlineSourceLayer,
  });
  map.addSource(outlineSourceId, createGeojsonVectorSourceSpec(outlineSourceId));

  map.addLayer({
    id: lineLayerId,
    type: "line",
    source: outlineSourceId,
    "source-layer": outlineSourceLayer,
    layout: {
      visibility: getEmpireLayoutVisibility(layerState, layerId),
    },
    paint: {
      "line-color": getLayerStyleValue(layerState, layerId, "lineColor", lineColor),
      "line-width": buildLineWidthExpression(getLayerStyleValue(layerState, layerId, "lineWeight", 1)),
      "line-opacity": Number(getLayerStyleValue(layerState, layerId, "lineOpacity", 100)) / 100,
    },
  });
}

async function attachMongolEmpireLayer(map, layerState) {
  const mongolFeatureCollection = await loadMongolEmpireVector();
  attachEmpireLayer(map, {
    layerState,
    layerId: "mongol",
    sourceId: MONGOL_SOURCE_ID,
    fillSourceId: MONGOL_FILL_SOURCE_ID,
    fillSourceLayer: MONGOL_FILL_SOURCE_LAYER,
    fillLayerId: MONGOL_FILL_LAYER_ID,
    lineLayerId: MONGOL_LINE_LAYER_ID,
    featureCollection: mongolFeatureCollection,
    fallbackColor: "#b85c38",
    lineColor: "#d96f44",
  });
}

async function attachBritishEmpireLayer(map, layerState) {
  const britishFeatureCollection = await loadBritishEmpireVector();
  attachEmpireLayer(map, {
    layerState,
    layerId: "british",
    sourceId: BRITISH_SOURCE_ID,
    fillSourceId: BRITISH_FILL_SOURCE_ID,
    fillSourceLayer: BRITISH_FILL_SOURCE_LAYER,
    fillLayerId: BRITISH_FILL_LAYER_ID,
    lineLayerId: BRITISH_LINE_LAYER_ID,
    featureCollection: britishFeatureCollection,
    fallbackColor: "#c84b31",
    lineColor: "#f07a58",
  });
}

function createMapInstance({ container, manifest = [], viewState, initialLayerState = {} }) {
  if (!container) {
    return null;
  }

  ensureProtocol();
  const layerState = structuredClone(initialLayerState);

  const map = new maplibregl.Map({
    container,
    style: buildStyle(manifest),
    center: [viewState.center.longitude, viewState.center.latitude],
    zoom: viewState.zoom,
    minZoom: 0.7,
    bearing: viewState.bearing,
    pitch: viewState.pitch,
    attributionControl: false,
  });
  map.on("error", (event) => {
    const message = event?.error?.message ?? event?.error?.toString?.() ?? "unknown";
    console.error("MapLibre map error.", message, event?.error);
  });
  map.on("load", () => {
    if (map.getLayer("atlas-water")) {
      map.setLayoutProperty("atlas-water", "visibility", getLayoutVisibility(layerState, "ocean"));
      map.setPaintProperty(
        "atlas-water",
        "background-color",
        buildWaterBackgroundColor(
          getLayerStyleValue(layerState, "ocean", "fillColor", DEFAULT_OCEAN_FILL_COLOR),
          getLayerStyleValue(layerState, "ocean", "fillOpacity", 100),
        ),
      );
    }
    void (async () => {
      try {
        await attachLandVectorLayer(map, layerState);
        await attachGraticulesLayer(map, layerState);
        await attachRomanEmpireLayer(map, layerState);
        await attachMongolEmpireLayer(map, layerState);
        await attachBritishEmpireLayer(map, layerState);
        applyLogicalLayerOrder(map, "earth", getLayerStyleValue(layerState, "earth", "rowOrder", ["ocean", "graticules"]));
        applyLogicalLayerOrder(map, "empires", getLayerStyleValue(layerState, "empires", "rowOrder", ["roman", "mongol", "british"]));
      } catch (error) {
        console.error("Failed to attach ordered atlas layers.", error);
      }
    })();
  });

  return {
    destroy() {
      map.remove();
    },
    getMap() {
      return map;
    },
    reorderLayerGroup(parentId, orderedLayerIds) {
      applyLogicalLayerOrder(map, parentId, orderedLayerIds);
    },
    setLayerStyleValue(layerId, key, value) {
      if (!layerState[layerId] || typeof layerState[layerId] !== "object") {
        layerState[layerId] = {};
      }
      layerState[layerId][key] = value;

      if (key === "fillOpacity") {
        if (layerId === "countries" && map.getLayer(LAND_FILL_LAYER_ID)) {
          map.setPaintProperty(LAND_FILL_LAYER_ID, "fill-opacity", Number(value) / 100);
          return;
        }

        if (layerId === "ocean" && map.getLayer("atlas-water")) {
          map.setPaintProperty(
            "atlas-water",
            "background-color",
            buildWaterBackgroundColor(
              getLayerStyleValue(layerState, "ocean", "fillColor", DEFAULT_OCEAN_FILL_COLOR),
              value,
            ),
          );
          return;
        }

        const fillLayerId = EMPIRE_FILL_LAYER_IDS[layerId];
        if (!fillLayerId || !map.getLayer(fillLayerId)) {
          return;
        }

        map.setPaintProperty(fillLayerId, "fill-opacity", Number(value) / 100);
        return;
      }

      if (key === "fillColor") {
        if (layerId === "countries" && map.getLayer(LAND_FILL_LAYER_ID)) {
          map.setPaintProperty(LAND_FILL_LAYER_ID, "fill-color", String(value));
          return;
        }

        if (layerId === "ocean" && map.getLayer("atlas-water")) {
          map.setPaintProperty(
            "atlas-water",
            "background-color",
            buildWaterBackgroundColor(
              value,
              getLayerStyleValue(layerState, "ocean", "fillOpacity", 100),
            ),
          );
          return;
        }

        const fillLayerId = EMPIRE_FILL_LAYER_IDS[layerId];
        if (!fillLayerId || !map.getLayer(fillLayerId)) {
          return;
        }

        map.setPaintProperty(fillLayerId, "fill-color", String(value));
        return;
      }

      if (key === "lineColor") {
        const lineLayerId = LINE_LAYER_IDS[layerId];
        if (!lineLayerId || !map.getLayer(lineLayerId)) {
          return;
        }

        map.setPaintProperty(lineLayerId, "line-color", String(value));
        return;
      }

      if (key === "lineOpacity") {
        const lineLayerId = LINE_LAYER_IDS[layerId];
        if (!lineLayerId || !map.getLayer(lineLayerId)) {
          return;
        }

        map.setPaintProperty(lineLayerId, "line-opacity", Number(value) / 100);
        return;
      }

      if (key === "lineWeight") {
        const lineLayerId = LINE_LAYER_IDS[layerId];
        if (!lineLayerId || !map.getLayer(lineLayerId)) {
          return;
        }

        map.setPaintProperty(lineLayerId, "line-width", buildLineWidthExpression(Number(value)));
        return;
      }

      if (key === "visible") {
        const visibility = value ? "visible" : "none";

        if (layerId === "ocean" && map.getLayer("atlas-water")) {
          map.setLayoutProperty("atlas-water", "visibility", visibility);
          return;
        }

        if (layerId === "countries") {
          if (map.getLayer(LAND_FILL_LAYER_ID)) {
            map.setLayoutProperty(LAND_FILL_LAYER_ID, "visibility", visibility);
          }
          if (map.getLayer(LAND_LINE_LAYER_ID)) {
            map.setLayoutProperty(LAND_LINE_LAYER_ID, "visibility", visibility);
          }
          return;
        }

        if (layerId === "graticules" && map.getLayer(GRATICULES_LINE_LAYER_ID)) {
          map.setLayoutProperty(GRATICULES_LINE_LAYER_ID, "visibility", visibility);
          return;
        }

        if (layerId === "empires") {
          Object.entries(EMPIRE_FILL_LAYER_IDS).forEach(([empireLayerId, fillLayerId]) => {
            if (map.getLayer(fillLayerId)) {
              map.setLayoutProperty(fillLayerId, "visibility", getEmpireLayoutVisibility(layerState, empireLayerId));
            }
          });
          Object.entries(EMPIRE_LINE_LAYER_IDS).forEach(([empireLayerId, lineLayerId]) => {
            if (map.getLayer(lineLayerId)) {
              map.setLayoutProperty(lineLayerId, "visibility", getEmpireLayoutVisibility(layerState, empireLayerId));
            }
          });
          return;
        }

        const fillLayerId = EMPIRE_FILL_LAYER_IDS[layerId];
        if (fillLayerId && map.getLayer(fillLayerId)) {
          map.setLayoutProperty(fillLayerId, "visibility", getEmpireLayoutVisibility(layerState, layerId));
        }

        const lineLayerId = LINE_LAYER_IDS[layerId];
        if (lineLayerId && map.getLayer(lineLayerId)) {
          map.setLayoutProperty(lineLayerId, "visibility", getEmpireLayoutVisibility(layerState, layerId));
        }
      }
    },
  };
}

export { createMapInstance, isRealPmtilesUrl };
