const stage = document.getElementById("atlasStage");
const earthCanvas = document.getElementById("atlasEarthCanvas");
const overlayCanvas = document.getElementById("atlasOverlayCanvas");
const overlayContext = overlayCanvas.getContext("2d");
const overlaySvg = document.querySelector(".atlas-overlay");
const layerPanel = document.querySelector(".layer-panel");
const layerButtons = Array.from(document.querySelectorAll(".layer-item"));
const projectionSelect = document.getElementById("projectionSelect");
const monthSlider = document.getElementById("monthSlider");
const monthButtons = Array.from(document.querySelectorAll(".month-chip"));
const atlasFrameElements = Array.from(document.querySelectorAll("[data-frame^='atlas-']"));
const singleGlobeFrameElement = document.querySelector("[data-frame='single-globe']");
const {
  VIEW_HEIGHT,
  VIEW_WIDTH,
  atlasSceneDefinitions,
  clamp,
  dragSensitivity,
  getDefaultMonth,
  lightDirection,
} = window.AtlasCore;

let worldData;
let earthTextureImage = null;
let glRenderer = null;
let rotationOffset = { lambda: 0, phi: 0 };
let pixelRatio = 1;
let renderScheduled = false;
const earthTextureStore = window.AtlasLayers.createEarthTextureStore();

const layerState = {
  earth: true,
  borders: true,
  graticule: true,
};

const temporalState = {
  selectedMonth: getDefaultMonth(),
};

const projectionState = {
  selectedProjection: "azimuthal-equidistant",
};
const SUPPORTED_PROJECTIONS = new Set([
  "orthographic",
  "azimuthal-equidistant",
  "mercator",
  "natural-earth-ii",
  "goode-homolosine",
  "waterman",
  "dymaxion",
]);
let overlayLayerRenderers = [];

function projectionSupportsRaster() {
  return window.AtlasAdapters.projectionSupportsRaster(projectionState.selectedProjection);
}

function normalizeProjectionSelection(projectionKind) {
  return SUPPORTED_PROJECTIONS.has(projectionKind) ? projectionKind : "orthographic";
}

function releaseLayerPanelFocusAfterPointerInteraction(target) {
  if (!target || !layerPanel?.contains(target)) {
    return;
  }

  requestAnimationFrame(() => {
    if (document.activeElement instanceof HTMLElement && layerPanel.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  });
}

async function init() {
  syncStageChrome();
  configureCanvases();
  glRenderer = window.AtlasEarth.createGlobeRenderer(earthCanvas);
  worldData = await loadWorld();
  const overlayLayerManager = window.AtlasLayers.createOverlayLayerRenderers({
    overlayContext,
    worldDataRef: () => worldData,
    layerStateRef: () => layerState,
    earthTextureRef: () => earthTextureImage,
    pixelRatioRef: () => pixelRatio,
    rasterSupportedRef: () => projectionSupportsRaster(),
    requestRenderRef: () => requestRender(),
  });
  overlayLayerRenderers = overlayLayerManager.renderers;
  await refreshEarthTexture();
  drawAtlas();
  enableDragging();
  enableLayerControls();
  enableProjectionControls();
  enableTemporalControls();
  window.addEventListener("resize", handleResize);
}

function syncStageChrome() {
  const currentProjection = projectionState.selectedProjection;
  const currentView = window.AtlasCore.getViewDimensions(currentProjection);
  const atlasScenes = atlasSceneDefinitions;
  const atlasMaskSvg = encodeMaskSvg(atlasScenes, VIEW_WIDTH, VIEW_HEIGHT);
  const singleGlobeScene = window.AtlasCore.createOrthographicSceneDefinition(
    window.AtlasCore.getViewDimensions("orthographic"),
  );
  const singleGlobeMaskSvg = encodeMaskSvg([singleGlobeScene], currentView.width, currentView.height);

  stage.style.setProperty("--atlas-mask-image", `url("${atlasMaskSvg}")`);
  stage.style.setProperty("--single-globe-mask-image", `url("${singleGlobeMaskSvg}")`);
  if (overlaySvg) {
    const viewWidth = currentProjection === "orthographic" ? currentView.width : VIEW_WIDTH;
    const viewHeight = currentProjection === "orthographic" ? currentView.height : VIEW_HEIGHT;
    overlaySvg.setAttribute("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
  }

  atlasScenes.forEach((scene, index) => {
    const frame = atlasFrameElements[index];
    if (!frame || !scene.radius) {
      return;
    }

    frame.setAttribute("cx", String(scene.center[0]));
    frame.setAttribute("cy", String(scene.center[1]));
    frame.setAttribute("r", String(scene.radius));
  });

  if (singleGlobeFrameElement) {
    const globeScene = singleGlobeScene;
    singleGlobeFrameElement.setAttribute("cx", String(globeScene.center[0]));
    singleGlobeFrameElement.setAttribute("cy", String(globeScene.center[1]));
    singleGlobeFrameElement.setAttribute("r", String(globeScene.radius));
  }
}

function encodeMaskSvg(scenes, viewWidth, viewHeight) {
  const shapes = scenes.map((scene) => {
    if (scene.radius) {
      return `<circle cx='${scene.center[0]}' cy='${scene.center[1]}' r='${scene.radius}' fill='white'/>`;
    }

    return `<rect x='${scene.center[0] - scene.width / 2}' y='${scene.center[1] - scene.height / 2}' width='${scene.width}' height='${scene.height}' fill='white'/>`;
  }).join("");

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${viewWidth} ${viewHeight}'><rect width='${viewWidth}' height='${viewHeight}' fill='black'/>${shapes}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

async function loadWorld() {
  const topology = await d3.json(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
  );

  return {
    topology,
    countries: topojson.feature(topology, topology.objects.countries),
    land: topojson.merge(topology, topology.objects.countries.geometries),
    borders: topojson.mesh(topology, topology.objects.countries, (left, right) => left !== right),
  };
}

async function refreshEarthTexture() {
  const activeMonth = getActiveMonth();

  try {
    const texture = await earthTextureStore.refresh(activeMonth);
    if (!texture) {
      return;
    }

    earthTextureImage = texture.image;
    glRenderer?.setTexture(earthTextureImage);
  } catch (error) {
    console.error("Failed to load Earth texture.", error);
    earthTextureImage = null;
    glRenderer?.setTexture(null);
  }

  drawAtlas();
}

function getActiveMonth() {
  return temporalState.selectedMonth;
}

function drawAtlas() {
  const scenes = getResolvedScenes();
  const isMercator = projectionState.selectedProjection === "mercator";
  const isViewportStage =
    projectionState.selectedProjection === "mercator" ||
    projectionState.selectedProjection === "orthographic" ||
    projectionState.selectedProjection === "natural-earth-ii" ||
    projectionState.selectedProjection === "goode-homolosine" ||
    projectionState.selectedProjection === "waterman";
  const isFlatProjection =
    isMercator ||
    projectionState.selectedProjection === "natural-earth-ii" ||
    projectionState.selectedProjection === "goode-homolosine" ||
    projectionState.selectedProjection === "waterman" ||
    projectionState.selectedProjection === "dymaxion";
  document.body.classList.toggle("is-viewport-stage", isViewportStage);
  stage.classList.toggle("is-single-globe", projectionState.selectedProjection === "orthographic");
  stage.classList.toggle("is-viewport-stage", isViewportStage);
  stage.classList.toggle("is-flat-projection", isFlatProjection);
  stage.classList.toggle("is-mercator", isMercator);
  stage.classList.toggle("is-natural-earth-ii", projectionState.selectedProjection === "natural-earth-ii");
  stage.classList.toggle("is-goode-homolosine", projectionState.selectedProjection === "goode-homolosine");
  stage.classList.toggle("is-waterman", projectionState.selectedProjection === "waterman");
  stage.classList.toggle("is-dymaxion", projectionState.selectedProjection === "dymaxion");
  drawEarthPass(scenes);
  drawOverlayPass(scenes);
}

function getResolvedScenes() {
  return window.AtlasCore.getResolvedScenes(atlasSceneDefinitions, projectionState, rotationOffset);
}

function drawEarthPass(scenes) {
  if (!glRenderer) {
    return;
  }

  if (!layerState.earth || !earthTextureImage || !projectionSupportsRaster()) {
    glRenderer.clear();
    return;
  }

  glRenderer.render({
    scenes,
    pixelRatio,
    lightDirection,
  });
}

function drawOverlayPass(scenes) {
  const viewDimensions = window.AtlasCore.getViewDimensions(projectionState.selectedProjection);
  overlayContext.clearRect(0, 0, viewDimensions.width, viewDimensions.height);

  scenes.forEach((scene) => {
    withSceneClip(scene, () => {
      overlayLayerRenderers.forEach((renderer) => renderer(scene));
    });
  });
}

function withSceneClip(scene, renderFn) {
  overlayContext.save();
  window.AtlasCore.traceSceneShape(overlayContext, scene);
  overlayContext.clip();
  renderFn();
  overlayContext.restore();
}

function enableDragging() {
  d3.select(stage).call(
    d3
      .drag()
      .on("drag", (event) => {
        if (
          projectionState.selectedProjection === "dymaxion" ||
          projectionState.selectedProjection === "goode-homolosine" ||
          projectionState.selectedProjection === "waterman"
        ) {
          return;
        }

        rotationOffset.lambda += event.dx * dragSensitivity;
        rotationOffset.phi -= event.dy * dragSensitivity;
        rotationOffset.phi = clamp(
          rotationOffset.phi,
          projectionState.selectedProjection === "orthographic" ? -89.999 : -28,
          projectionState.selectedProjection === "orthographic" ? 89.999 : 28,
        );
        requestRender();
      }),
  );
}

function enableLayerControls() {
  layerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const layerId = button.dataset.layerId;

      if (!layerId || !(layerId in layerState)) {
        return;
      }

      layerState[layerId] = !layerState[layerId];
      button.classList.toggle("is-active", layerState[layerId]);
      button.closest(".layer-group")?.classList.toggle("is-active", layerState[layerId]);
      drawAtlas();
      releaseLayerPanelFocusAfterPointerInteraction(button);
    });
  });
}

function enableProjectionControls() {
  if (!projectionSelect) {
    return;
  }

  projectionState.selectedProjection = normalizeProjectionSelection(projectionState.selectedProjection);
  projectionSelect.value = projectionState.selectedProjection;
  projectionSelect.addEventListener("change", () => {
    projectionState.selectedProjection = normalizeProjectionSelection(projectionSelect.value);
    projectionSelect.value = projectionState.selectedProjection;
    releaseLayerPanelFocusAfterPointerInteraction(projectionSelect);
    handleResize();
  });
}

function enableTemporalControls() {
  syncMonthButtons();

  monthButtons.forEach((button) => {
    const month = button.dataset.month;
    if (!month) {
      return;
    }

    button.addEventListener("click", async () => {
      temporalState.selectedMonth = month;
      syncMonthButtons();
      await refreshEarthTexture();
    });
  });
}

function syncMonthButtons() {
  monthButtons.forEach((button) => {
    const month = button.dataset.month;
    const isSelected = month === temporalState.selectedMonth;

    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
    button.setAttribute("title", isSelected ? `Month ${month} active` : `Select month ${month}`);
  });
}

function requestRender() {
  if (renderScheduled) {
    return;
  }

  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    drawAtlas();
  });
}

function configureCanvases() {
  const viewDimensions = window.AtlasCore.getViewDimensions(projectionState.selectedProjection);
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  earthCanvas.width = Math.round(viewDimensions.width * pixelRatio);
  earthCanvas.height = Math.round(viewDimensions.height * pixelRatio);
  overlayCanvas.width = Math.round(viewDimensions.width * pixelRatio);
  overlayCanvas.height = Math.round(viewDimensions.height * pixelRatio);

  overlayContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function handleResize() {
  syncStageChrome();
  configureCanvases();
  glRenderer?.resize();
  if (earthTextureImage) {
    glRenderer?.setTexture(earthTextureImage);
  }
  drawAtlas();
}

init().catch((error) => {
  console.error("Failed to initialize atlas map.", error);
});
