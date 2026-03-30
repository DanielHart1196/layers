let geometryIdCounter = 0;
const geometryIds = new WeakMap();

  function getGeometryId(geometry) {
    if (!geometry || (typeof geometry !== "object" && typeof geometry !== "function")) {
      return String(geometry);
    }

    if (!geometryIds.has(geometry)) {
      geometryIds.set(geometry, `g${++geometryIdCounter}`);
    }

    return geometryIds.get(geometry);
  }

  function roundNumber(value, precision = 3) {
    return Number.isFinite(value) ? Number(value).toFixed(precision) : String(value);
  }

  function getSceneCacheKey(scene) {
    return [
      scene.projectionKind,
      roundNumber(scene.center?.[0]),
      roundNumber(scene.center?.[1]),
      roundNumber(scene.width),
      roundNumber(scene.height),
      roundNumber(scene.radius),
      roundNumber(scene.zoomScale),
      roundNumber(scene.rotate?.[0]),
      roundNumber(scene.rotate?.[1]),
      roundNumber(scene.rotate?.[2]),
      roundNumber(scene.panOffset?.x),
      roundNumber(scene.panOffset?.y),
    ].join("|");
  }

  function shouldCacheScene(scene) {
    return (
      scene?.projectionKind === "natural-earth-ii" ||
      scene?.projectionKind === "goode-homolosine" ||
      scene?.projectionKind === "waterman" ||
      scene?.projectionKind === "dymaxion"
    );
  }

  function createProjectedPathCache() {
    const cache = new Map();

    function get(scene, geometry, variantKey) {
      if (!shouldCacheScene(scene) || typeof Path2D === "undefined") {
        return null;
      }

      const cacheKey = [
        getSceneCacheKey(scene),
        variantKey,
        getGeometryId(geometry),
      ].join("|");

      return cache.get(cacheKey) ?? null;
    }

    function set(scene, geometry, variantKey, path) {
      if (!shouldCacheScene(scene) || typeof Path2D === "undefined") {
        return path;
      }

      const cacheKey = [
        getSceneCacheKey(scene),
        variantKey,
        getGeometryId(geometry),
      ].join("|");

      cache.set(cacheKey, path);
      return path;
    }

    function getOrCreate(scene, geometry, variantKey, factory) {
      const existing = get(scene, geometry, variantKey);
      if (existing) {
        return existing;
      }

      return set(scene, geometry, variantKey, factory());
    }

    function clear() {
      cache.clear();
    }

    return {
      clear,
      get,
      getOrCreate,
      set,
    };
  }

const AtlasPathCache = {
  createProjectedPathCache,
  getGeometryId,
  getSceneCacheKey,
  shouldCacheScene,
};

export {
  createProjectedPathCache,
  getGeometryId,
  getSceneCacheKey,
  shouldCacheScene,
};

export default AtlasPathCache;

window.AtlasPathCache = AtlasPathCache;
