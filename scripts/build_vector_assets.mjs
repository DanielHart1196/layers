#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import topojson from "../vendor/topojson-client.min.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const VECTOR_MANIFEST_PATH = path.join(ROOT, "data", "vector", "manifest.json");
const RAW_WORLD_ATLAS_DIR = path.join(ROOT, "data", "raw", "world-atlas");

const RAW_WORLD_ATLAS_FILES = {
  landFill: {
    "110m": "land-110m.json",
    "50m": "land-50m.json",
    "10m": "land-10m.json",
    canonical: "land-10m.json",
  },
  countryBorders: {
    "110m": "countries-110m.json",
    "50m": "countries-50m.json",
    "10m": "countries-10m.json",
    canonical: "countries-10m.json",
  },
  coastlines: {
    "50m": "land-50m.json",
    "10m": "land-10m.json",
    canonical: "land-10m.json",
  },
};

function buildMetadata({ layerKey, lodKey, sourceFile, canonical, geometryRole }) {
  return {
    layerKey,
    lodKey,
    canonical,
    geometryRole,
    sourceFile,
    generatedAt: new Date().toISOString(),
    generator: "scripts/build_vector_assets.mjs",
  };
}

function wrapFeatureCollection(features, metadata) {
  return {
    type: "FeatureCollection",
    metadata,
    features,
  };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function requireManifestEntry(vectorManifest, layerKey, lodKey) {
  const layer = vectorManifest.layers?.[layerKey];
  const lod = layer?.lods?.[lodKey];
  if (!lod?.assetPath) {
    throw new Error(`Missing vector manifest asset path for ${layerKey}:${lodKey}`);
  }
  return lod;
}

function buildLandFill(topology, metadata) {
  const objectKey = Object.keys(topology.objects)[0];
  const featureCollection = topojson.feature(topology, topology.objects[objectKey]);
  const features = featureCollection.type === "FeatureCollection"
    ? featureCollection.features
    : [featureCollection];

  return wrapFeatureCollection(
    features.map((feature, index) => ({
      type: "Feature",
      id: feature.id ?? `land-fill-${index + 1}`,
      properties: {
        kind: "landFill",
      },
      geometry: feature.geometry,
    })),
    metadata,
  );
}

function buildCountryBorders(topology, metadata) {
  const objectKey = Object.keys(topology.objects)[0];
  const mesh = topojson.mesh(
    topology,
    topology.objects[objectKey],
    (left, right) => left !== right,
  );

  return wrapFeatureCollection(
    [
      {
        type: "Feature",
        id: "country-borders",
        properties: {
          kind: "countryBorders",
        },
        geometry: mesh,
      },
    ],
    metadata,
  );
}

function buildCoastlines(topology, metadata) {
  const objectKey = Object.keys(topology.objects)[0];
  const mesh = topojson.mesh(topology, topology.objects[objectKey]);

  return wrapFeatureCollection(
    [
      {
        type: "Feature",
        id: "coastlines",
        properties: {
          kind: "coastlines",
        },
        geometry: mesh,
      },
    ],
    metadata,
  );
}

async function buildLayerAsset(vectorManifest, layerKey, lodKey) {
  const sourceFile = RAW_WORLD_ATLAS_FILES[layerKey]?.[lodKey];
  if (!sourceFile) {
    return false;
  }

  const manifestEntry = requireManifestEntry(vectorManifest, layerKey, lodKey);
  const assetPath = path.resolve(ROOT, manifestEntry.assetPath.replace(/^\.\//, ""));
  const sourcePath = path.join(RAW_WORLD_ATLAS_DIR, sourceFile);
  const topology = await readJson(sourcePath);
  const metadata = buildMetadata({
    layerKey,
    lodKey,
    sourceFile,
    canonical: Boolean(manifestEntry.canonical),
    geometryRole: vectorManifest.layers[layerKey]?.role ?? "unknown",
  });

  let payload;
  if (layerKey === "landFill") {
    payload = buildLandFill(topology, metadata);
  } else if (layerKey === "countryBorders") {
    payload = buildCountryBorders(topology, metadata);
  } else if (layerKey === "coastlines") {
    payload = buildCoastlines(topology, metadata);
  } else {
    return false;
  }

  await writeJson(assetPath, payload);
  return true;
}

async function main() {
  const vectorManifest = await readJson(VECTOR_MANIFEST_PATH);
  const outputs = [];

  for (const [layerKey, layerConfig] of Object.entries(vectorManifest.layers ?? {})) {
    for (const lodKey of Object.keys(layerConfig.lods ?? {})) {
      const built = await buildLayerAsset(vectorManifest, layerKey, lodKey);
      if (built) {
        outputs.push(`${layerKey}:${lodKey}`);
      }
    }
  }

  console.log(`Built ${outputs.length} normalized vector assets.`);
  outputs.forEach((output) => console.log(`- ${output}`));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
