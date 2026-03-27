const stage = document.getElementById("atlasStage");
const earthCanvas = document.getElementById("atlasEarthCanvas");
const overlayCanvas = document.getElementById("atlasOverlayCanvas");
const overlayContext = overlayCanvas.getContext("2d");
const overlaySvg = document.querySelector(".atlas-overlay");
const layerPanel = document.querySelector(".layer-panel");
const layerPanelScroll = document.querySelector(".layer-panel-scroll");
const layerMenuToggle = document.getElementById("layerMenuToggle");
const layerPanelClose = document.getElementById("layerPanelClose");
const layerPanelScrollbar = document.getElementById("layerPanelScrollbar");
const layerPanelScrollbarThumb = document.getElementById("layerPanelScrollbarThumb");
const empireLayerGroup = document.getElementById("empireLayerGroup");
const empireGroupToggle = document.getElementById("empireGroupToggle");
const mobileRefresh = document.getElementById("mobileRefresh");
const mobileRefreshButton = document.getElementById("mobileRefreshButton");
const mobileRefreshMenu = document.getElementById("mobileRefreshMenu");
const hardReloadButton = document.getElementById("hardReloadButton");
const clearCacheReloadButton = document.getElementById("clearCacheReloadButton");
const projectionSwitcher = document.getElementById("projectionSwitcher");
const projectionSwitcherTrack = document.getElementById("projectionSwitcherTrack");
const layerButtons = Array.from(document.querySelectorAll(".layer-item"));
const empireLayerButtons = Array.from(document.querySelectorAll("[data-empire-layer-id]"));
const projectionSelect = document.getElementById("projectionSelect");
const monthMenuToggle = document.getElementById("monthMenuToggle");
const monthOverlay = document.querySelector(".month-overlay");
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
let assetManifest;
let earthTextureImage = null;
let glRenderer = null;
let rotationOffset = { lambda: 0, phi: 0 };
let pixelRatio = 1;
let renderScheduled = false;
const earthTextureStore = window.AtlasLayers.createEarthTextureStore();
const mobileLayerMenuMediaQuery = window.matchMedia("(max-width: 800px)");
const activeGesturePointers = new Map();
let isPinchZooming = false;
let pinchDistance = null;
let lastTapTimestamp = 0;
let lastTapPosition = null;
let doubleTapHoldState = null;
let refreshMenuPressTimer = null;
let refreshMenuLongPressTriggered = false;
let projectionSwipeStartX = null;
let projectionSwipeStartTime = 0;
let projectionSwipePointerId = null;
let projectionSwipeDeltaX = 0;
let projectionSwipeAnimating = false;
let projectionSwipeSettleTimer = null;
let interactionSettleTimer = null;
let layerScrollbarDragState = null;
let layerScrollbarFadeTimer = null;
const flatProjectionPanOffsets = {
  "natural-earth-ii": { x: 0, y: 0 },
  "goode-homolosine": { x: 0, y: 0 },
  "waterman": { x: 0, y: 0 },
};

const layerState = {
  earth: false,
  empires: false,
  borders: true,
  graticule: true,
};
const empireLayerState = {
  roman: true,
};

const temporalState = {
  selectedMonth: getDefaultMonth(),
};

const projectionState = {
  selectedProjection: "azimuthal-equidistant",
};
const zoomState = {
  scale: 1,
};
const uiState = {
  isLayerPanelOpen: false,
  isMonthOverlayOpen: false,
  isEmpireGroupOpen: false,
  isInteracting: false,
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
const PROJECTION_SEQUENCE = [
  "waterman",
  "goode-homolosine",
  "natural-earth-ii",
  "mercator",
  "orthographic",
  "azimuthal-equidistant",
];
let overlayLayerRenderers = [];

const projectionSwitcherItems = PROJECTION_SEQUENCE.map((projectionKind) => {
  const item = document.createElement("span");
  item.className = "projection-switcher-label";
  item.dataset.projection = projectionKind;
  projectionSwitcherTrack?.appendChild(item);
  return item;
});

function projectionSupportsRaster() {
  return window.AtlasAdapters.projectionSupportsRaster(projectionState.selectedProjection);
}

function normalizeProjectionSelection(projectionKind) {
  return SUPPORTED_PROJECTIONS.has(projectionKind) ? projectionKind : "orthographic";
}

function getProjectionLabel(projectionKind) {
  return projectionSelect?.querySelector(`option[value="${projectionKind}"]`)?.textContent ?? projectionKind;
}

function getAdjacentProjection(direction = 1) {
  const currentIndex = PROJECTION_SEQUENCE.indexOf(projectionState.selectedProjection);
  const nextIndex = currentIndex >= 0
    ? (currentIndex + direction + PROJECTION_SEQUENCE.length) % PROJECTION_SEQUENCE.length
    : 0;
  return PROJECTION_SEQUENCE[nextIndex];
}

function getProjectionIndex(projectionKind) {
  return PROJECTION_SEQUENCE.indexOf(projectionKind);
}

function getProjectionDistanceFromCurrent(projectionKind) {
  const total = PROJECTION_SEQUENCE.length;
  const currentIndex = getProjectionIndex(projectionState.selectedProjection);
  const projectionIndex = getProjectionIndex(projectionKind);

  if (currentIndex < 0 || projectionIndex < 0) {
    return 0;
  }

  let distance = (projectionIndex - currentIndex + total) % total;
  if (distance > total / 2) {
    distance -= total;
  }

  return distance;
}

function getProjectionSlotWidth() {
  return Math.max(164, (projectionSwitcher?.clientWidth ?? 208) + 16);
}

function renderProjectionSwitcher(offset = 0) {
  const slotWidth = getProjectionSlotWidth();

  projectionSwitcherItems.forEach((item) => {
    const projectionKind = item.dataset.projection;
    const distance = getProjectionDistanceFromCurrent(projectionKind);
    item.textContent = getProjectionLabel(projectionKind);
    item.style.setProperty("--projection-item-offset", `${offset - (distance * slotWidth)}px`);
    item.style.opacity = Math.abs(distance - (offset / slotWidth)) < 0.9 ? "1" : "0.5";
  });
}

function syncProjectionSwitcher() {
  if (!projectionSwitcherTrack) {
    return;
  }

  renderProjectionSwitcher(0);
}

function cycleProjection(direction = 1) {
  projectionState.selectedProjection = getAdjacentProjection(direction);
  if (projectionSelect) {
    projectionSelect.value = projectionState.selectedProjection;
  }
  zoomState.scale = clampZoomScale(zoomState.scale);
  syncProjectionSwitcher();
  handleResize();
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

function isWithinMonthControls(target) {
  return target instanceof Node && (monthSlider?.contains(target) || monthOverlay?.contains(target));
}

function isWithinInteractiveUi(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      [
        ".month-overlay",
        ".month-menu-toggle",
        ".layer-panel",
        ".layer-menu-toggle",
        ".mobile-refresh",
        ".projection-switcher",
        "select",
        "option",
        "label",
      ].join(", "),
    ),
  );
}

function enableMonthControlIsolation() {
  if (!monthOverlay) {
    return;
  }

  const stopEvent = (event) => {
    event.stopPropagation();
  };

  monthOverlay.addEventListener("pointerdown", stopEvent);
  monthOverlay.addEventListener("pointermove", stopEvent);
  monthOverlay.addEventListener("pointerup", stopEvent);
  monthOverlay.addEventListener("touchstart", stopEvent, { passive: true });
  monthOverlay.addEventListener("touchmove", stopEvent, { passive: true });
  monthOverlay.addEventListener("touchend", stopEvent);
  monthOverlay.addEventListener("wheel", stopEvent, { passive: true });
}

function setMonthOverlayOpen(isOpen) {
  if (!layerState.earth && isOpen) {
    return;
  }

  uiState.isMonthOverlayOpen = isOpen;
  monthOverlay?.classList.toggle("is-open", isOpen);
  monthMenuToggle?.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("is-month-overlay-open", isOpen);
}

function syncMobileMonthChrome() {
  const isMobileViewport = mobileLayerMenuMediaQuery.matches;
  const monthsEnabled = layerState.earth;
  const isZoomedOut = zoomState.scale <= 1.01;

  document.body.classList.toggle("is-earth-enabled", monthsEnabled);
  document.body.classList.toggle("is-mobile-month-docked", monthsEnabled && isMobileViewport && isZoomedOut);

  if (!monthsEnabled || (isMobileViewport && isZoomedOut)) {
    setMonthOverlayOpen(false);
  }
}

function enableMonthMenuToggle() {
  if (!monthMenuToggle || !monthOverlay) {
    return;
  }

  monthMenuToggle.addEventListener("click", () => {
    if (!mobileLayerMenuMediaQuery.matches) {
      return;
    }

    setMonthOverlayOpen(!uiState.isMonthOverlayOpen);
  });

  document.addEventListener("click", (event) => {
    if (!mobileLayerMenuMediaQuery.matches || !uiState.isMonthOverlayOpen) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (monthOverlay.contains(target) || monthMenuToggle.contains(target)) {
      return;
    }

    setMonthOverlayOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && uiState.isMonthOverlayOpen) {
      setMonthOverlayOpen(false);
    }
  });
}

async function init() {
  syncMobileMonthChrome();
  syncStageChrome();
  configureCanvases();
  glRenderer = window.AtlasEarth.createGlobeRenderer(earthCanvas);
  [assetManifest, worldData] = await Promise.all([
    d3.json("./data/manifest.json"),
    loadWorld(),
  ]);
  const overlayLayerManager = window.AtlasLayers.createOverlayLayerRenderers({
    overlayContext,
    worldDataRef: () => worldData,
    manifestRef: () => assetManifest,
    layerStateRef: () => ({
      ...layerState,
      empireSublayers: empireLayerState,
      isInteracting: uiState.isInteracting,
    }),
    earthTextureRef: () => earthTextureImage,
    pixelRatioRef: () => pixelRatio,
    rasterSupportedRef: () => projectionSupportsRaster(),
    requestRenderRef: () => requestRender(),
  });
  overlayLayerRenderers = overlayLayerManager.renderers;
  if (layerState.earth) {
    await refreshEarthTexture();
  }
  drawAtlas();
  enableDragging();
  enableZoomControls();
  enableLayerPanelToggle();
  enableLayerPanelScrollbar();
  enableRefreshControls();
  enableMonthControlIsolation();
  enableMonthMenuToggle();
  enableLayerControls();
  enableProjectionControls();
  enableProjectionSwitcher();
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
  if (currentProjection === "orthographic") {
    singleGlobeScene.radius *= zoomState.scale;
  }
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
  const [
    countriesTopology10,
    countriesTopology110,
    land110,
    empires,
  ] = await Promise.all([
    d3.json("./data/raw/world-atlas/countries-10m.json"),
    d3.json("./data/raw/world-atlas/countries-110m.json"),
    d3.json("./data/raw/world-atlas/land-110m.json"),
    d3.json("./data/empires/roman_empire_ad_117_extent.geojson"),
  ]);

  const land = topojson.feature(land110, land110.objects.land);
  const borders = topojson.mesh(
    countriesTopology110,
    countriesTopology110.objects.countries,
    (left, right) => left !== right,
  );

  return {
    topology: countriesTopology10,
    empires,
    countries: topojson.feature(countriesTopology10, countriesTopology10.objects.countries),
    land,
    borders,
    layerSources: {
      land: {
        "110m": land,
      },
      borders: {
        "110m": borders,
      },
      empires: {
        roman: empires,
      },
    },
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

function markInteractionActivity() {
  uiState.isInteracting = true;
  if (interactionSettleTimer !== null) {
    window.clearTimeout(interactionSettleTimer);
  }

  interactionSettleTimer = window.setTimeout(() => {
    interactionSettleTimer = null;
    uiState.isInteracting = false;
    requestRender();
  }, 140);
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
  return window.AtlasCore.getResolvedScenes(
    atlasSceneDefinitions,
    projectionState,
    rotationOffset,
    zoomState.scale,
    flatProjectionPanOffsets[projectionState.selectedProjection] ?? { x: 0, y: 0 },
  );
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

  if (
    (scene.projectionKind === "natural-earth-ii" ||
      scene.projectionKind === "goode-homolosine" ||
      scene.projectionKind === "waterman") &&
    ((scene.zoomScale ?? 1) > 1.001 || (scene.panOffset?.x ?? 0) !== 0 || (scene.panOffset?.y ?? 0) !== 0)
  ) {
    overlayContext.translate(
      scene.center[0] + (scene.panOffset?.x ?? 0),
      scene.center[1] + (scene.panOffset?.y ?? 0),
    );
    overlayContext.scale(scene.zoomScale ?? 1, scene.zoomScale ?? 1);
    overlayContext.translate(-scene.center[0], -scene.center[1]);
    window.AtlasCore.traceSceneShape(overlayContext, scene);
    overlayContext.clip();
    overlayContext.translate(scene.center[0], scene.center[1]);
    overlayContext.scale(1 / (scene.zoomScale ?? 1), 1 / (scene.zoomScale ?? 1));
    overlayContext.translate(
      -(scene.center[0] + (scene.panOffset?.x ?? 0)),
      -(scene.center[1] + (scene.panOffset?.y ?? 0)),
    );
  } else {
    window.AtlasCore.traceSceneShape(overlayContext, scene);
    overlayContext.clip();
  }

  renderFn();
  overlayContext.restore();
}

function getEffectiveDragSensitivity() {
  return dragSensitivity * (1.5 / Math.max(zoomState.scale, 1));
}

function usesFlatProjectionPan() {
  return (
    projectionState.selectedProjection === "natural-earth-ii" ||
    projectionState.selectedProjection === "goode-homolosine" ||
    projectionState.selectedProjection === "waterman"
  );
}

function getFlatProjectionPanOffset() {
  return flatProjectionPanOffsets[projectionState.selectedProjection] ?? { x: 0, y: 0 };
}

function clampFlatProjectionPanOffset(offset) {
  if (!usesFlatProjectionPan()) {
    return { x: 0, y: 0 };
  }

  const viewDimensions = window.AtlasCore.getViewDimensions(projectionState.selectedProjection);
  const maxX = Math.max(0, (viewDimensions.width * (zoomState.scale - 1)) / 2);
  const maxY = Math.max(0, (viewDimensions.height * (zoomState.scale - 1)) / 2);
  return {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  };
}

function syncFlatProjectionPanOffset() {
  if (!usesFlatProjectionPan()) {
    return;
  }

  flatProjectionPanOffsets[projectionState.selectedProjection] = clampFlatProjectionPanOffset(
    getFlatProjectionPanOffset(),
  );
}

function getMercatorPhiSensitivityMultiplier() {
  if (projectionState.selectedProjection !== "mercator") {
    return 1;
  }

  const latitude = Math.abs(rotationOffset.phi);
  const normalizedLatitude = Math.min(latitude, 80) / 80;
  return Math.max(0.18, 1 - (normalizedLatitude * 0.82));
}

function getProjectionPhiClampRange() {
  switch (projectionState.selectedProjection) {
    case "orthographic":
    case "azimuthal-equidistant":
      return 89.999;
    case "mercator":
      return Math.min(80, 28 * Math.max(zoomState.scale, 1));
    default:
      return 28;
  }
}

function enableDragging() {
  d3.select(stage).call(
    d3
      .drag()
      .filter((event) => {
        const sourceEvent = event.sourceEvent;
        if (isPinchZooming || doubleTapHoldState) {
          return false;
        }

        if (isWithinMonthControls(sourceEvent?.target)) {
          return false;
        }

        if (sourceEvent?.touches && sourceEvent.touches.length > 1) {
          return false;
        }

        return true;
      })
      .on("drag", (event) => {
        if (isPinchZooming || doubleTapHoldState) {
          return;
        }

        if (
          projectionState.selectedProjection === "dymaxion" ||
          (usesFlatProjectionPan() && zoomState.scale <= 1.01)
        ) {
          return;
        }

        const effectiveDragSensitivity = getEffectiveDragSensitivity();
        if (usesFlatProjectionPan()) {
          const currentOffset = getFlatProjectionPanOffset();
          flatProjectionPanOffsets[projectionState.selectedProjection] = clampFlatProjectionPanOffset({
            x: currentOffset.x + event.dx,
            y: currentOffset.y + event.dy,
          });
          markInteractionActivity();
          requestRender();
          return;
        }

        rotationOffset.lambda += event.dx * effectiveDragSensitivity;
        rotationOffset.phi -= event.dy * effectiveDragSensitivity * getMercatorPhiSensitivityMultiplier();
        const phiClampRange = getProjectionPhiClampRange();
        rotationOffset.phi = clamp(
          rotationOffset.phi,
          -phiClampRange,
          phiClampRange,
        );
        markInteractionActivity();
        requestRender();
      }),
  );
}

function getProjectionZoomBounds() {
  switch (projectionState.selectedProjection) {
    case "mercator":
      return { min: 1, max: 8 };
    case "orthographic":
      return { min: 1, max: 7 };
    case "natural-earth-ii":
    case "goode-homolosine":
    case "waterman":
    case "azimuthal-equidistant":
      return { min: 1, max: 6 };
    default:
      return { min: 1, max: 1 };
  }
}

function canZoomCurrentProjection() {
  return projectionState.selectedProjection !== "dymaxion";
}

function clampZoomScale(nextScale) {
  const { min, max } = getProjectionZoomBounds();
  return clamp(nextScale, min, max);
}

function setZoomScale(nextScale) {
  if (!canZoomCurrentProjection()) {
    return;
  }

  const clampedScale = clampZoomScale(nextScale);
  if (Math.abs(clampedScale - zoomState.scale) < 0.001) {
    return;
  }

  zoomState.scale = clampedScale;
  syncFlatProjectionPanOffset();
  syncMobileMonthChrome();
  syncStageChrome();
  markInteractionActivity();
  requestRender();
}

function adjustZoomBy(delta) {
  setZoomScale(zoomState.scale * delta);
}

function getPointerDistance(pointerA, pointerB) {
  return Math.hypot(pointerA.clientX - pointerB.clientX, pointerA.clientY - pointerB.clientY);
}

function handleDoubleTapPointerStart(event) {
  if (!mobileLayerMenuMediaQuery.matches || !canZoomCurrentProjection()) {
    return false;
  }

  const now = Date.now();
  const tapPosition = { x: event.clientX, y: event.clientY };
  const isDoubleTap = now - lastTapTimestamp < 280
    && lastTapPosition
    && Math.hypot(tapPosition.x - lastTapPosition.x, tapPosition.y - lastTapPosition.y) < 32;

  lastTapTimestamp = now;
  lastTapPosition = tapPosition;

  if (!isDoubleTap) {
    doubleTapHoldState = null;
    return false;
  }

  event.preventDefault();
  doubleTapHoldState = {
    pointerId: event.pointerId,
    startY: event.clientY,
    startScale: zoomState.scale,
    activated: false,
  };
  return true;
}

function handleDoubleTapPointerMove(event) {
  if (!doubleTapHoldState || doubleTapHoldState.pointerId !== event.pointerId) {
    return false;
  }

  const deltaY = event.clientY - doubleTapHoldState.startY;

  if (!doubleTapHoldState.activated && Math.abs(deltaY) < 8) {
    return true;
  }

  event.preventDefault();
  doubleTapHoldState.activated = true;
  setZoomScale(doubleTapHoldState.startScale * Math.exp(deltaY * 0.0075));
  return true;
}

function handleDoubleTapPointerEnd(pointerId) {
  if (!doubleTapHoldState || doubleTapHoldState.pointerId !== pointerId) {
    return;
  }

  const wasActivated = doubleTapHoldState.activated;
  doubleTapHoldState = null;

  if (!wasActivated) {
    adjustZoomBy(1.6);
  }
}

function enableZoomControls() {
  document.addEventListener(
    "wheel",
    (event) => {
      if (!canZoomCurrentProjection()) {
        return;
      }

      if (isWithinInteractiveUi(event.target)) {
        return;
      }

      event.preventDefault();
      const delta = Math.exp(-event.deltaY * 0.0015);
      adjustZoomBy(delta);
    },
    { passive: false },
  );

  const syncPinchState = () => {
    if (activeGesturePointers.size < 2) {
      isPinchZooming = false;
      pinchDistance = null;
      return;
    }

    const [pointerA, pointerB] = Array.from(activeGesturePointers.values());
    const nextDistance = getPointerDistance(pointerA, pointerB);
    if (!Number.isFinite(nextDistance) || nextDistance <= 0) {
      return;
    }

    if (!isPinchZooming || !pinchDistance) {
      isPinchZooming = true;
      pinchDistance = nextDistance;
      return;
    }

    setZoomScale(zoomState.scale * (nextDistance / pinchDistance));
    pinchDistance = nextDistance;
  };

  document.addEventListener("pointerdown", (event) => {
    if (!canZoomCurrentProjection()) {
      return;
    }

    if (event.pointerType !== "touch" && event.pointerType !== "pen") {
      return;
    }

    if (isWithinInteractiveUi(event.target)) {
      return;
    }

    activeGesturePointers.set(event.pointerId, {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    });

    if (activeGesturePointers.size === 1) {
      handleDoubleTapPointerStart(event);
      return;
    }

    doubleTapHoldState = null;
    event.preventDefault();
    syncPinchState();
  }, { passive: false });

  document.addEventListener("pointermove", (event) => {
    if (!activeGesturePointers.has(event.pointerId)) {
      return;
    }

    activeGesturePointers.set(event.pointerId, {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    });

    if (handleDoubleTapPointerMove(event)) {
      return;
    }

    if (activeGesturePointers.size < 2) {
      return;
    }

    event.preventDefault();
    syncPinchState();
  }, { passive: false });

  const releasePointer = (event) => {
    handleDoubleTapPointerEnd(event.pointerId);
    activeGesturePointers.delete(event.pointerId);

    if (activeGesturePointers.size < 2) {
      isPinchZooming = false;
      pinchDistance = null;
    } else {
      syncPinchState();
    }

  };

  document.addEventListener("pointerup", releasePointer, { passive: true });
  document.addEventListener("pointercancel", (event) => {
    doubleTapHoldState = null;
    activeGesturePointers.delete(event.pointerId);
    if (activeGesturePointers.size < 2) {
      isPinchZooming = false;
      pinchDistance = null;
    }
  }, { passive: true });
}

function enableLayerControls() {
  layerButtons.forEach((button) => {
    if (button.dataset.empireLayerId) {
      return;
    }

    button.classList.toggle("is-active", Boolean(layerState[button.dataset.layerId]));
    button.closest(".layer-group")?.classList.toggle("is-active", Boolean(layerState[button.dataset.layerId]));

    button.addEventListener("click", async (event) => {
      const layerId = button.dataset.layerId;

      if (!layerId || !(layerId in layerState)) {
        return;
      }

      if (layerId === "empires" && empireGroupToggle && event.target instanceof Node && empireGroupToggle.contains(event.target)) {
        uiState.isEmpireGroupOpen = !uiState.isEmpireGroupOpen;
        syncEmpireGroupUi();
        releaseLayerPanelFocusAfterPointerInteraction(button);
        return;
      }

      if (layerId === "empires") {
        const nextEmpireVisibility = !layerState.empires;
        if (nextEmpireVisibility && !Object.values(empireLayerState).some(Boolean)) {
          empireLayerState.roman = true;
        }
        layerState.empires = nextEmpireVisibility;
      } else {
        layerState[layerId] = !layerState[layerId];
      }
      if (layerId !== "empires") {
        button.classList.toggle("is-active", layerState[layerId]);
        button.closest(".layer-group")?.classList.toggle("is-active", layerState[layerId]);
      }
      if (layerId === "earth") {
        syncMobileMonthChrome();
        if (layerState.earth && !earthTextureImage) {
          await refreshEarthTexture();
        }
      }
      if (layerId === "empires") {
        syncEmpireGroupUi();
      }
      drawAtlas();
      releaseLayerPanelFocusAfterPointerInteraction(button);
    });
  });

  empireLayerButtons.forEach((button) => {
    const empireLayerId = button.dataset.empireLayerId;
    if (!empireLayerId) {
      return;
    }

    button.classList.toggle("is-active", Boolean(empireLayerState[empireLayerId]));
    button.addEventListener("click", () => {
      if (!layerState.empires) {
        empireLayerState[empireLayerId] = true;
      } else {
        empireLayerState[empireLayerId] = !empireLayerState[empireLayerId];
      }
      layerState.empires = Object.values(empireLayerState).some(Boolean);
      syncEmpireGroupUi();
      drawAtlas();
      releaseLayerPanelFocusAfterPointerInteraction(button);
    });
  });

  syncEmpireGroupUi();
}

function setLayerPanelOpen(isOpen) {
  uiState.isLayerPanelOpen = isOpen;
  layerPanel?.classList.toggle("is-open", isOpen);
  layerMenuToggle?.classList.toggle("is-hidden", isOpen);
  layerMenuToggle?.setAttribute("aria-expanded", String(isOpen));
  syncLayerPanelScrollbar();
  if (isOpen) {
    showLayerPanelScrollbarTemporarily();
  } else {
    layerPanelScrollbar?.classList.remove("is-visible");
  }

  if (!isOpen && mobileLayerMenuMediaQuery.matches) {
    layerMenuToggle?.focus();
  }
}

function syncLayerPanelScrollbar() {
  if (!layerPanelScroll || !layerPanelScrollbar || !layerPanelScrollbarThumb) {
    return;
  }

  const panelRect = layerPanel?.getBoundingClientRect();
  const scrollRect = layerPanelScroll.getBoundingClientRect();
  if (panelRect) {
    const gutterWidth = Math.max(panelRect.right - scrollRect.right, 0);
    const scrollbarWidth = layerPanelScrollbar.offsetWidth || 8;
    const rightOffset = Math.max((gutterWidth - scrollbarWidth) / 2, 0);
    layerPanelScrollbar.style.right = `${rightOffset}px`;
  }

  const viewportHeight = layerPanelScroll.clientHeight;
  const scrollChildren = Array.from(layerPanelScroll.children);
  const effectiveContentHeight = scrollChildren.length
    ? Math.max(
      ...scrollChildren.map((child) => child instanceof HTMLElement ? child.offsetTop + child.offsetHeight : 0),
    )
    : 0;
  const contentHeight = Math.max(effectiveContentHeight, viewportHeight);
  const maxScrollTop = Math.max(contentHeight - viewportHeight, 0);

  if (maxScrollTop <= 0) {
    layerPanelScrollbar.classList.remove("is-visible");
    layerPanelScrollbarThumb.style.height = "0px";
    layerPanelScrollbarThumb.style.transform = "translateY(0)";
    return;
  }

  const trackHeight = layerPanelScrollbar.clientHeight;
  const thumbHeight = Math.max(32, (viewportHeight / contentHeight) * trackHeight);
  const maxThumbTravel = Math.max(trackHeight - thumbHeight, 0);
  const thumbOffset = maxScrollTop > 0
    ? (layerPanelScroll.scrollTop / maxScrollTop) * maxThumbTravel
    : 0;

  layerPanelScrollbarThumb.style.height = `${thumbHeight}px`;
  layerPanelScrollbarThumb.style.transform = `translateY(${thumbOffset}px)`;
}

function showLayerPanelScrollbarTemporarily() {
  if (!layerPanelScrollbar || !layerPanelScroll) {
    return;
  }

  if (layerPanelScroll.scrollHeight <= layerPanelScroll.clientHeight) {
    layerPanelScrollbar.classList.remove("is-visible");
    return;
  }

  layerPanelScrollbar.classList.add("is-visible");
  if (layerScrollbarFadeTimer !== null) {
    window.clearTimeout(layerScrollbarFadeTimer);
  }

  layerScrollbarFadeTimer = window.setTimeout(() => {
    if (layerScrollbarDragState) {
      return;
    }

    layerPanelScrollbar.classList.remove("is-visible");
    layerScrollbarFadeTimer = null;
  }, 700);
}

function enableLayerPanelScrollbar() {
  if (!layerPanelScroll || !layerPanelScrollbar || !layerPanelScrollbarThumb) {
    return;
  }

  const startDrag = (event) => {
    event.preventDefault();
    showLayerPanelScrollbarTemporarily();
    const trackRect = layerPanelScrollbar.getBoundingClientRect();
    const thumbRect = layerPanelScrollbarThumb.getBoundingClientRect();
    layerScrollbarDragState = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startTop: thumbRect.top - trackRect.top,
    };
    layerPanelScrollbarThumb.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!layerScrollbarDragState || event.pointerId !== layerScrollbarDragState.pointerId) {
      return;
    }

    const trackRect = layerPanelScrollbar.getBoundingClientRect();
    const thumbHeight = layerPanelScrollbarThumb.offsetHeight;
    const maxThumbTravel = Math.max(trackRect.height - thumbHeight, 0);
    const thumbTop = clamp(
      layerScrollbarDragState.startTop + (event.clientY - layerScrollbarDragState.startY),
      0,
      maxThumbTravel,
    );
    const maxScrollTop = Math.max(layerPanelScroll.scrollHeight - layerPanelScroll.clientHeight, 0);
    layerPanelScroll.scrollTop = maxThumbTravel > 0
      ? (thumbTop / maxThumbTravel) * maxScrollTop
      : 0;
    syncLayerPanelScrollbar();
    showLayerPanelScrollbarTemporarily();
  };

  const endDrag = (event) => {
    if (!layerScrollbarDragState || event.pointerId !== layerScrollbarDragState.pointerId) {
      return;
    }

    layerPanelScrollbarThumb.releasePointerCapture?.(event.pointerId);
    layerScrollbarDragState = null;
    showLayerPanelScrollbarTemporarily();
  };

  layerPanelScroll.addEventListener("scroll", () => {
    syncLayerPanelScrollbar();
    showLayerPanelScrollbarTemporarily();
  }, { passive: true });
  window.addEventListener("resize", syncLayerPanelScrollbar);
  layerPanelScrollbarThumb.addEventListener("pointerdown", startDrag);
  layerPanelScrollbarThumb.addEventListener("pointermove", moveDrag);
  layerPanelScrollbarThumb.addEventListener("pointerup", endDrag);
  layerPanelScrollbarThumb.addEventListener("pointercancel", endDrag);
  syncLayerPanelScrollbar();
}

function setRefreshMenuOpen(isOpen) {
  mobileRefreshMenu?.classList.toggle("is-open", isOpen);
  mobileRefreshButton?.setAttribute("aria-expanded", String(isOpen));
}

function syncEmpireGroupUi() {
  const hasEnabledEmpireLayer = Object.values(empireLayerState).some(Boolean);
  const parentIsActive = layerState.empires && hasEnabledEmpireLayer;
  const empiresButton = document.querySelector('[data-layer-id="empires"]');

  empireLayerGroup?.classList.toggle("is-active", parentIsActive);
  empireLayerGroup?.classList.toggle("is-disabled", !layerState.empires);
  empireLayerGroup?.classList.toggle("is-open", uiState.isEmpireGroupOpen);
  empireGroupToggle?.setAttribute("aria-expanded", String(uiState.isEmpireGroupOpen));
  empiresButton?.classList.toggle("is-active", parentIsActive);

  empireLayerButtons.forEach((button) => {
    const empireLayerId = button.dataset.empireLayerId;
    const storedIsActive = Boolean(empireLayerId && empireLayerState[empireLayerId]);
    const displayIsActive = layerState.empires && storedIsActive;
    button.classList.toggle("is-active", displayIsActive);
    button.disabled = false;
    button.setAttribute("aria-disabled", "false");
  });
}

function clearRefreshMenuPressTimer() {
  if (!refreshMenuPressTimer) {
    return;
  }

  window.clearTimeout(refreshMenuPressTimer);
  refreshMenuPressTimer = null;
}

async function reloadWithCacheClear() {
  try {
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }

    window.localStorage?.clear();
    window.sessionStorage?.clear();
  } catch (error) {
    console.warn("Cache clear reload fell back to URL bust only.", error);
  }

  const reloadUrl = new URL(window.location.href);
  reloadUrl.searchParams.set("_reload", String(Date.now()));
  window.location.replace(reloadUrl.toString());
}

function enableRefreshControls() {
  if (
    !mobileRefresh
    || !mobileRefreshButton
    || !mobileRefreshMenu
    || !hardReloadButton
    || !clearCacheReloadButton
  ) {
    return;
  }

  const openRefreshMenu = () => {
    refreshMenuLongPressTriggered = true;
    setRefreshMenuOpen(true);
  };

  const startPress = () => {
    clearRefreshMenuPressTimer();
    refreshMenuLongPressTriggered = false;
    refreshMenuPressTimer = window.setTimeout(openRefreshMenu, 450);
  };

  const cancelPress = () => {
    clearRefreshMenuPressTimer();
  };

  mobileRefreshButton.addEventListener("pointerdown", (event) => {
    if (!mobileLayerMenuMediaQuery.matches || event.pointerType === "mouse") {
      return;
    }

    startPress();
  });

  mobileRefreshButton.addEventListener("pointerup", () => {
    cancelPress();
  });

  mobileRefreshButton.addEventListener("pointerleave", () => {
    cancelPress();
  });

  mobileRefreshButton.addEventListener("pointercancel", () => {
    cancelPress();
  });

  mobileRefreshButton.addEventListener("click", (event) => {
    if (!mobileLayerMenuMediaQuery.matches) {
      return;
    }

    if (refreshMenuLongPressTriggered) {
      event.preventDefault();
      refreshMenuLongPressTriggered = false;
      return;
    }

    window.location.reload();
  });

  hardReloadButton.addEventListener("click", () => {
    setRefreshMenuOpen(false);
    const reloadUrl = new URL(window.location.href);
    reloadUrl.searchParams.set("_reload", String(Date.now()));
    window.location.replace(reloadUrl.toString());
  });

  clearCacheReloadButton.addEventListener("click", async () => {
    setRefreshMenuOpen(false);
    await reloadWithCacheClear();
  });

  document.addEventListener("click", (event) => {
    if (!mobileRefreshMenu.classList.contains("is-open")) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (mobileRefresh.contains(target)) {
      return;
    }

    setRefreshMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileRefreshMenu.classList.contains("is-open")) {
      setRefreshMenuOpen(false);
    }
  });
}

function enableLayerPanelToggle() {
  if (!layerMenuToggle || !layerPanel || !layerPanelClose) {
    return;
  }

  layerMenuToggle.addEventListener("click", () => {
    setLayerPanelOpen(true);
    projectionSelect?.focus();
  });

  layerPanelClose.addEventListener("click", () => {
    setLayerPanelOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!uiState.isLayerPanelOpen) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (layerPanel.contains(target) || layerMenuToggle.contains(target)) {
      return;
    }

    setLayerPanelOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && uiState.isLayerPanelOpen) {
      setLayerPanelOpen(false);
    }
  });
}

function enableProjectionControls() {
  if (!projectionSelect) {
    return;
  }

  projectionState.selectedProjection = normalizeProjectionSelection(projectionState.selectedProjection);
  projectionSelect.value = projectionState.selectedProjection;
  syncProjectionSwitcher();
  projectionSelect.addEventListener("change", () => {
    projectionState.selectedProjection = normalizeProjectionSelection(projectionSelect.value);
    projectionSelect.value = projectionState.selectedProjection;
    zoomState.scale = clampZoomScale(zoomState.scale);
    syncProjectionSwitcher();
    releaseLayerPanelFocusAfterPointerInteraction(projectionSelect);
    handleResize();
  });
}

function enableProjectionSwitcher() {
  if (!projectionSwitcher || !projectionSwitcherTrack) {
    return;
  }

  const useTouchProjectionSwipe = !window.PointerEvent || /firefox/i.test(navigator.userAgent);

  const startProjectionSwipe = (clientX, pointerId = null) => {
    if (projectionSwipeAnimating) {
      return false;
    }

    projectionSwipePointerId = pointerId;
    projectionSwipeStartX = clientX;
    projectionSwipeStartTime = performance.now();
    projectionSwipeDeltaX = 0;
    projectionSwitcher.classList.add("is-dragging");
    renderProjectionSwitcher(0);
    return true;
  };

  const moveProjectionSwipe = (clientX, pointerId = null) => {
    if (projectionSwipeStartX === null) {
      return false;
    }

    if (projectionSwipePointerId !== null && projectionSwipePointerId !== pointerId) {
      return false;
    }

    projectionSwipeDeltaX = clientX - projectionSwipeStartX;
    renderProjectionSwitcher(projectionSwipeDeltaX);
    return true;
  };

  const endProjectionSwipe = () => {
    if (projectionSwipeStartX === null) {
      return false;
    }

    projectionSwipeStartX = null;
    projectionSwipePointerId = null;
    projectionSwitcher.classList.remove("is-dragging");
    const slotWidth = getProjectionSlotWidth();
    const elapsedMs = Math.max(1, performance.now() - projectionSwipeStartTime);
    const velocityX = projectionSwipeDeltaX / elapsedMs;
    const flickDirection = Math.abs(velocityX) > 0.3
      ? (velocityX > 0 ? 1 : -1)
      : 0;
    const steps = flickDirection !== 0
      ? flickDirection
      : Math.round(projectionSwipeDeltaX / slotWidth);

    if (Math.abs(projectionSwipeDeltaX) < 32 || steps === 0) {
      renderProjectionSwitcher(0);
      projectionSwipeDeltaX = 0;
      projectionSwipeStartTime = 0;
      return true;
    }

    projectionSwipeAnimating = true;
    projectionSwitcher.classList.add("is-settling");
    renderProjectionSwitcher(steps * slotWidth);
    if (projectionSwipeSettleTimer !== null) {
      window.clearTimeout(projectionSwipeSettleTimer);
    }
    projectionSwipeSettleTimer = window.setTimeout(() => {
      projectionSwipeSettleTimer = null;
      projectionSwitcher.classList.remove("is-settling");
      cycleProjection(steps);
      projectionSwipeAnimating = false;
    }, 140);
    projectionSwipeDeltaX = 0;
    projectionSwipeStartTime = 0;
    return true;
  };

  const cancelProjectionSwipe = () => {
    if (projectionSwipeSettleTimer !== null) {
      window.clearTimeout(projectionSwipeSettleTimer);
      projectionSwipeSettleTimer = null;
    }

    projectionSwipeAnimating = false;
    projectionSwipeStartX = null;
    projectionSwipeStartTime = 0;
    projectionSwipePointerId = null;
    projectionSwipeDeltaX = 0;
    projectionSwitcher.classList.remove("is-dragging");
    projectionSwitcher.classList.remove("is-settling");
    renderProjectionSwitcher(0);
  };

  projectionSwitcher.addEventListener("pointerdown", (event) => {
    if (useTouchProjectionSwipe) {
      return;
    }

    if (!startProjectionSwipe(event.clientX, event.pointerId)) {
      return;
    }

    projectionSwitcher.setPointerCapture(event.pointerId);
  });

  projectionSwitcher.addEventListener("pointermove", (event) => {
    if (useTouchProjectionSwipe) {
      return;
    }

    moveProjectionSwipe(event.clientX, event.pointerId);
  });

  projectionSwitcher.addEventListener("pointerup", (event) => {
    if (useTouchProjectionSwipe) {
      return;
    }

    if (projectionSwipePointerId !== event.pointerId) {
      return;
    }

    endProjectionSwipe();

    if (projectionSwitcher.hasPointerCapture?.(event.pointerId)) {
      projectionSwitcher.releasePointerCapture(event.pointerId);
    }
  });

  projectionSwitcher.addEventListener("pointercancel", cancelProjectionSwipe);

  projectionSwitcher.addEventListener("lostpointercapture", () => {
    if (projectionSwipeStartX !== null && !projectionSwipeAnimating) {
      cancelProjectionSwipe();
    }
  });

  projectionSwitcher.addEventListener("touchstart", (event) => {
    if (!useTouchProjectionSwipe) {
      return;
    }

    if (event.touches.length !== 1) {
      return;
    }

    if (!startProjectionSwipe(event.touches[0].clientX)) {
      return;
    }

    event.preventDefault();
  }, { passive: false });

  projectionSwitcher.addEventListener("touchmove", (event) => {
    if (!useTouchProjectionSwipe) {
      return;
    }

    if (event.touches.length !== 1) {
      return;
    }

    if (!moveProjectionSwipe(event.touches[0].clientX)) {
      return;
    }

    event.preventDefault();
  }, { passive: false });

  projectionSwitcher.addEventListener("touchend", () => {
    if (!useTouchProjectionSwipe) {
      return;
    }

    endProjectionSwipe();
  }, { passive: true });

  projectionSwitcher.addEventListener("touchcancel", () => {
    if (!useTouchProjectionSwipe) {
      return;
    }

    if (!projectionSwipeAnimating) {
      cancelProjectionSwipe();
    }
  }, { passive: true });

  projectionSwitcher.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cycleProjection();
    }
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
  syncMobileMonthChrome();
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
