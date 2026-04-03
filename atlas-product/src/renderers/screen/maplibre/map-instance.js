import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

let protocolInstalled = false;
const LAND_SOURCE_ID = "atlas-country-vector";
const LAND_FILL_LAYER_ID = "atlas-country-vector-fill";
const LAND_LINE_LAYER_ID = "atlas-country-vector-line";
const COUNTRY_VECTOR_URL = "/data/external-countries.geojson";
const ROMAN_SOURCE_ID = "atlas-roman-empire";
const ROMAN_FILL_LAYER_ID = "atlas-roman-empire-fill";
const ROMAN_LINE_LAYER_ID = "atlas-roman-empire-line";
const ROMAN_VECTOR_URL = "/data/empires/roman_empire_ad_117_extent.source.geojson";
const MONGOL_SOURCE_ID = "atlas-mongol-empire";
const MONGOL_FILL_LAYER_ID = "atlas-mongol-empire-fill";
const MONGOL_LINE_LAYER_ID = "atlas-mongol-empire-line";
const MONGOL_VECTOR_URL = "/data/empires/mongol_empire_1279_extent.medium.geojson";
const BRITISH_SOURCE_ID = "atlas-british-empire";
const BRITISH_FILL_LAYER_ID = "atlas-british-empire-fill";
const BRITISH_LINE_LAYER_ID = "atlas-british-empire-line";
const BRITISH_VECTOR_URL = "/data/empires/british_empire_1921_extent.low.geojson";
const EMPIRE_FILL_LAYER_IDS = {
  roman: ROMAN_FILL_LAYER_ID,
  mongol: MONGOL_FILL_LAYER_ID,
  british: BRITISH_FILL_LAYER_ID,
};
const WATER_BACKGROUND_COLOR = { r: 44, g: 111, b: 146 };

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

function ensureProtocol() {
  if (protocolInstalled) {
    return;
  }

  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  protocolInstalled = true;
}

async function loadCountryVector() {
  const response = await fetch(COUNTRY_VECTOR_URL);
  if (!response.ok) {
    throw new Error(`Failed to load country vector: ${response.status}`);
  }

  return response.json();
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

async function attachLandVectorLayer(map, container) {
  const countryFeatureCollection = await loadCountryVector();
  if (map.getSource(LAND_SOURCE_ID)) {
    if (map.getLayer(LAND_LINE_LAYER_ID)) {
      map.removeLayer(LAND_LINE_LAYER_ID);
    }
    if (map.getLayer(LAND_FILL_LAYER_ID)) {
      map.removeLayer(LAND_FILL_LAYER_ID);
    }
    map.removeSource(LAND_SOURCE_ID);
  }

  map.addSource(LAND_SOURCE_ID, {
    type: "geojson",
    data: countryFeatureCollection,
  });

  map.addLayer({
    id: LAND_FILL_LAYER_ID,
    type: "fill",
    source: LAND_SOURCE_ID,
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "MAPCOLOR7"], 0],
        0, "#5b8f5b",
        3, "#6eaa6e",
        6, "#93c07a",
      ],
      "fill-opacity": 0.94,
    },
  });

  map.addLayer({
    id: LAND_LINE_LAYER_ID,
    type: "line",
    source: LAND_SOURCE_ID,
    paint: {
      "line-color": "rgba(225, 239, 228, 0.28)",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        1, 0.2,
        3, 0.45,
        5, 0.8,
      ],
      "line-opacity": 0.8,
    },
  });
}

async function attachRomanEmpireLayer(map) {
  const romanFeatureCollection = await loadRomanEmpireVector();
  attachEmpireLayer(map, {
    sourceId: ROMAN_SOURCE_ID,
    fillLayerId: ROMAN_FILL_LAYER_ID,
    lineLayerId: ROMAN_LINE_LAYER_ID,
    featureCollection: romanFeatureCollection,
    fallbackColor: "#8c6a2a",
    lineColor: "#c89a42",
  });
}

function attachEmpireLayer(map, {
  sourceId,
  fillLayerId,
  lineLayerId,
  featureCollection,
  fallbackColor,
  lineColor,
}) {
  if (map.getSource(sourceId)) {
    if (map.getLayer(lineLayerId)) {
      map.removeLayer(lineLayerId);
    }
    if (map.getLayer(fillLayerId)) {
      map.removeLayer(fillLayerId);
    }
    map.removeSource(sourceId);
  }

  map.addSource(sourceId, {
    type: "geojson",
    data: featureCollection,
  });

  map.addLayer({
    id: fillLayerId,
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": ["coalesce", ["get", "displayColor"], fallbackColor],
      "fill-opacity": 1,
    },
  });

  map.addLayer({
    id: lineLayerId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": lineColor,
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        1, 0.45,
        3, 1,
        5, 1.8,
      ],
      "line-opacity": 1,
    },
  });
}

async function attachMongolEmpireLayer(map) {
  const mongolFeatureCollection = await loadMongolEmpireVector();
  attachEmpireLayer(map, {
    sourceId: MONGOL_SOURCE_ID,
    fillLayerId: MONGOL_FILL_LAYER_ID,
    lineLayerId: MONGOL_LINE_LAYER_ID,
    featureCollection: mongolFeatureCollection,
    fallbackColor: "#b85c38",
    lineColor: "#d96f44",
  });
}

async function attachBritishEmpireLayer(map) {
  const britishFeatureCollection = await loadBritishEmpireVector();
  attachEmpireLayer(map, {
    sourceId: BRITISH_SOURCE_ID,
    fillLayerId: BRITISH_FILL_LAYER_ID,
    lineLayerId: BRITISH_LINE_LAYER_ID,
    featureCollection: britishFeatureCollection,
    fallbackColor: "#c84b31",
    lineColor: "#f07a58",
  });
}

function createMapInstance({ container, manifest = [], viewState }) {
  if (!container) {
    return null;
  }

  ensureProtocol();

  const map = new maplibregl.Map({
    container,
    style: buildStyle(manifest),
    center: [viewState.center.longitude, viewState.center.latitude],
    zoom: viewState.zoom,
    bearing: viewState.bearing,
    pitch: viewState.pitch,
    attributionControl: false,
  });
  map.on("error", (event) => {
    const message = event?.error?.message ?? event?.error?.toString?.() ?? "unknown";
    console.error("MapLibre map error.", message, event?.error);
  });
  map.on("load", () => {
    if (typeof map.setProjection === "function") {
      map.setProjection({ type: "globe" });
    }
    void (async () => {
      try {
        await attachLandVectorLayer(map, container);
        await attachRomanEmpireLayer(map);
        await attachMongolEmpireLayer(map);
        await attachBritishEmpireLayer(map);
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
    setLayerStyleValue(layerId, key, value) {
      if (key !== "fillOpacity") {
        return;
      }

      if (layerId === "land" && map.getLayer(LAND_FILL_LAYER_ID)) {
        map.setPaintProperty(LAND_FILL_LAYER_ID, "fill-opacity", Number(value) / 100);
        return;
      }

      if (layerId === "ocean" && map.getLayer("atlas-water")) {
        map.setPaintProperty(
          "atlas-water",
          "background-color",
          `rgba(${WATER_BACKGROUND_COLOR.r}, ${WATER_BACKGROUND_COLOR.g}, ${WATER_BACKGROUND_COLOR.b}, ${Number(value) / 100})`,
        );
        return;
      }

      const fillLayerId = EMPIRE_FILL_LAYER_IDS[layerId];
      if (!fillLayerId || !map.getLayer(fillLayerId)) {
        return;
      }

      map.setPaintProperty(fillLayerId, "fill-opacity", Number(value) / 100);
    },
  };
}

export { createMapInstance, isRealPmtilesUrl };
