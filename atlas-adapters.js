(() => {
  const projectedPathCache = window.AtlasPathCache?.createProjectedPathCache?.() ?? null;

  function createContinuousAdapter(scene, context, renderState = {}) {
    const baseProjection = window.AtlasCore.createProjection(scene, {
      disableClipExtent: scene.projectionKind === "mercator",
      precision:
        scene.projectionKind === "azimuthal-equidistant"
        ? (renderState.isInteracting ? 2.4 : 0.35)
        : undefined,
    });
    const usesViewportCameraTransform =
      scene.projectionKind === "natural-earth-ii" ||
      scene.projectionKind === "goode-homolosine" ||
      scene.projectionKind === "waterman";
    const zoomScale = scene.zoomScale ?? 1;
    const panX = scene.panOffset?.x ?? 0;
    const panY = scene.panOffset?.y ?? 0;
    const centerX = scene.center[0];
    const centerY = scene.center[1];
    const transformProjectedPoint = ([x, y]) => ([
      ((x - centerX) * zoomScale) + centerX + panX,
      ((y - centerY) * zoomScale) + centerY + panY,
    ]);
    const invertTransformedPoint = ([x, y]) => ([
      ((x - centerX - panX) / zoomScale) + centerX,
      ((y - centerY - panY) / zoomScale) + centerY,
    ]);
    const cameraProjection = usesViewportCameraTransform
      ? createViewportCameraProjection(baseProjection, scene)
      : baseProjection;
    const path = d3.geoPath(cameraProjection, context);
    const wrapOffsets = getWrapOffsets(scene, cameraProjection);

    function createViewportCameraProjection(projection, sceneDefinition) {
      return {
        stream(outputStream) {
          const transformedStream = {
            point(x, y) {
              const [tx, ty] = transformProjectedPoint([x, y]);
              outputStream.point(tx, ty);
            },
            lineStart() {
              outputStream.lineStart();
            },
            lineEnd() {
              outputStream.lineEnd();
            },
            polygonStart() {
              outputStream.polygonStart();
            },
            polygonEnd() {
              outputStream.polygonEnd();
            },
            sphere() {
              outputStream.sphere();
            },
          };

          return projection.stream(transformedStream);
        },
        invert(point) {
          if (typeof projection.invert !== "function") {
            return null;
          }

          return projection.invert(invertTransformedPoint(point));
        },
      };
    }

    function getWrapOffsets(sceneDefinition, sceneProjection) {
      if (sceneDefinition.projectionKind !== "mercator" || !sceneDefinition.width) {
        return [0];
      }

      const worldWidth = Math.max(1, Math.PI * 2 * sceneProjection.scale());
      const baseLeft = sceneDefinition.center[0] - worldWidth / 2;
      const baseRight = sceneDefinition.center[0] + worldWidth / 2;
      const viewportLeft = sceneDefinition.center[0] - sceneDefinition.width / 2;
      const viewportRight = sceneDefinition.center[0] + sceneDefinition.width / 2;
      const minIndex = Math.ceil((viewportLeft - baseRight) / worldWidth);
      const maxIndex = Math.floor((viewportRight - baseLeft) / worldWidth);
      const offsetSet = new Set([-worldWidth, 0, worldWidth]);

      for (let index = minIndex; index <= maxIndex; index += 1) {
        offsetSet.add(index * worldWidth);
      }

      const offsets = Array.from(offsetSet).sort((left, right) => left - right);
      return offsets.length ? offsets : [0];
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

    function createCachedPath2D(geometry, variantKey = "default") {
      if (!projectedPathCache || typeof Path2D === "undefined") {
        return null;
      }

       if (wrapOffsets.length > 1) {
        return null;
      }

      return projectedPathCache.getOrCreate(scene, geometry, variantKey, () => {
        const path2d = new Path2D();
        const cachedPath = d3.geoPath(cameraProjection, path2d);
        cachedPath(geometry);
        return path2d;
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
        const projected = baseProjection([longitude, latitude]);
        if (!projected || !usesViewportCameraTransform) {
          return projected;
        }

        return transformProjectedPoint(projected);
      },
      invertPoint(point) {
        if (!usesViewportCameraTransform) {
          return baseProjection.invert(point);
        }

        return baseProjection.invert(invertTransformedPoint(point));
      },
      traceGeometry(geometry) {
        forEachWrappedPath(geometry, (wrappedGeometry) => {
          path(wrappedGeometry);
        });
      },
      fillGeometry(geometry, fillStyle, fillRule = "nonzero") {
        const cachedPath = createCachedPath2D(geometry, `fill:${fillRule}`);
        if (cachedPath) {
          context.fillStyle = fillStyle;
          context.fill(cachedPath, fillRule);
          return;
        }

        forEachWrappedPath(geometry, (wrappedGeometry) => {
          context.beginPath();
          path(wrappedGeometry);
          context.fillStyle = fillStyle;
          context.fill(fillRule);
        });
      },
      strokeGeometry(geometry, strokeStyle, lineWidth) {
        const cachedPath = createCachedPath2D(geometry, "stroke");
        if (cachedPath) {
          context.strokeStyle = strokeStyle;
          context.lineWidth = lineWidth;
          context.stroke(cachedPath);
          return;
        }

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

  function createAdapter(scene, context, worldData, renderState = {}) {
    if (scene.projectionKind === "dymaxion") {
      return createDymaxionAdapter(scene, context, worldData);
    }

    return createContinuousAdapter(scene, context, renderState);
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
