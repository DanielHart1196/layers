import {
  AVAILABLE_TOPOBATHY_MONTHS,
  EARTH_TEXTURE_FALLBACKS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  equator,
  getSceneBounds,
  graticule,
} from "./atlas-core.js";
import { createFlatMapRenderer } from "./atlas-earth.js";
import { createAdapter } from "./atlas-adapters.js";
import { getEmpireSublayerIds } from "./layers-registry.js";

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

      if (AVAILABLE_TOPOBATHY_MONTHS.has(month)) {
        candidates.push(`./assets/earth/derived/world.topo.bathy.2004${month}.3x5400x2700.jpg`);
      }

      return [...candidates, ...EARTH_TEXTURE_FALLBACKS];
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
    const vectorAreaCache = new Map();
    const vectorAreaScratchCanvas = document.createElement("canvas");
    const vectorAreaScratchContext = vectorAreaScratchCanvas.getContext("2d");
    const flatMapRenderer = createFlatMapRenderer?.() ?? null;
    const tissotGeometry = {
      type: "FeatureCollection",
      features: (() => {
        const features = [];
        const circle = d3.geoCircle().radius(4).precision(3);
        const baseLatitudeStep = 15;
        const baseLongitudeSpacing = 15;

        function addCircle(longitude, latitude) {
          features.push({
            type: "Feature",
            geometry: circle.center([longitude, latitude])(),
            properties: { longitude, latitude },
          });
        }

        addCircle(0, -90);

        for (let latitude = -75; latitude <= 75; latitude += 15) {
          const latitudeRadians = (Math.abs(latitude) * Math.PI) / 180;
          const cosineScale = Math.max(Math.cos(latitudeRadians), 0.1);
          const rawLongitudeStep = baseLongitudeSpacing / cosineScale;
          const longitudeStep = Math.min(
            180,
            Math.max(baseLongitudeSpacing, Math.round(rawLongitudeStep / baseLatitudeStep) * baseLatitudeStep),
          );

          for (let longitude = -180; longitude < 180; longitude += longitudeStep) {
            addCircle(longitude, latitude);
          }
        }

        addCircle(0, 90);

        return features;
      })(),
    };

    function withOpacity(hexColor, opacity) {
      const normalized = String(hexColor ?? "").trim();
      const alpha = Math.max(0, Math.min(1, Number.isFinite(opacity) ? opacity : 1));
      const match = /^#?([0-9a-f]{6})$/i.exec(normalized);
      if (!match) {
        return hexColor;
      }
      const value = match[1];
      const red = Number.parseInt(value.slice(0, 2), 16);
      const green = Number.parseInt(value.slice(2, 4), 16);
      const blue = Number.parseInt(value.slice(4, 6), 16);
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

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

    function createSceneAdapter(scene, contextOverride = overlayContext) {
      return createAdapter(scene, contextOverride, worldDataRef(), {
        isInteracting: Boolean(layerStateRef?.().isInteracting),
      });
    }

    function buildVectorAreaCacheKey(layerKey, scene, options = {}) {
      return JSON.stringify({
        layerKey,
        projectionKind: scene.projectionKind,
        center: scene.center,
        width: scene.width,
        height: scene.height,
        radius: scene.radius,
        projectionScale: scene.projectionScale,
        zoomScale: scene.zoomScale,
        rotate: scene.rotate,
        panOffset: scene.panOffset,
        options,
      });
    }

    function setVectorAreaCacheEntry(cacheKey, canvas) {
      if (!cacheKey) {
        return;
      }

      if (!vectorAreaCache.has(cacheKey) && vectorAreaCache.size >= 24) {
        vectorAreaCache.clear();
      }

      vectorAreaCache.set(cacheKey, canvas);
    }

    function renderPreparedVectorAreaLayer(scene, {
      layerKey,
      cacheOptions = {},
      internalScale = 1,
      renderToContext,
    }) {
      const bounds = getSceneBounds(scene);
      const width = Math.max(1, Math.round(bounds.width * internalScale));
      const height = Math.max(1, Math.round(bounds.height * internalScale));
      const cacheKey = internalScale >= 0.999
        ? buildVectorAreaCacheKey(layerKey, scene, cacheOptions)
        : null;

      if (cacheKey && vectorAreaCache.has(cacheKey)) {
        return {
          canvas: vectorAreaCache.get(cacheKey),
          bounds,
        };
      }

      const canvas = cacheKey ? document.createElement("canvas") : vectorAreaScratchCanvas;
      const context = cacheKey
        ? canvas.getContext("2d")
        : vectorAreaScratchContext;

      if (!context) {
        return null;
      }

      canvas.width = width;
      canvas.height = height;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, width, height);
      context.setTransform(
        internalScale,
        0,
        0,
        internalScale,
        -bounds.left * internalScale,
        -bounds.top * internalScale,
      );

      renderToContext(context);

      if (cacheKey) {
        setVectorAreaCacheEntry(cacheKey, canvas);
      }

      return { canvas, bounds };
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
        scene.zoomScale ?? 1,
        scene.panOffset?.x ?? 0,
        scene.panOffset?.y ?? 0,
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

      const bounds = getSceneBounds(scene);
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
          scene.width ?? VIEW_WIDTH,
          scene.height ?? VIEW_HEIGHT,
        );
        overlayContext.restore();
        return true;
      }

      const bounds = getSceneBounds(scene);
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
      const bounds = getSceneBounds(scene);

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
      const earthStyle = layerStateRef().earthStyle ?? {};
      const waterColor = earthStyle.water?.color ?? "#2f7398";
      const landColor = earthStyle.land?.color ?? "#98b977";

      if (layerStateRef().earth && earthTextureRef() && rasterSupportedRef()) {
        return;
      }

      const bounds = getSceneBounds(scene);
      overlayContext.fillStyle = waterColor;
      overlayContext.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);

      if (layerStateRef().earth && renderProjectedRaster(scene, adapter, earthTextureRef())) {
        return;
      }

      if (!adapter.isReady || !adapter.canRenderLayer("land")) {
        renderProjectionUnavailable(scene);
        return;
      }

      const landGeometry = adapter.resolveGeometry("land", getLayerGeometry("land", scene, worldDataRef().land));
      adapter.fillGeometry(landGeometry, landColor, adapter.kind === "interrupted" ? "evenodd" : "nonzero");
    }

    function renderGraticuleLayer(scene) {
      if (!layerStateRef().graticule) {
        return;
      }

      const adapter = createSceneAdapter(scene);

      if (!adapter.isReady || !adapter.canRenderLayer("graticule")) {
        return;
      }

      const graticuleStyle = layerStateRef().graticuleStyle ?? {};
      const graticuleColor = graticuleStyle.color ?? "#ffffff";
      const graticuleOpacity = Number.isFinite(graticuleStyle.opacity) ? graticuleStyle.opacity : 0.12;
      const graticuleWidth = Number.isFinite(graticuleStyle.width) ? graticuleStyle.width : 0.7;
      const graticuleStroke = withOpacity(graticuleColor, graticuleOpacity);
      const equatorStroke = withOpacity(graticuleColor, Math.min(graticuleOpacity * 2, 1));

      adapter.strokeGeometry(graticule, graticuleStroke, graticuleWidth, {
        maxStepDegrees: 1,
      });

      adapter.strokeGeometry(equator, equatorStroke, Math.max(graticuleWidth * 1.65, graticuleWidth + 0.3), {
        maxStepDegrees: 1,
      });
    }

    function renderTissotLayer(scene) {
      if (!layerStateRef().tissot) {
        return;
      }

      const adapter = createSceneAdapter(scene);

      if (!adapter.isReady || !adapter.canRenderLayer("graticule")) {
        return;
      }

      adapter.fillGeometry(tissotGeometry, "rgba(196, 59, 47, 0.12)", "nonzero");
      adapter.strokeGeometry(tissotGeometry, "rgba(196, 59, 47, 0.72)", 0.9, {
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
      const borderStyle = layerStateRef().borderStyle ?? {};
      const borderColor = borderStyle.color ?? "#ffffff";
      const borderOpacity = Number.isFinite(borderStyle.opacity) ? borderStyle.opacity : 0.36;
      const borderWidth = Number.isFinite(borderStyle.width) ? borderStyle.width : 0.8;
      const borderStroke = borderColor.startsWith("#")
        ? `${borderColor}${Math.round(borderOpacity * 255).toString(16).padStart(2, "0")}`
        : borderColor;
      adapter.strokeGeometry(bordersGeometry, borderStroke, borderWidth, {
        maxStepDegrees: adapter.kind === "interrupted" ? 0.75 : 1,
      });
    }

    function renderEmpiresLayer(scene, options = {}) {
      if (!layerStateRef().empires) {
        return;
      }

      const isInteracting = Boolean(layerStateRef().isInteracting);
      const selectedEmpireQuality = options.empireQuality
        ?? layerStateRef().empireQuality?.roman
        ?? "medium";
      const layerStyles = layerStateRef().layerStyles ?? {};
      const empireGeometries = getEmpireSublayerIds()
        .filter((empireKey) => Boolean(layerStateRef()?.[empireKey]))
        .map((empireKey) => ({
          empireKey,
          geometry: worldDataRef()?.layerSources?.empires?.[empireKey]?.[selectedEmpireQuality]
            ?? worldDataRef()?.layerSources?.empires?.[empireKey]?.high
            ?? worldDataRef()?.layerSources?.empires?.[empireKey]?.canonical,
          style: layerStyles[empireKey] ?? null,
        }))
        .filter(({ geometry }) => Boolean(geometry));
      if (!empireGeometries.length) {
        return;
      }

      const internalScale = isInteracting ? 0.6 : 1;
      const preparedLayer = renderPreparedVectorAreaLayer(scene, {
        layerKey: "vector-area:empires",
        internalScale,
        cacheOptions: {
          empireQuality: selectedEmpireQuality,
          empireSublayers: empireGeometries.map(({ empireKey }) => empireKey),
          layerStyles,
          interacting: isInteracting,
        },
        renderToContext: (context) => {
          const adapter = createSceneAdapter(scene, context);
          if (!adapter.isReady || !adapter.canRenderLayer("land")) {
            return;
          }

          const areaFillOptions = isInteracting
            ? {
                maxStepDegrees: adapter.kind === "interrupted" ? 1.25 : 1.4,
                minimumStepDegrees: adapter.kind === "interrupted" ? 0.12 : 0.14,
              }
            : {};
          const areaStrokeOptions = isInteracting
            ? {
                maxStepDegrees: adapter.kind === "interrupted" ? 1.4 : 1.6,
                minimumStepDegrees: adapter.kind === "interrupted" ? 0.14 : 0.16,
              }
            : {
                maxStepDegrees: adapter.kind === "interrupted" ? 0.75 : 1,
              };

          empireGeometries.forEach(({ geometry, style }) => {
            const fillColor = style?.fillColor ?? "#C48B35";
            const fillOpacity = Number.isFinite(style?.fillOpacity) ? style.fillOpacity : 0.22;
            const strokeColor = style?.strokeColor ?? "#B07825";
            const strokeOpacity = Number.isFinite(style?.strokeOpacity) ? style.strokeOpacity : 0.9;
            const strokeWidth = Number.isFinite(style?.strokeWidth) ? style.strokeWidth : 1.1;
            const fillHex = fillColor.replace('#', '');
            const strokeHex = strokeColor.replace('#', '');
            const fillR = Number.parseInt(fillHex.slice(0, 2), 16);
            const fillG = Number.parseInt(fillHex.slice(2, 4), 16);
            const fillB = Number.parseInt(fillHex.slice(4, 6), 16);
            const strokeR = Number.parseInt(strokeHex.slice(0, 2), 16);
            const strokeG = Number.parseInt(strokeHex.slice(2, 4), 16);
            const strokeB = Number.parseInt(strokeHex.slice(4, 6), 16);

            adapter.fillGeometry(geometry, `rgba(${fillR}, ${fillG}, ${fillB}, ${fillOpacity})`, "evenodd", areaFillOptions);
            adapter.strokeGeometry(geometry, `rgba(${strokeR}, ${strokeG}, ${strokeB}, ${strokeOpacity})`, strokeWidth, areaStrokeOptions);
          });
        },
      });

      if (!preparedLayer) {
        return;
      }

      const targetContext = options.contextOverride ?? overlayContext;
      targetContext.save();
      targetContext.imageSmoothingEnabled = true;
      targetContext.imageSmoothingQuality = isInteracting ? "medium" : "high";
      targetContext.drawImage(
        preparedLayer.canvas,
        preparedLayer.bounds.left,
        preparedLayer.bounds.top,
        preparedLayer.bounds.width,
        preparedLayer.bounds.height,
      );
      targetContext.restore();
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
      renderers: [
        renderFallbackLayer,
        renderEmpiresLayer,
        renderGraticuleLayer,
        renderTissotLayer,
        renderBordersLayer,
        renderProjectionFrame,
      ],
      bordersRenderer: renderBordersLayer,
      graticuleRenderer: renderGraticuleLayer,
      empireRenderer: renderEmpiresLayer,
    };
  }

const AtlasLayers = {
  createEarthTextureStore,
  createOverlayLayerRenderers,
};

export {
  createEarthTextureStore,
  createOverlayLayerRenderers,
};

export default AtlasLayers;

window.AtlasLayers = AtlasLayers;
