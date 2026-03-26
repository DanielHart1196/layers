(() => {
  function createContinuousAdapter(scene, context) {
    const projection = window.AtlasCore.createProjection(scene, {
      disableClipExtent: scene.projectionKind === "mercator",
    });
    const path = d3.geoPath(projection, context);
    const wrapOffsets = getWrapOffsets(scene, projection);

    function getWrapOffsets(sceneDefinition, sceneProjection) {
      if (sceneDefinition.projectionKind !== "mercator" || !sceneDefinition.width) {
        return [0];
      }

      const worldWidth = Math.max(1, Math.PI * 2 * sceneProjection.scale());
      const repeatCount = Math.max(1, Math.ceil(sceneDefinition.width / Math.max(worldWidth, 1)) + 1);
      const offsets = [];

      for (let index = -repeatCount; index <= repeatCount; index += 1) {
        offsets.push(index * worldWidth);
      }

      return offsets;
    }

    function forEachWrappedPath(geometry, callback) {
      wrapOffsets.forEach((offset) => {
        context.save();
        if (offset !== 0) {
          context.translate(offset, 0);
        }
        callback(geometry);
        context.restore();
      });
    }

    return {
      kind: "continuous",
      isReady: true,
      supportsRaster: true,
      canRenderLayer() {
        return true;
      },
      resolveGeometry(_layerKind, fallbackGeometry) {
        return fallbackGeometry;
      },
      projectPoint([longitude, latitude]) {
        return projection([longitude, latitude]);
      },
      invertPoint(point) {
        return projection.invert(point);
      },
      traceGeometry(geometry) {
        forEachWrappedPath(geometry, (wrappedGeometry) => {
          path(wrappedGeometry);
        });
      },
      fillGeometry(geometry, fillStyle, fillRule = "nonzero") {
        forEachWrappedPath(geometry, (wrappedGeometry) => {
          context.beginPath();
          path(wrappedGeometry);
          context.fillStyle = fillStyle;
          context.fill(fillRule);
        });
      },
      strokeGeometry(geometry, strokeStyle, lineWidth) {
        forEachWrappedPath(geometry, (wrappedGeometry) => {
          context.beginPath();
          path(wrappedGeometry);
          context.strokeStyle = strokeStyle;
          context.lineWidth = lineWidth;
          context.stroke();
        });
      },
    };
  }

  function createDymaxionAdapter(scene, context, worldData) {
    const projector = window.AtlasDymaxion.createProjector(scene);
    const facePolygons = window.AtlasDymaxion.createFacePolygons(scene).filter(Boolean);
    const dymaxionCountrySource = window.DYMAXION_COUNTRIES ?? window.countries ?? null;
    const dymaxionLayerData = window.AtlasDymaxion.getLayerData(dymaxionCountrySource);

    function withFaceClip(facePolygon, draw) {
      const [firstPoint, ...restPoints] = facePolygon.points;
      context.save();
      context.beginPath();
      context.moveTo(firstPoint.x, firstPoint.y);
      restPoints.forEach((point) => {
        context.lineTo(point.x, point.y);
      });
      context.closePath();
      context.clip();
      draw(facePolygon);
      context.restore();
    }

    function strokeGeometry(geometry, strokeStyle, lineWidth, options = {}) {
      facePolygons.forEach((facePolygon) => {
        withFaceClip(facePolygon, () => {
          context.beginPath();
          window.AtlasDymaxion.traceGeometry(context, projector, geometry, {
            maxStepDegrees: options.maxStepDegrees ?? 0.8,
            splitDepth: options.splitDepth ?? 10,
            minimumStepDegrees: options.minimumStepDegrees ?? 0.05,
            breakDistance: options.breakDistance ?? 20,
            closeSegments: false,
          });
          context.strokeStyle = strokeStyle;
          context.lineWidth = lineWidth;
          context.stroke();
        });
      });
    }

    function appendClippedPolygonPath(geometry, facePolygon, fillOptions = {}) {
      switch (geometry?.type) {
        case "FeatureCollection":
          geometry.features.forEach((feature) => appendClippedPolygonPath(feature, facePolygon, fillOptions));
          break;
        case "Feature":
          appendClippedPolygonPath(geometry.geometry, facePolygon, fillOptions);
          break;
        case "GeometryCollection":
          geometry.geometries.forEach((child) => appendClippedPolygonPath(child, facePolygon, fillOptions));
          break;
        case "Polygon":
          appendClippedPolygon(facePolygon, geometry.coordinates, fillOptions);
          break;
        case "MultiPolygon":
          geometry.coordinates.forEach((polygon) => appendClippedPolygon(facePolygon, polygon, fillOptions));
          break;
        default:
          break;
      }
    }

    function appendClippedPolygon(facePolygon, polygon, fillOptions) {
      polygon.forEach((ring) => {
        const projectedRing = window.AtlasDymaxion.projectCoordinates(projector, ring, {
          maxStepDegrees: fillOptions.maxStepDegrees ?? 0.6,
          splitDepth: fillOptions.splitDepth ?? 11,
          minimumStepDegrees: fillOptions.minimumStepDegrees ?? 0.04,
        });
        const clippedRing = window.AtlasDymaxion.clipRingToPolygon(projectedRing, facePolygon.points);

        if (clippedRing.length < 4) {
          return;
        }

        context.moveTo(clippedRing[0].x, clippedRing[0].y);
        clippedRing.slice(1).forEach((point) => {
          context.lineTo(point.x, point.y);
        });
        context.closePath();
      });
    }

    function fillGeometry(geometry, fillStyle, fillRule = "evenodd", options = {}) {
      facePolygons.forEach((facePolygon) => {
        context.beginPath();
        appendClippedPolygonPath(geometry, facePolygon, options);
        context.fillStyle = fillStyle;
        context.fill(fillRule);
      });
    }

    return {
      kind: "interrupted",
      isReady: true,
      supportsRaster: false,
      canRenderLayer(layerKind) {
        return layerKind === "land" || layerKind === "borders" || layerKind === "graticule";
      },
      resolveGeometry(layerKind, fallbackGeometry) {
        if (layerKind === "land" && dymaxionLayerData?.land) {
          return dymaxionLayerData.land;
        }

        if (layerKind === "borders" && dymaxionLayerData?.borders) {
          return dymaxionLayerData.borders;
        }

        return fallbackGeometry;
      },
      projectPoint([longitude, latitude]) {
        const projected = projector(longitude, latitude);
        return [projected.x, projected.y];
      },
      invertPoint() {
        return null;
      },
      traceGeometry(geometry, options = {}) {
        window.AtlasDymaxion.traceGeometry(context, projector, geometry, options);
      },
      fillGeometry,
      strokeGeometry,
    };
  }

  function createAdapter(scene, context, worldData) {
    if (scene.projectionKind === "dymaxion") {
      return createDymaxionAdapter(scene, context, worldData);
    }

    return createContinuousAdapter(scene, context);
  }

  function projectionSupportsRaster(projectionKind) {
    return projectionKind !== "dymaxion"
      && projectionKind !== "natural-earth-ii"
      && projectionKind !== "goode-homolosine"
      && projectionKind !== "waterman";
  }

  window.AtlasAdapters = {
    createAdapter,
    projectionSupportsRaster,
  };
})();
