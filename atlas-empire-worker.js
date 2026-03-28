self.preprocessGeometry = function preprocessGeometry(geometry) {
  if (!geometry || typeof geometry !== "object") {
    return null;
  }

  if (geometry.type === "FeatureCollection") {
    return {
      type: geometry.type,
      featureCount: Array.isArray(geometry.features) ? geometry.features.length : 0,
      features: (geometry.features ?? []).map((feature) => preprocessGeometry(feature)).filter(Boolean),
    };
  }

  if (geometry.type === "Feature") {
    return {
      type: geometry.type,
      properties: geometry.properties ?? {},
      geometry: preprocessGeometry(geometry.geometry),
    };
  }

  if (geometry.type === "MultiPolygon") {
    let ringCount = 0;
    let pointCount = 0;
    geometry.coordinates.forEach((polygon) => {
      ringCount += polygon.length;
      polygon.forEach((ring) => {
        pointCount += ring.length;
      });
    });

    return {
      type: geometry.type,
      polygonCount: geometry.coordinates.length,
      ringCount,
      pointCount,
      coordinates: geometry.coordinates,
    };
  }

  if (geometry.type === "Polygon") {
    let pointCount = 0;
    geometry.coordinates.forEach((ring) => {
      pointCount += ring.length;
    });

    return {
      type: geometry.type,
      polygonCount: 1,
      ringCount: geometry.coordinates.length,
      pointCount,
      coordinates: geometry.coordinates,
    };
  }

  return {
    type: geometry.type,
  };
};

self.onmessage = (event) => {
  const { type, payload } = event.data ?? {};

  if (type === "ping") {
    self.postMessage({ type: "pong" });
    return;
  }

  if (type === "prepare-empire-scene") {
    const { requestId, sceneKey, empireEntries, sceneSnapshot, quality } = payload ?? {};
    self.postMessage({
      type: "empire-scene-prepared",
      payload: {
        requestId,
        sceneKey,
        quality: quality ?? "interactive",
        empireEntries: Array.isArray(empireEntries)
          ? empireEntries.map((entry) => ({
              empireKey: entry.empireKey,
              preparedGeometry: preprocessGeometry(entry.geometry),
            }))
          : [],
        projectionKind: sceneSnapshot?.projectionKind ?? null,
      },
    });
  }
};
