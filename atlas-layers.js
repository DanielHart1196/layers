(() => {
  function createEarthTextureStore() {
    const textureCache = new Map();
    let textureLoadToken = 0;

    async function loadTexture(url) {
      const image = new Image();
      image.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });

      return {
        url,
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
    }

    async function loadFirstAvailableTexture(candidates) {
      let lastError;

      for (const candidate of candidates) {
        try {
          return await loadTexture(candidate);
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError ?? new Error("No Earth texture candidates could be loaded.");
    }

    function getCandidatesForMonth(month) {
      const candidates = [];

      if (window.AtlasCore.AVAILABLE_TOPOBATHY_MONTHS.has(month)) {
        candidates.push(`./assets/earth/derived/world.topo.bathy.2004${month}.3x5400x2700.jpg`);
      }

      return [...candidates, ...window.AtlasCore.EARTH_TEXTURE_FALLBACKS];
    }

    async function loadForMonth(month) {
      if (!textureCache.has(month)) {
        textureCache.set(month, loadFirstAvailableTexture(getCandidatesForMonth(month)));
      }

      try {
        return await textureCache.get(month);
      } catch (error) {
        textureCache.delete(month);
        throw error;
      }
    }

    async function refresh(month) {
      const token = ++textureLoadToken;
      const texture = await loadForMonth(month);

      if (token !== textureLoadToken) {
        return null;
      }

      return texture;
    }

    return {
      refresh,
    };
  }

  function createOverlayLayerRenderers({
    overlayContext,
    worldDataRef,
    manifestRef,
    layerStateRef,
    earthTextureRef,
    pixelRatioRef,
    rasterSupportedRef,
    requestRenderRef,
  }) {
    const sourceImageCache = new WeakMap();
    const rasterCache = new Map();
    const rasterBuildState = new Set();
    const flatRasterPrewarmState = new Set();
    const flatMapRenderer = window.AtlasEarth?.createFlatMapRenderer?.() ?? null;

    function getSelectedLodKey(layerKey, scene) {
      const manifest = manifestRef?.();
      const manifestLayer = manifest?.layers?.[layerKey];
      const lodEntries = manifestLayer?.lods
        ? Object.entries(manifestLayer.lods)
        : [];

      if (!lodEntries.length) {
        return null;
      }

      const zoomScale = scene?.zoomScale ?? 1;
      const eligibleEntries = lodEntries
        .filter(([, lodConfig]) => zoomScale >= (lodConfig?.minZoom ?? 1))
        .sort((left, right) => (right[1]?.minZoom ?? 1) - (left[1]?.minZoom ?? 1));

      if (eligibleEntries.length) {
        return eligibleEntries[0][0];
      }

      const sortedEntries = lodEntries.sort((left, right) => (left[1]?.minZoom ?? 1) - (right[1]?.minZoom ?? 1));
      return sortedEntries[0][0];
    }

    function getLayerGeometry(layerKey, scene, fallbackGeometry) {
      const worldData = worldDataRef();
      const layerSources = worldData?.layerSources?.[layerKey];
      const selectedLod = getSelectedLodKey(layerKey, scene);

      if (selectedLod && layerSources?.[selectedLod]) {
        return layerSources[selectedLod];
      }

      if (layerSources) {
        const firstAvailable = Object.values(layerSources).find(Boolean);
        if (firstAvailable) {
          return firstAvailable;
        }
      }

      return fallbackGeometry;
    }

    function createSceneAdapter(scene) {
      return window.AtlasAdapters.createAdapter(scene, overlayContext, worldDataRef(), {
        isInteracting: Boolean(layerStateRef?.().isInteracting),
      });
    }

    function getSourcePixels(image) {
      if (sourceImageCache.has(image)) {
        return sourceImageCache.get(image);
      }

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0);

      const source = {
        width: canvas.width,
        height: canvas.height,
        pixels: context.getImageData(0, 0, canvas.width, canvas.height).data,
      };
      sourceImageCache.set(image, source);
      return source;
    }

    function sampleEquirectangular(source, longitude, latitude) {
      const x = ((longitude + 180) / 360) * (source.width - 1);
      const y = ((90 - latitude) / 180) * (source.height - 1);
      const sampleX = Math.max(0, Math.min(source.width - 1, Math.round(x)));
      const sampleY = Math.max(0, Math.min(source.height - 1, Math.round(y)));
      const offset = (sampleY * source.width + sampleX) * 4;

      return [
        source.pixels[offset],
        source.pixels[offset + 1],
        source.pixels[offset + 2],
        source.pixels[offset + 3],
      ];
    }

    function buildRasterCacheKey(scene, image, internalScale = 1) {
      return [
        scene.projectionKind,
        image.currentSrc || image.src || "texture",
        scene.center[0],
        scene.center[1],
        scene.width ?? scene.radius ?? 0,
        scene.height ?? scene.radius ?? 0,
        internalScale,
      ].join("|");
    }

    function getRasterProjectionProfile(scene) {
      if (scene.projectionKind === "waterman") {
        return {
          previewScale: 1,
          finalScale: 1,
        };
      }

      return {
        previewScale: 1,
        finalScale: 1,
      };
    }

    function createProjectedRasterCanvas(scene, adapter, image, internalScale = 1) {
      const cacheKey = buildRasterCacheKey(scene, image, internalScale);
      if (rasterCache.has(cacheKey)) {
        return rasterCache.get(cacheKey);
      }

      const bounds = window.AtlasCore.getSceneBounds(scene);
      const width = Math.max(1, Math.round(bounds.width * internalScale));
      const height = Math.max(1, Math.round(bounds.height * internalScale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const imageData = context.createImageData(width, height);
      const destination = imageData.data;
      const source = getSourcePixels(image);

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const worldPoint = adapter.invertPoint([
            bounds.left + (x + 0.5) / internalScale,
            bounds.top + (y + 0.5) / internalScale,
          ]);
          const offset = (y * width + x) * 4;

          if (!worldPoint || !Number.isFinite(worldPoint[0]) || !Number.isFinite(worldPoint[1])) {
            destination[offset + 3] = 0;
            continue;
          }

          const [red, green, blue, alpha] = sampleEquirectangular(source, worldPoint[0], worldPoint[1]);
          destination[offset] = red;
          destination[offset + 1] = green;
          destination[offset + 2] = blue;
          destination[offset + 3] = alpha;
        }
      }

      context.putImageData(imageData, 0, 0);
      rasterCache.set(cacheKey, canvas);
      return canvas;
    }

    function scheduleRasterBuild(scene, adapter, image, internalScale) {
      const cacheKey = buildRasterCacheKey(scene, image, internalScale);
      if (rasterCache.has(cacheKey) || rasterBuildState.has(cacheKey)) {
        return;
      }

      rasterBuildState.add(cacheKey);
      const schedule = typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback.bind(window)
        : (callback) => window.setTimeout(callback, 0);

      schedule(() => {
        createProjectedRasterCanvas(scene, adapter, image, internalScale);
        rasterBuildState.delete(cacheKey);
        requestRenderRef?.();
      });
    }

    function buildFlatRasterCacheKey(scene, image, pixelRatio) {
      return [
        scene.projectionKind,
        image.currentSrc || image.src || "texture",
        scene.center[0],
        scene.center[1],
        scene.width ?? scene.radius ?? 0,
        scene.height ?? scene.radius ?? 0,
        pixelRatio,
      ].join("|");
    }

    function scheduleFlatRasterPrewarm(scene, image, pixelRatio) {
      if (!flatMapRenderer || !image) {
        return;
      }

      const cacheKey = buildFlatRasterCacheKey(scene, image, pixelRatio);
      if (flatRasterPrewarmState.has(cacheKey) || flatMapRenderer.hasMesh(scene, pixelRatio)) {
        return;
      }

      flatRasterPrewarmState.add(cacheKey);
      const schedule = typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback.bind(window)
        : (callback) => window.setTimeout(callback, 0);

      schedule(() => {
        flatMapRenderer.prepare({ scene, image, pixelRatio });
        flatRasterPrewarmState.delete(cacheKey);
        requestRenderRef?.();
      });
    }

    function renderProjectedRaster(scene, adapter, image) {
      if (
        !image ||
        (
          scene.projectionKind !== "natural-earth-ii" &&
          scene.projectionKind !== "goode-homolosine" &&
          scene.projectionKind !== "waterman"
        )
      ) {
        return false;
      }

      const pixelRatio = pixelRatioRef?.() ?? 1;
      if (flatMapRenderer) {
        if (!flatMapRenderer.hasMesh(scene, pixelRatio)) {
          scheduleFlatRasterPrewarm(scene, image, pixelRatio);
        }
      }

      const flatRasterCanvas = flatMapRenderer?.render({
        scene,
        image,
        pixelRatio,
        allowSyncBuild: scene.projectionKind === "waterman",
      });

      if (flatRasterCanvas) {
        overlayContext.save();
        overlayContext.imageSmoothingEnabled = true;
        overlayContext.imageSmoothingQuality = "high";
        overlayContext.drawImage(
          flatRasterCanvas,
          0,
          0,
          scene.width ?? window.AtlasCore.VIEW_WIDTH,
          scene.height ?? window.AtlasCore.VIEW_HEIGHT,
        );
        overlayContext.restore();
        return true;
      }

      const bounds = window.AtlasCore.getSceneBounds(scene);
      const profile = getRasterProjectionProfile(scene);
      const finalKey = buildRasterCacheKey(scene, image, profile.finalScale);
      let rasterCanvas;

      if (rasterCache.has(finalKey)) {
        rasterCanvas = rasterCache.get(finalKey);
      } else {
        rasterCanvas = createProjectedRasterCanvas(scene, adapter, image, profile.previewScale);
      }

      overlayContext.save();
      overlayContext.imageSmoothingEnabled = true;
      overlayContext.imageSmoothingQuality = "high";
      overlayContext.drawImage(rasterCanvas, bounds.left, bounds.top, bounds.width, bounds.height);
      overlayContext.restore();
      return true;
    }

    function renderProjectionUnavailable(scene) {
      const bounds = window.AtlasCore.getSceneBounds(scene);

      overlayContext.save();
      overlayContext.fillStyle = "rgba(10, 28, 40, 0.34)";
      overlayContext.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);

      overlayContext.fillStyle = "rgba(255, 244, 226, 0.92)";
      overlayContext.font = "600 19px Manrope, sans-serif";
      overlayContext.textAlign = "center";
      overlayContext.textBaseline = "middle";
      overlayContext.fillText("Dymaxion adapter not implemented yet", scene.center[0], scene.center[1] - 10);

      overlayContext.fillStyle = "rgba(255, 244, 226, 0.72)";
      overlayContext.font = "500 13px Manrope, sans-serif";
      overlayContext.fillText("Continuous projections remain fully supported", scene.center[0], scene.center[1] + 16);
      overlayContext.restore();
    }

    function renderFallbackLayer(scene) {
      const adapter = createSceneAdapter(scene);

      if (layerStateRef().earth && earthTextureRef() && rasterSupportedRef()) {
        return;
      }

      const bounds = window.AtlasCore.getSceneBounds(scene);
      overlayContext.fillStyle = "#2f7398";
      overlayContext.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);

      if (layerStateRef().earth && renderProjectedRaster(scene, adapter, earthTextureRef())) {
        return;
      }

      if (!adapter.isReady || !adapter.canRenderLayer("land")) {
        renderProjectionUnavailable(scene);
        return;
      }

      const landGeometry = adapter.resolveGeometry("land", getLayerGeometry("land", scene, worldDataRef().land));
      adapter.fillGeometry(landGeometry, "#98b977", adapter.kind === "interrupted" ? "evenodd" : "nonzero");
    }

    function renderGraticuleLayer(scene) {
      if (!layerStateRef().graticule) {
        return;
      }

      const adapter = createSceneAdapter(scene);

      if (!adapter.isReady || !adapter.canRenderLayer("graticule")) {
        return;
      }

      adapter.strokeGeometry(window.AtlasCore.graticule, "rgba(255, 255, 255, 0.12)", 0.7, {
        maxStepDegrees: 1,
      });

      adapter.strokeGeometry(window.AtlasCore.equator, "rgba(255, 255, 255, 0.24)", 1.15, {
        maxStepDegrees: 1,
      });
    }

    function renderBordersLayer(scene) {
      if (!layerStateRef().borders) {
        return;
      }

      const adapter = createSceneAdapter(scene);

      if (!adapter.isReady || !adapter.canRenderLayer("borders")) {
        return;
      }

      const bordersGeometry = adapter.resolveGeometry("borders", getLayerGeometry("borders", scene, worldDataRef().borders));
      adapter.strokeGeometry(bordersGeometry, "rgba(255, 255, 255, 0.36)", 0.8, {
        maxStepDegrees: adapter.kind === "interrupted" ? 0.75 : 1,
      });
    }

    function renderEmpiresLayer(scene) {
      if (!layerStateRef().empires) {
        return;
      }

      const adapter = createSceneAdapter(scene);
      const empireLayerState = layerStateRef().empireSublayers ?? {};
      const empireGeometries = Object.entries(empireLayerState)
        .filter(([, isEnabled]) => isEnabled)
        .map(([empireKey]) => worldDataRef()?.layerSources?.empires?.[empireKey])
        .filter(Boolean);
      if (!adapter.isReady || !adapter.canRenderLayer("land") || !empireGeometries.length) {
        return;
      }

      empireGeometries.forEach((empiresGeometry) => {
        adapter.fillGeometry(empiresGeometry, "rgba(196, 139, 53, 0.22)", adapter.kind === "interrupted" ? "evenodd" : "nonzero");
        adapter.strokeGeometry(empiresGeometry, "rgba(176, 120, 37, 0.9)", 1.1, {
          maxStepDegrees: adapter.kind === "interrupted" ? 0.75 : 1,
        });
      });
    }

    function renderProjectionFrame(scene) {
      if (
        scene.projectionKind !== "natural-earth-ii" &&
        scene.projectionKind !== "goode-homolosine" &&
        scene.projectionKind !== "waterman"
      ) {
        return;
      }

      const adapter = createSceneAdapter(scene);

      if (!adapter.isReady) {
        return;
      }

      adapter.strokeGeometry({ type: "Sphere" }, "rgba(8, 27, 38, 0.85)", 2);
    }

    return {
      prewarmProjectedRaster(scene) {
        const image = earthTextureRef();
        if (!image || !scene) {
          return;
        }

        scheduleFlatRasterPrewarm(scene, image, pixelRatioRef?.() ?? 1);
      },
      renderers: [renderFallbackLayer, renderEmpiresLayer, renderGraticuleLayer, renderBordersLayer, renderProjectionFrame],
    };
  }

  window.AtlasLayers = {
    createEarthTextureStore,
    createOverlayLayerRenderers,
  };
})();
