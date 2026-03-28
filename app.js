const stage = document.getElementById("atlasStage");
const earthCanvas = document.getElementById("atlasEarthCanvas");
const empireCanvas = document.getElementById("atlasEmpireCanvas");
const overlayCanvas = document.getElementById("atlasOverlayCanvas");
const empireContext = empireCanvas.getContext("2d");
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
const empireQualityInput = document.getElementById("empireQualityInput");
const empireQualityValue = document.getElementById("empireQualityValue");
const earthLayerGroup = document.getElementById("earthLayerGroup");
const earthGroupButton = document.getElementById("earthGroupButton");
const earthGroupToggle = document.getElementById("earthGroupToggle");
const graticuleLayerGroup = document.getElementById("graticuleLayerGroup");
const graticuleGroupToggle = document.getElementById("graticuleGroupToggle");
const graticuleWidthInput = document.getElementById("graticuleWidthInput");
const graticuleWidthValue = document.getElementById("graticuleWidthValue");
const graticuleOpacityInput = document.getElementById("graticuleOpacityInput");
const graticuleColorInput = document.getElementById("graticuleColorInput");
const graticuleColorValue = document.getElementById("graticuleColorValue");
const graticuleColorInlineDot = document.getElementById("graticuleColorInlineDot");
const graticuleColorSwatchButton = document.getElementById("graticuleColorSwatchButton");
const graticuleColorCustoms = document.getElementById("graticuleColorCustoms");
const graticuleColorPresetButtons = Array.from(document.querySelectorAll("[data-graticule-color]"));
const graticuleColorPanel = document.getElementById("graticuleColorPanel");
const graticuleColorField = document.getElementById("graticuleColorField");
const graticuleColorFieldHandle = document.getElementById("graticuleColorFieldHandle");
const graticuleColorHueSlider = document.getElementById("graticuleColorHueSlider");
const graticuleColorHueHandle = document.getElementById("graticuleColorHueHandle");
const graticuleColorAddButton = document.getElementById("graticuleColorAddButton");
const borderLayerGroup = document.getElementById("borderLayerGroup");
const borderGroupToggle = document.getElementById("borderGroupToggle");
const borderWidthInput = document.getElementById("borderWidthInput");
const borderWidthValue = document.getElementById("borderWidthValue");
const borderOpacityInput = document.getElementById("borderOpacityInput");
const borderColorInput = document.getElementById("borderColorInput");
const borderColorValue = document.getElementById("borderColorValue");
const borderColorInlineDot = document.getElementById("borderColorInlineDot");
const borderColorSwatchButton = document.getElementById("borderColorSwatchButton");
const borderColorCustoms = document.getElementById("borderColorCustoms");
const borderColorPresetButtons = Array.from(document.querySelectorAll("[data-border-color]"));
const borderColorPanel = document.getElementById("borderColorPanel");
const borderColorField = document.getElementById("borderColorField");
const borderColorFieldHandle = document.getElementById("borderColorFieldHandle");
const borderColorHueSlider = document.getElementById("borderColorHueSlider");
const borderColorHueHandle = document.getElementById("borderColorHueHandle");
const borderColorAddButton = document.getElementById("borderColorAddButton");
const landColorInput = document.getElementById("landColorInput");
const landColorValue = document.getElementById("landColorValue");
const landColorInlineDot = document.getElementById("landColorInlineDot");
const landColorSwatchButton = document.getElementById("landColorSwatchButton");
const landColorCustoms = document.getElementById("landColorCustoms");
const landColorPresetButtons = Array.from(document.querySelectorAll("[data-land-color]"));
const landColorPanel = document.getElementById("landColorPanel");
const landColorField = document.getElementById("landColorField");
const landColorFieldHandle = document.getElementById("landColorFieldHandle");
const landColorHueSlider = document.getElementById("landColorHueSlider");
const landColorHueHandle = document.getElementById("landColorHueHandle");
const landColorAddButton = document.getElementById("landColorAddButton");
const waterColorInput = document.getElementById("waterColorInput");
const waterColorValue = document.getElementById("waterColorValue");
const waterColorInlineDot = document.getElementById("waterColorInlineDot");
const waterColorSwatchButton = document.getElementById("waterColorSwatchButton");
const waterColorCustoms = document.getElementById("waterColorCustoms");
const waterColorPresetButtons = Array.from(document.querySelectorAll("[data-water-color]"));
const waterColorPanel = document.getElementById("waterColorPanel");
const waterColorField = document.getElementById("waterColorField");
const waterColorFieldHandle = document.getElementById("waterColorFieldHandle");
const waterColorHueSlider = document.getElementById("waterColorHueSlider");
const waterColorHueHandle = document.getElementById("waterColorHueHandle");
const waterColorAddButton = document.getElementById("waterColorAddButton");
const mobileRefresh = document.getElementById("mobileRefresh");
const mobileRefreshButton = document.getElementById("mobileRefreshButton");
const mobileRefreshMenu = document.getElementById("mobileRefreshMenu");
const hardReloadButton = document.getElementById("hardReloadButton");
const clearCacheReloadButton = document.getElementById("clearCacheReloadButton");
const projectionSwitcher = document.getElementById("projectionSwitcher");
const projectionSwitcherTrack = document.getElementById("projectionSwitcherTrack");
const layerButtons = Array.from(document.querySelectorAll(".layer-item"));
const empireLayerButtons = Array.from(document.querySelectorAll("[data-empire-layer-id]"));
const projectionPicker = document.getElementById("projectionPicker");
const projectionPickerButton = document.getElementById("projectionPickerButton");
const projectionPickerValue = document.getElementById("projectionPickerValue");
const projectionPickerList = document.getElementById("projectionPickerList");
const projectionOptionButtons = Array.from(document.querySelectorAll("[data-projection-option]"));
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
let lastEmpireRenderKey = null;
let currentEmpirePixelRatio = 1;
let renderScheduled = false;
const earthTextureStore = window.AtlasLayers.createEarthTextureStore();
const mobileLayerMenuMediaQuery = window.matchMedia("(max-width: 800px)");
const activeGesturePointers = new Map();
let isPinchZooming = false;
let pinchDistance = null;
let lastTapTimestamp = 0;
const EMPIRE_INTERACTION_PIXEL_RATIO = 0.6;
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
let bootStagePosterSnapshotTimer = null;
let viewStateSaveTimer = null;
let layerScrollbarDragState = null;
let layerScrollbarFadeTimer = null;
const BORDER_COLOR_STORAGE_KEY = "atlas.border.customColors";
const GRATICULE_COLOR_STORAGE_KEY = "atlas.graticule.customColors";
const LAND_COLOR_STORAGE_KEY = "atlas.earth.land.customColors";
const WATER_COLOR_STORAGE_KEY = "atlas.earth.water.customColors";
const STYLE_SETTINGS_STORAGE_KEY = "atlas.style.settings";
const VIEW_STATE_STORAGE_KEY = "atlas.view.state";
const MAX_CUSTOM_BORDER_COLORS = 10;
const BOOT_STAGE_POSTER_STORAGE_KEY = "atlas.bootViewportPoster";
let customBorderColors = [];
let customGraticuleColors = [];
let customLandColors = [];
let customWaterColors = [];
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
  tissot: false,
};
const empireLayerState = {
  romanComparison: true,
  mongol: false,
  british: false,
};
const empireQualityState = {
  romanComparison: "medium",
  mongol: "medium",
  british: "medium",
};
const EMPIRE_QUALITY_LEVELS = ["low", "medium", "high"];

const temporalState = {
  selectedMonth: getDefaultMonth(),
};

function getDefaultProjection() {
  return mobileLayerMenuMediaQuery.matches ? "orthographic" : "azimuthal-equidistant";
}

const projectionState = {
  selectedProjection: getDefaultProjection(),
};
const zoomState = {
  scale: 1,
};
const uiState = {
  isLayerPanelOpen: false,
  isMonthOverlayOpen: false,
  isEarthGroupOpen: false,
  isGraticuleGroupOpen: false,
  isEmpireGroupOpen: false,
  isBorderGroupOpen: false,
  isBorderColorPaletteOpen: false,
  isGraticuleColorPaletteOpen: false,
  isLandColorPaletteOpen: false,
  isWaterColorPaletteOpen: false,
  isProjectionMenuOpen: false,
  isProjectionSwitcherReady: false,
  isInteracting: false,
};
const earthStyleState = {
  land: {
    color: "#98B977",
    hue: 88,
    saturation: 0.37,
    value: 0.73,
  },
  water: {
    color: "#2F7398",
    hue: 201,
    saturation: 0.69,
    value: 0.6,
  },
};
const borderStyleState = {
  color: "#ffffff",
  opacity: 0.36,
  width: 0.8,
  hue: 0,
  saturation: 0,
  value: 1,
};
const graticuleStyleState = {
  color: "#ffffff",
  opacity: 0.12,
  width: 0.7,
  hue: 0,
  saturation: 0,
  value: 1,
};
const colorControlRuntimeState = {
  border: {
    fieldDragState: null,
    hueDragState: null,
    duplicateFlashTimer: null,
    duplicateFlashButton: null,
    removePressTimer: null,
    removeTarget: null,
    longPressTriggered: false,
  },
  graticule: {
    fieldDragState: null,
    hueDragState: null,
    duplicateFlashTimer: null,
    duplicateFlashButton: null,
    removePressTimer: null,
    removeTarget: null,
    longPressTriggered: false,
  },
  land: {
    fieldDragState: null,
    hueDragState: null,
    duplicateFlashTimer: null,
    duplicateFlashButton: null,
    removePressTimer: null,
    removeTarget: null,
    longPressTriggered: false,
  },
  water: {
    fieldDragState: null,
    hueDragState: null,
    duplicateFlashTimer: null,
    duplicateFlashButton: null,
    removePressTimer: null,
    removeTarget: null,
    longPressTriggered: false,
  },
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
const PROJECTION_OPTIONS = [
  { value: "orthographic", label: "Globe" },
  { value: "azimuthal-equidistant", label: "Azimuthal Eqd" },
  { value: "mercator", label: "Mercator" },
  { value: "natural-earth-ii", label: "Natural Earth II" },
  { value: "goode-homolosine", label: "Goode Homolosine" },
  { value: "waterman", label: "Waterman Butterfly" },
];
let overlayLayerRenderers = [];
let empireLayerRenderer = null;

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
  return PROJECTION_OPTIONS.find((option) => option.value === projectionKind)?.label ?? projectionKind;
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

  uiState.isProjectionSwitcherReady = true;
  projectionSwitcher.classList.add("is-ready");
  renderProjectionSwitcher(0);
}

function cycleProjection(direction = 1) {
  projectionState.selectedProjection = getAdjacentProjection(direction);
  zoomState.scale = clampZoomScale(zoomState.scale);
  syncFlatProjectionPanOffset();
  syncProjectionPicker();
  syncProjectionSwitcher();
  scheduleViewStateSave();
  handleResize();
}

function setProjectionMenuOpen(isOpen) {
  uiState.isProjectionMenuOpen = Boolean(isOpen);
  projectionPicker?.classList.toggle("is-open", uiState.isProjectionMenuOpen);
  projectionPickerButton?.setAttribute("aria-expanded", uiState.isProjectionMenuOpen ? "true" : "false");
}

function syncProjectionPicker() {
  const activeProjection = normalizeProjectionSelection(projectionState.selectedProjection);
  if (projectionPickerValue) {
    projectionPickerValue.textContent = getProjectionLabel(activeProjection);
  }

  projectionOptionButtons.forEach((button) => {
    const isActive = button.dataset.projectionOption === activeProjection;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
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
  document.body.classList.toggle("is-mobile-projection-docked", isMobileViewport && isZoomedOut);

  if (!monthsEnabled || (isMobileViewport && isZoomedOut)) {
    setMonthOverlayOpen(false);
  }

  syncProjectionSwitcherMorph();
}

function syncProjectionSwitcherMorph() {
  if (!projectionSwitcher) {
    return;
  }

  if (!mobileLayerMenuMediaQuery.matches) {
    projectionSwitcher.style.removeProperty("--projection-switcher-width");
    projectionSwitcher.style.removeProperty("--projection-switcher-height");
    projectionSwitcher.style.removeProperty("--projection-switcher-padding-x");
    projectionSwitcher.style.removeProperty("--projection-switcher-padding-y");
    projectionSwitcher.style.removeProperty("--projection-switcher-radius");
    projectionSwitcher.style.removeProperty("--projection-switcher-shift-x");
    projectionSwitcher.style.removeProperty("--projection-switcher-shift-y");
    projectionSwitcher.style.removeProperty("--projection-switcher-track-opacity");
    projectionSwitcher.style.removeProperty("--projection-switcher-icon-opacity");
    renderProjectionSwitcher(0);
    return;
  }

  const liveProgress = clamp((zoomState.scale - 1) / 0.35, 0, 1);
  const progress = uiState.isInteracting
    ? liveProgress
    : (liveProgress >= 0.5 ? 1 : 0);
  const viewportWidth = Math.max(window.innerWidth || 0, 1);
  const startCenterX = viewportWidth / 2;
  const endCenterX = viewportWidth - 18 - 24;
  const shiftX = (endCenterX - startCenterX) * progress;
  const width = 208 - (160 * progress);
  const height = 46 + (2 * progress);
  const paddingX = 16 * (1 - progress);
  const paddingY = 11 * (1 - progress);
  const radius = 999 - ((999 - 16) * progress);
  const trackOpacity = 1 - progress;
  const iconOpacity = progress;

  projectionSwitcher.style.setProperty("--projection-switcher-width", `${width}px`);
  projectionSwitcher.style.setProperty("--projection-switcher-height", `${height}px`);
  projectionSwitcher.style.setProperty("--projection-switcher-padding-x", `${paddingX}px`);
  projectionSwitcher.style.setProperty("--projection-switcher-padding-y", `${paddingY}px`);
  projectionSwitcher.style.setProperty("--projection-switcher-radius", `${radius}px`);
  projectionSwitcher.style.setProperty("--projection-switcher-shift-x", `${shiftX}px`);
  projectionSwitcher.style.setProperty("--projection-switcher-shift-y", "0px");
  projectionSwitcher.style.setProperty("--projection-switcher-track-opacity", `${trackOpacity}`);
  projectionSwitcher.style.setProperty("--projection-switcher-icon-opacity", `${iconOpacity}`);
  renderProjectionSwitcher(0);
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
  customBorderColors = loadStoredCustomColors(BORDER_COLOR_STORAGE_KEY);
  customGraticuleColors = loadStoredCustomColors(GRATICULE_COLOR_STORAGE_KEY);
  customLandColors = loadStoredCustomColors(LAND_COLOR_STORAGE_KEY);
  customWaterColors = loadStoredCustomColors(WATER_COLOR_STORAGE_KEY);
  loadStyleSettings();
  loadViewState();
  projectionState.selectedProjection = normalizeProjectionSelection(projectionState.selectedProjection);
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
      borderStyle: borderStyleState,
      graticuleStyle: graticuleStyleState,
      earthStyle: earthStyleState,
      isInteracting: uiState.isInteracting,
    }),
    earthTextureRef: () => earthTextureImage,
    pixelRatioRef: () => pixelRatio,
    rasterSupportedRef: () => projectionSupportsRaster(),
    requestRenderRef: () => requestRender(),
  });
  overlayLayerRenderers = overlayLayerManager.renderers;
  empireLayerRenderer = overlayLayerManager.empireRenderer ?? null;
  if (layerState.earth) {
    await refreshEarthTexture();
  }
  syncEmpireQualityUi();
  drawAtlas();
  document.documentElement.classList.remove("is-mobile-default-globe");
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
    land10,
    land50,
    land110,
    romanComparisonEmpire,
    mongolEmpire,
    britishEmpire,
    romanComparisonHigh,
    romanComparisonMedium,
    romanComparisonLow,
    mongolEmpireHigh,
    mongolEmpireMedium,
    mongolEmpireLow,
    britishEmpireHigh,
    britishEmpireMedium,
    britishEmpireLow,
  ] = await Promise.all([
    d3.json("./data/raw/world-atlas/countries-10m.json"),
    d3.json("./data/raw/world-atlas/countries-110m.json"),
    d3.json("./data/raw/world-atlas/land-10m.json"),
    d3.json("./data/raw/world-atlas/land-50m.json"),
    d3.json("./data/raw/world-atlas/land-110m.json"),
    d3.json("./data/empires/roman_empire_117ad_major_empires_source.geojson"),
    d3.json("./data/empires/mongol_empire_1279_extent.geojson"),
    d3.json("./data/empires/british_empire_1921_extent.geojson"),
    d3.json("./data/empires/roman_empire_117ad_major_empires_source.high.geojson"),
    d3.json("./data/empires/roman_empire_117ad_major_empires_source.medium.geojson"),
    d3.json("./data/empires/roman_empire_117ad_major_empires_source.low.geojson"),
    d3.json("./data/empires/mongol_empire_1279_extent.high.geojson"),
    d3.json("./data/empires/mongol_empire_1279_extent.medium.geojson"),
    d3.json("./data/empires/mongol_empire_1279_extent.low.geojson"),
    d3.json("./data/empires/british_empire_1921_extent.high.geojson"),
    d3.json("./data/empires/british_empire_1921_extent.medium.geojson"),
    d3.json("./data/empires/british_empire_1921_extent.low.geojson"),
  ]);

  const land = topojson.feature(land110, land110.objects.land);
  const borders = topojson.mesh(
    countriesTopology110,
    countriesTopology110.objects.countries,
    (left, right) => left !== right,
  );

  return {
    topology: countriesTopology10,
    empires: {
      romanComparison: romanComparisonEmpire,
      mongol: mongolEmpire,
      british: britishEmpire,
    },
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
        romanComparison: {
          high: romanComparisonHigh,
          medium: romanComparisonMedium,
          low: romanComparisonLow,
          canonical: romanComparisonEmpire,
        },
        mongol: {
          high: mongolEmpireHigh,
          medium: mongolEmpireMedium,
          low: mongolEmpireLow,
          canonical: mongolEmpire,
        },
        british: {
          high: britishEmpireHigh,
          medium: britishEmpireMedium,
          low: britishEmpireLow,
          canonical: britishEmpire,
        },
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
  scheduleViewStateSave();
  if (interactionSettleTimer !== null) {
    window.clearTimeout(interactionSettleTimer);
  }

  interactionSettleTimer = window.setTimeout(() => {
    interactionSettleTimer = null;
    uiState.isInteracting = false;
    syncMobileMonthChrome();
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
  drawEmpirePass(scenes);
  drawOverlayPass(scenes);
  scheduleBootStagePosterSnapshot();
}

function getEmpireRenderKey(scenes) {
  return JSON.stringify({
    projection: projectionState.selectedProjection,
    empiresEnabled: layerState.empires,
    empireSublayers: empireLayerState,
    empirePixelRatio: currentEmpirePixelRatio,
    scenes: scenes.map((scene) => ({
      projectionKind: scene.projectionKind,
      center: scene.center,
      width: scene.width,
      height: scene.height,
      radius: scene.radius,
      zoomScale: scene.zoomScale,
      rotate: scene.rotate,
      panOffset: scene.panOffset,
    })),
  });
}

function syncEmpireQualityUi() {
  const quality = empireQualityState.romanComparison;
  const qualityIndex = Math.max(0, EMPIRE_QUALITY_LEVELS.indexOf(quality));
  if (empireQualityInput) {
    empireQualityInput.value = String(qualityIndex);
  }
  if (empireQualityValue) {
    empireQualityValue.textContent = quality === "low" ? "Low" : quality === "high" ? "High" : "Medium";
  }
}

function configureEmpireCanvas(viewDimensions, targetPixelRatio) {
  const nextEmpirePixelRatio = Math.max(0.5, Math.min(targetPixelRatio, pixelRatio));
  if (
    currentEmpirePixelRatio === nextEmpirePixelRatio
    && empireCanvas.width === Math.round(viewDimensions.width * nextEmpirePixelRatio)
    && empireCanvas.height === Math.round(viewDimensions.height * nextEmpirePixelRatio)
  ) {
    return;
  }

  currentEmpirePixelRatio = nextEmpirePixelRatio;
  empireCanvas.width = Math.round(viewDimensions.width * currentEmpirePixelRatio);
  empireCanvas.height = Math.round(viewDimensions.height * currentEmpirePixelRatio);
  empireContext.setTransform(currentEmpirePixelRatio, 0, 0, currentEmpirePixelRatio, 0, 0);
  lastEmpireRenderKey = null;
}

function drawEmpirePass(scenes) {
  if (!empireCanvas || !empireContext || !empireLayerRenderer) {
    return;
  }

  const nextKey = getEmpireRenderKey(scenes);
  if (nextKey === lastEmpireRenderKey) {
    return;
  }

  lastEmpireRenderKey = nextKey;
  const viewDimensions = window.AtlasCore.getViewDimensions(projectionState.selectedProjection);
  configureEmpireCanvas(
    viewDimensions,
    uiState.isInteracting ? pixelRatio * EMPIRE_INTERACTION_PIXEL_RATIO : pixelRatio,
  );

  empireContext.save();
  empireContext.setTransform(1, 0, 0, 1, 0, 0);
  empireContext.clearRect(0, 0, empireCanvas.width, empireCanvas.height);
  empireContext.restore();
  empireContext.setTransform(currentEmpirePixelRatio, 0, 0, currentEmpirePixelRatio, 0, 0);

  const globalEmpireQuality = empireQualityState.romanComparison;
  scenes.forEach((scene) => {
    empireLayerRenderer(scene, {
      contextOverride: empireContext,
      empireQuality: globalEmpireQuality,
    });
  });
}

function scheduleBootStagePosterSnapshot() {
  if (bootStagePosterSnapshotTimer) {
    clearTimeout(bootStagePosterSnapshotTimer);
  }

  bootStagePosterSnapshotTimer = window.setTimeout(() => {
    bootStagePosterSnapshotTimer = null;
    snapshotBootStagePoster();
  }, 80);
}

function snapshotBootStagePoster() {
  if (!overlayCanvas || !stage) {
    return;
  }

  try {
    const posterCanvas = document.createElement("canvas");
    const stageRect = stage.getBoundingClientRect();
    const posterWidth = Math.max(1, Math.round(stageRect.width));
    const posterHeight = Math.max(1, Math.round(stageRect.height));
    posterCanvas.width = posterWidth;
    posterCanvas.height = posterHeight;
    const context = posterCanvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, posterWidth, posterHeight);
    if (earthCanvas) {
      context.drawImage(earthCanvas, 0, 0, posterWidth, posterHeight);
    }
    if (empireCanvas) {
      context.drawImage(empireCanvas, 0, 0, posterWidth, posterHeight);
    }
    context.drawImage(overlayCanvas, 0, 0, posterWidth, posterHeight);

    if (projectionState.selectedProjection === "orthographic") {
      const globeRadius = Number.parseFloat(singleGlobeFrameElement?.getAttribute("r") ?? "") || Math.max(120, Math.min(posterWidth, posterHeight) / 2 - 44);
      const globeCenterX = Number.parseFloat(singleGlobeFrameElement?.getAttribute("cx") ?? "") || (posterWidth / 2);
      const globeCenterY = Number.parseFloat(singleGlobeFrameElement?.getAttribute("cy") ?? "") || (posterHeight / 2);

      context.strokeStyle = "rgba(8, 27, 38, 0.85)";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(globeCenterX, globeCenterY, globeRadius, 0, Math.PI * 2);
      context.stroke();
    }

    const dataUrl = posterCanvas.toDataURL("image/webp", 0.82);
    sessionStorage.setItem(BOOT_STAGE_POSTER_STORAGE_KEY, dataUrl);
    document.documentElement.style.setProperty("--boot-stage-poster-image", `url("${dataUrl}")`);
  } catch (error) {
    console.warn("Unable to snapshot boot stage poster.", error);
  }
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
  scheduleViewStateSave();
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
      return { min: 1, max: 20 };
    case "orthographic":
      return { min: 1, max: 16 };
    case "natural-earth-ii":
    case "goode-homolosine":
    case "waterman":
    case "azimuthal-equidistant":
      return { min: 1, max: 16 };
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
    const layerId = button.dataset.layerId;
    if (button.dataset.empireLayerId) {
      return;
    }

    if (!layerId || !(layerId in layerState)) {
      return;
    }

    button.classList.toggle("is-active", Boolean(layerState[layerId]));
    button.closest(".layer-group")?.classList.toggle("is-active", Boolean(layerState[layerId]));

    button.addEventListener("click", async (event) => {
      if (layerId === "empires" && empireGroupToggle && event.target instanceof Node && empireGroupToggle.contains(event.target)) {
        uiState.isEmpireGroupOpen = !uiState.isEmpireGroupOpen;
        syncEmpireGroupUi();
        syncLayerPanelScrollbar();
        showLayerPanelScrollbarTemporarily();
        releaseLayerPanelFocusAfterPointerInteraction(button);
        return;
      }

      if (layerId === "borders" && borderGroupToggle && event.target instanceof Node && borderGroupToggle.contains(event.target)) {
        uiState.isBorderGroupOpen = !uiState.isBorderGroupOpen;
        syncBorderGroupUi();
        syncLayerPanelScrollbar();
        showLayerPanelScrollbarTemporarily();
        releaseLayerPanelFocusAfterPointerInteraction(button);
        return;
      }

      if (layerId === "graticule" && graticuleGroupToggle && event.target instanceof Node && graticuleGroupToggle.contains(event.target)) {
        uiState.isGraticuleGroupOpen = !uiState.isGraticuleGroupOpen;
        syncGraticuleGroupUi();
        syncLayerPanelScrollbar();
        showLayerPanelScrollbarTemporarily();
        releaseLayerPanelFocusAfterPointerInteraction(button);
        return;
      }

      if (layerId === "empires") {
        const nextEmpireVisibility = !layerState.empires;
        if (nextEmpireVisibility && !Object.values(empireLayerState).some(Boolean)) {
          empireLayerState.romanComparison = true;
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
      if (layerId === "borders") {
        syncBorderGroupUi();
      }
      if (layerId === "graticule") {
        syncGraticuleGroupUi();
      }
      scheduleViewStateSave();
      drawAtlas();
      releaseLayerPanelFocusAfterPointerInteraction(button);
    });
  });

  earthGroupButton?.addEventListener("click", () => {
    uiState.isEarthGroupOpen = !uiState.isEarthGroupOpen;
    syncEarthGroupUi();
    syncLayerPanelScrollbar();
    showLayerPanelScrollbarTemporarily();
    releaseLayerPanelFocusAfterPointerInteraction(earthGroupButton);
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
      scheduleViewStateSave();
      drawAtlas();
      releaseLayerPanelFocusAfterPointerInteraction(button);
    });
  });

  empireQualityInput?.addEventListener("input", () => {
    const nextIndex = clamp(Number.parseInt(empireQualityInput.value, 10) || 0, 0, EMPIRE_QUALITY_LEVELS.length - 1);
    const nextQuality = EMPIRE_QUALITY_LEVELS[nextIndex];
    Object.keys(empireQualityState).forEach((empireKey) => {
      empireQualityState[empireKey] = nextQuality;
    });
    syncEmpireQualityUi();
    lastEmpireRenderKey = null;
    scheduleViewStateSave();
    drawAtlas();
  });

  syncEmpireGroupUi();
  enableSharedColorControl("land");
  enableSharedColorControl("water");
  syncEarthGroupUi();
  enableGraticuleStyleControls();
  syncGraticuleGroupUi();
  enableBorderStyleControls();
  syncBorderGroupUi();
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
    setProjectionMenuOpen(false);
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
  const empireSubLayers = document.getElementById("empireSubLayers");

  empireLayerGroup?.classList.toggle("is-active", parentIsActive);
  empireLayerGroup?.classList.toggle("is-disabled", !layerState.empires);
  empireLayerGroup?.classList.toggle("is-open", uiState.isEmpireGroupOpen);
  empireGroupToggle?.setAttribute("aria-expanded", String(uiState.isEmpireGroupOpen));
  empiresButton?.classList.toggle("is-active", parentIsActive);

  if (empireSubLayers) {
    if (uiState.isEmpireGroupOpen) {
      requestAnimationFrame(() => {
        const children = Array.from(empireSubLayers.children);
        const firstChild = children[0];
        const lastChild = children[children.length - 1];
        if (!(firstChild instanceof HTMLElement) || !(lastChild instanceof HTMLElement)) {
          empireSubLayers.style.maxHeight = "0px";
          return;
        }

        const firstTop = firstChild.offsetTop;
        const lastBottom = lastChild.offsetTop + lastChild.offsetHeight + parseFloat(window.getComputedStyle(lastChild).marginBottom || "0");
        const contentHeight = Math.max(0, Math.ceil(lastBottom - firstTop));
        empireSubLayers.style.maxHeight = `${contentHeight}px`;
      });
    } else {
      empireSubLayers.style.maxHeight = "0px";
    }
  }

  empireLayerButtons.forEach((button) => {
    const empireLayerId = button.dataset.empireLayerId;
    const storedIsActive = Boolean(empireLayerId && empireLayerState[empireLayerId]);
    const displayIsActive = layerState.empires && storedIsActive;
    button.classList.toggle("is-active", displayIsActive);
    button.disabled = false;
    button.setAttribute("aria-disabled", "false");
  });
}


function formatBorderWidthLabel(width) {
  return `${width.toFixed(1)} px`;
}

function clampOpacityPercent(value) {
  return clamp(Number.parseInt(String(value ?? "0"), 10) || 0, 0, 100);
}

function normalizeHexColor(value) {
  const trimmed = String(value ?? "").trim().toUpperCase();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9A-F]{6}$/.test(withHash) ? withHash : null;
}

function normalizeHexDraftValue(value) {
  const trimmed = String(value ?? "").toUpperCase().replace(/[^0-9A-F#]/g, "");
  const withoutHashes = trimmed.replace(/#/g, "");
  return `#${withoutHashes.slice(0, 6)}`;
}

function loadStoredCustomColors(storageKey) {
  try {
    const stored = window.localStorage?.getItem(storageKey);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((color) => normalizeHexColor(color))
      .filter(Boolean)
      .slice(0, MAX_CUSTOM_BORDER_COLORS);
  } catch (error) {
    return [];
  }
}

function saveStyleSettings() {
  try {
    window.localStorage?.setItem(
      STYLE_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        border: {
          color: borderStyleState.color,
          opacity: borderStyleState.opacity,
          width: borderStyleState.width,
        },
        graticule: {
          color: graticuleStyleState.color,
          opacity: graticuleStyleState.opacity,
          width: graticuleStyleState.width,
        },
        earth: {
          land: {
            color: earthStyleState.land.color,
          },
          water: {
            color: earthStyleState.water.color,
          },
        },
      }),
    );
  } catch (error) {
    // Ignore persistence failures and keep runtime state.
  }
}

function loadStyleSettings() {
  try {
    const stored = window.localStorage?.getItem(STYLE_SETTINGS_STORAGE_KEY);
    if (!stored) {
      return;
    }

    const parsed = JSON.parse(stored);

    const borderColor = normalizeHexColor(parsed?.border?.color);
    if (borderColor) {
      setColorControlValue("border", borderColor);
    }

    const borderOpacity = Number(parsed?.border?.opacity);
    if (Number.isFinite(borderOpacity)) {
      borderStyleState.opacity = clamp(borderOpacity, 0, 1);
    }

    const borderWidth = Number(parsed?.border?.width);
    if (Number.isFinite(borderWidth)) {
      borderStyleState.width = clamp(borderWidth, 0.4, 3);
    }

    const graticuleColor = normalizeHexColor(parsed?.graticule?.color);
    if (graticuleColor) {
      setColorControlValue("graticule", graticuleColor);
    }

    const graticuleWidth = Number(parsed?.graticule?.width);
    if (Number.isFinite(graticuleWidth)) {
      graticuleStyleState.width = clamp(graticuleWidth, 0.4, 3);
    }

    const graticuleOpacity = Number(parsed?.graticule?.opacity);
    if (Number.isFinite(graticuleOpacity)) {
      graticuleStyleState.opacity = clamp(graticuleOpacity, 0, 1);
    }

    const landColor = normalizeHexColor(parsed?.earth?.land?.color);
    if (landColor) {
      setColorControlValue("land", landColor);
    }

    const waterColor = normalizeHexColor(parsed?.earth?.water?.color);
    if (waterColor) {
      setColorControlValue("water", waterColor);
    }
  } catch (error) {
    // Ignore invalid persisted data.
  }
}

function saveViewState() {
  try {
    window.localStorage?.setItem(
      VIEW_STATE_STORAGE_KEY,
      JSON.stringify({
        projection: projectionState.selectedProjection,
        zoom: zoomState.scale,
        rotationOffset: {
          lambda: rotationOffset.lambda,
          phi: rotationOffset.phi,
        },
        flatProjectionPanOffsets,
        layers: {
          earth: layerState.earth,
          empires: layerState.empires,
          borders: layerState.borders,
          graticule: layerState.graticule,
          tissot: layerState.tissot,
        },
        empireSublayers: {
          ...empireLayerState,
        },
        empireQuality: {
          ...empireQualityState,
        },
        month: temporalState.selectedMonth,
      }),
    );
  } catch (error) {
    // Ignore persistence failures and keep runtime state.
  }
}

function scheduleViewStateSave() {
  if (viewStateSaveTimer !== null) {
    window.clearTimeout(viewStateSaveTimer);
  }

  viewStateSaveTimer = window.setTimeout(() => {
    viewStateSaveTimer = null;
    saveViewState();
  }, 60);
}

function loadViewState() {
  try {
    const stored = window.localStorage?.getItem(VIEW_STATE_STORAGE_KEY);
    if (!stored) {
      return;
    }

    const parsed = JSON.parse(stored);
    projectionState.selectedProjection = normalizeProjectionSelection(parsed?.projection);

    const zoom = Number(parsed?.zoom);
    if (Number.isFinite(zoom)) {
      zoomState.scale = clampZoomScale(zoom);
    }

    const lambda = Number(parsed?.rotationOffset?.lambda);
    const phi = Number(parsed?.rotationOffset?.phi);
    if (Number.isFinite(lambda)) {
      rotationOffset.lambda = lambda;
    }
    if (Number.isFinite(phi)) {
      rotationOffset.phi = clamp(phi, -getProjectionPhiClampRange(), getProjectionPhiClampRange());
    }

    if (parsed?.flatProjectionPanOffsets && typeof parsed.flatProjectionPanOffsets === "object") {
      Object.keys(flatProjectionPanOffsets).forEach((projectionKey) => {
        const offset = parsed.flatProjectionPanOffsets?.[projectionKey];
        const x = Number(offset?.x);
        const y = Number(offset?.y);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          flatProjectionPanOffsets[projectionKey] = { x, y };
        }
      });
    }

    if (parsed?.layers && typeof parsed.layers === "object") {
      Object.keys(layerState).forEach((key) => {
        if (typeof parsed.layers[key] === "boolean") {
          layerState[key] = parsed.layers[key];
        }
      });
    }

    if (parsed?.empireSublayers && typeof parsed.empireSublayers === "object") {
      Object.keys(empireLayerState).forEach((key) => {
        if (typeof parsed.empireSublayers[key] === "boolean") {
          empireLayerState[key] = parsed.empireSublayers[key];
        }
      });
    }

    if (parsed?.empireQuality && typeof parsed.empireQuality === "object") {
      Object.keys(empireQualityState).forEach((key) => {
        if (EMPIRE_QUALITY_LEVELS.includes(parsed.empireQuality[key])) {
          empireQualityState[key] = parsed.empireQuality[key];
        }
      });
    }

    const month = String(parsed?.month ?? "");
    if (/^\d{2}$/.test(month)) {
      temporalState.selectedMonth = month;
    }
  } catch (error) {
    // Ignore invalid persisted data.
  }
}

function hsvToHex(hue, saturation, value) {
  const h = ((hue % 360) + 360) % 360;
  const s = clamp(saturation, 0, 1);
  const v = clamp(value, 0, 1);
  const chroma = v * s;
  const hueSection = h / 60;
  const x = chroma * (1 - Math.abs((hueSection % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSection >= 0 && hueSection < 1) {
    red = chroma;
    green = x;
  } else if (hueSection < 2) {
    red = x;
    green = chroma;
  } else if (hueSection < 3) {
    green = chroma;
    blue = x;
  } else if (hueSection < 4) {
    green = x;
    blue = chroma;
  } else if (hueSection < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const match = v - chroma;
  const toHex = (channel) => Math.round((channel + match) * 255).toString(16).padStart(2, "0");
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}

function hexToHsv(hexColor) {
  const normalized = normalizeHexColor(hexColor);
  if (!normalized) {
    return null;
  }

  const red = Number.parseInt(normalized.slice(1, 3), 16) / 255;
  const green = Number.parseInt(normalized.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === red) {
      hue = 60 * (((green - blue) / delta) % 6);
    } else if (max === green) {
      hue = 60 * (((blue - red) / delta) + 2);
    } else {
      hue = 60 * (((red - green) / delta) + 4);
    }
  }

  if (hue < 0) {
    hue += 360;
  }

  return {
    hue,
    saturation: max === 0 ? 0 : delta / max,
    value: max,
  };
}

function getColorControlConfig(controlId) {
  const configs = {
    border: {
      storageKey: BORDER_COLOR_STORAGE_KEY,
      datasetKey: "borderColor",
      paletteOpenKey: "isBorderColorPaletteOpen",
      input: borderColorInput,
      value: borderColorValue,
      inlineDot: borderColorInlineDot,
      swatchButton: borderColorSwatchButton,
      customs: borderColorCustoms,
      presetButtons: borderColorPresetButtons,
      panel: borderColorPanel,
      field: borderColorField,
      fieldHandle: borderColorFieldHandle,
      hueSlider: borderColorHueSlider,
      hueHandle: borderColorHueHandle,
      addButton: borderColorAddButton,
    },
    graticule: {
      storageKey: GRATICULE_COLOR_STORAGE_KEY,
      datasetKey: "graticuleColor",
      paletteOpenKey: "isGraticuleColorPaletteOpen",
      input: graticuleColorInput,
      value: graticuleColorValue,
      inlineDot: graticuleColorInlineDot,
      swatchButton: graticuleColorSwatchButton,
      customs: graticuleColorCustoms,
      presetButtons: graticuleColorPresetButtons,
      panel: graticuleColorPanel,
      field: graticuleColorField,
      fieldHandle: graticuleColorFieldHandle,
      hueSlider: graticuleColorHueSlider,
      hueHandle: graticuleColorHueHandle,
      addButton: graticuleColorAddButton,
    },
    land: {
      storageKey: LAND_COLOR_STORAGE_KEY,
      datasetKey: "landColor",
      paletteOpenKey: "isLandColorPaletteOpen",
      input: landColorInput,
      value: landColorValue,
      inlineDot: landColorInlineDot,
      swatchButton: landColorSwatchButton,
      customs: landColorCustoms,
      presetButtons: landColorPresetButtons,
      panel: landColorPanel,
      field: landColorField,
      fieldHandle: landColorFieldHandle,
      hueSlider: landColorHueSlider,
      hueHandle: landColorHueHandle,
      addButton: landColorAddButton,
    },
    water: {
      storageKey: WATER_COLOR_STORAGE_KEY,
      datasetKey: "waterColor",
      paletteOpenKey: "isWaterColorPaletteOpen",
      input: waterColorInput,
      value: waterColorValue,
      inlineDot: waterColorInlineDot,
      swatchButton: waterColorSwatchButton,
      customs: waterColorCustoms,
      presetButtons: waterColorPresetButtons,
      panel: waterColorPanel,
      field: waterColorField,
      fieldHandle: waterColorFieldHandle,
      hueSlider: waterColorHueSlider,
      hueHandle: waterColorHueHandle,
      addButton: waterColorAddButton,
    },
  };
  return configs[controlId];
}

function getColorStyleState(controlId) {
  if (controlId === "border") {
    return borderStyleState;
  }
  if (controlId === "graticule") {
    return graticuleStyleState;
  }
  if (controlId === "land") {
    return earthStyleState.land;
  }
  if (controlId === "water") {
    return earthStyleState.water;
  }
  return null;
}

function getCustomColorList(controlId) {
  if (controlId === "border") return customBorderColors;
  if (controlId === "graticule") return customGraticuleColors;
  if (controlId === "land") return customLandColors;
  if (controlId === "water") return customWaterColors;
  return [];
}

function setCustomColorList(controlId, colors) {
  if (controlId === "border") customBorderColors = colors;
  if (controlId === "graticule") customGraticuleColors = colors;
  if (controlId === "land") customLandColors = colors;
  if (controlId === "water") customWaterColors = colors;
}

function saveCustomColors(controlId) {
  const config = getColorControlConfig(controlId);
  try {
    window.localStorage?.setItem(config.storageKey, JSON.stringify(getCustomColorList(controlId)));
  } catch (error) {
    // Ignore persistence failures and keep the runtime state.
  }
}

function clearColorRemovePressTimer(controlId) {
  const runtime = colorControlRuntimeState[controlId];
  if (runtime.removePressTimer !== null) {
    window.clearTimeout(runtime.removePressTimer);
    runtime.removePressTimer = null;
  }
}

function hideCustomColorRemoveButton(controlId) {
  const runtime = colorControlRuntimeState[controlId];
  runtime.removeTarget?.classList.remove("is-remove-visible");
  runtime.removeTarget = null;
}

function getColorDatasetSelector(config) {
  return config.datasetKey.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function setColorControlValue(controlId, colorHex) {
  const normalizedColor = normalizeHexColor(colorHex);
  const style = getColorStyleState(controlId);
  if (!normalizedColor || !style) {
    return false;
  }

  const hsv = hexToHsv(normalizedColor);
  style.color = normalizedColor;
  if (hsv) {
    style.hue = hsv.hue;
    style.saturation = hsv.saturation;
    style.value = hsv.value;
  }
  saveStyleSettings();
  return true;
}

function setColorControlFromField(controlId, clientX, clientY) {
  const config = getColorControlConfig(controlId);
  const style = getColorStyleState(controlId);
  if (!config?.field || !style) {
    return;
  }
  const rect = config.field.getBoundingClientRect();
  style.saturation = clamp((clientX - rect.left) / rect.width, 0, 1);
  style.value = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
  style.color = hsvToHex(style.hue, style.saturation, style.value);
}

function setColorControlFromHueSlider(controlId, clientX) {
  const config = getColorControlConfig(controlId);
  const style = getColorStyleState(controlId);
  if (!config?.hueSlider || !style) {
    return;
  }
  const rect = config.hueSlider.getBoundingClientRect();
  style.hue = clamp((clientX - rect.left) / rect.width, 0, 1) * 360;
  style.color = hsvToHex(style.hue, style.saturation, style.value);
}

function createCustomColorButton(controlId, color) {
  const config = getColorControlConfig(controlId);
  const runtime = colorControlRuntimeState[controlId];
  const wrapper = document.createElement("div");
  wrapper.className = "layer-inline-color-custom";

  const button = document.createElement("button");
  button.className = "layer-inline-color-button layer-inline-color-choice";
  button.type = "button";
  button.dataset[config.datasetKey] = color;
  button.setAttribute("aria-label", `Custom color ${color}`);
  wrapper.appendChild(button);

  const dot = document.createElement("span");
  dot.className = "layer-inline-color-dot";
  dot.style.setProperty("--layer-active-color", color);
  dot.setAttribute("aria-hidden", "true");
  button.appendChild(dot);

  const removeButton = document.createElement("button");
  removeButton.className = "layer-inline-color-remove";
  removeButton.type = "button";
  removeButton.textContent = "−";
  removeButton.setAttribute("aria-label", `Remove custom color ${color}`);
  wrapper.appendChild(removeButton);

  button.addEventListener("click", () => {
    if (runtime.longPressTriggered) {
      runtime.longPressTriggered = false;
      return;
    }
    if (!setColorControlValue(controlId, color)) {
      return;
    }
    syncColorControlUi(controlId);
    drawAtlas();
  });

  const startLongPress = () => {
    clearColorRemovePressTimer(controlId);
    runtime.longPressTriggered = false;
    runtime.removePressTimer = window.setTimeout(() => {
      if (runtime.removeTarget && runtime.removeTarget !== wrapper) {
        runtime.removeTarget.classList.remove("is-remove-visible");
      }
      runtime.removeTarget = wrapper;
      runtime.removeTarget.classList.add("is-remove-visible");
      runtime.longPressTriggered = true;
      runtime.removePressTimer = null;
    }, 300);
  };

  const cancelLongPress = () => {
    clearColorRemovePressTimer(controlId);
  };

  button.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    startLongPress();
  });
  button.addEventListener("pointerup", cancelLongPress);
  button.addEventListener("pointerleave", cancelLongPress);
  button.addEventListener("pointercancel", cancelLongPress);
  button.addEventListener("touchstart", startLongPress, { passive: true });
  button.addEventListener("touchend", cancelLongPress, { passive: true });
  button.addEventListener("touchcancel", cancelLongPress, { passive: true });
  button.addEventListener("contextmenu", (event) => event.preventDefault());

  removeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setCustomColorList(controlId, getCustomColorList(controlId).filter((entry) => entry !== color));
    saveCustomColors(controlId);
    hideCustomColorRemoveButton(controlId);
    renderCustomColors(controlId);
    syncColorControlUi(controlId);
  });

  return wrapper;
}

function renderCustomColors(controlId) {
  const config = getColorControlConfig(controlId);
  if (!config?.customs) {
    return;
  }
  config.customs.replaceChildren(
    ...getCustomColorList(controlId).map((color) => createCustomColorButton(controlId, color)),
  );
}

function revealCustomColor(controlId, color) {
  const config = getColorControlConfig(controlId);
  const matchingButton = config?.customs?.querySelector(
    `.layer-inline-color-choice[data-${getColorDatasetSelector(config)}="${color}"]`,
  );
  if (!(matchingButton instanceof HTMLElement)) {
    return null;
  }
  matchingButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  return matchingButton;
}

function revealPresetColor(controlId, color) {
  const config = getColorControlConfig(controlId);
  const matchingButton = config?.presetButtons?.find(
    (button) => button.dataset[config.datasetKey]?.toUpperCase() === color.toUpperCase(),
  );
  if (!(matchingButton instanceof HTMLElement)) {
    return null;
  }
  matchingButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  return matchingButton;
}

function flashColorFeedback(controlId, button) {
  if (!button) {
    return;
  }
  const runtime = colorControlRuntimeState[controlId];
  if (runtime.duplicateFlashTimer !== null) {
    window.clearTimeout(runtime.duplicateFlashTimer);
  }
  runtime.duplicateFlashButton?.classList.remove("is-duplicate-flash");
  runtime.duplicateFlashButton = button;
  runtime.duplicateFlashButton.classList.add("is-duplicate-flash");
  runtime.duplicateFlashTimer = window.setTimeout(() => {
    runtime.duplicateFlashButton?.classList.remove("is-duplicate-flash");
    runtime.duplicateFlashButton = null;
    runtime.duplicateFlashTimer = null;
  }, 820);
}

function syncBorderGroupUi() {
  const bordersButton = document.querySelector('[data-layer-id="borders"]');
  const borderControls = document.getElementById("borderLayerControls");

  borderLayerGroup?.classList.toggle("is-active", layerState.borders);
  borderLayerGroup?.classList.toggle("is-open", uiState.isBorderGroupOpen);
  borderGroupToggle?.setAttribute("aria-expanded", String(uiState.isBorderGroupOpen));
  bordersButton?.classList.toggle("is-active", layerState.borders);

  if (borderControls) {
    borderControls.style.maxHeight = uiState.isBorderGroupOpen ? `${borderControls.scrollHeight}px` : "0px";
  }

  if (borderWidthInput) {
    borderWidthInput.value = String(borderStyleState.width);
  }
  if (borderWidthValue) {
    borderWidthValue.textContent = formatBorderWidthLabel(borderStyleState.width);
  }
  const borderOpacityPercent = Math.round(clamp(borderStyleState.opacity, 0, 1) * 100);
  if (borderOpacityInput) {
    borderOpacityInput.value = String(borderOpacityPercent);
  }
  if (borderColorInput) {
    borderColorInput.value = borderStyleState.color.toUpperCase();
  }
  if (borderColorValue) {
    borderColorValue.textContent = borderStyleState.color.toUpperCase();
  }
  borderColorInlineDot?.style.setProperty("--layer-active-color", borderStyleState.color);
  borderColorFieldHandle?.style.setProperty("--layer-active-color", borderStyleState.color);
  borderColorField?.style.setProperty("--layer-color-field-hue", hsvToHex(borderStyleState.hue, 1, 1));
  borderColorField?.style.setProperty("--layer-color-field-x", `${clamp(borderStyleState.saturation, 0, 1) * 100}%`);
  borderColorField?.style.setProperty("--layer-color-field-y", `${(1 - clamp(borderStyleState.value, 0, 1)) * 100}%`);
  borderColorHueHandle?.style.setProperty("--layer-color-field-hue", hsvToHex(borderStyleState.hue, 1, 1));
  borderColorHueSlider?.style.setProperty("--layer-color-hue-x", `${(borderStyleState.hue / 360) * 100}%`);
  borderColorSwatchButton?.setAttribute("aria-expanded", String(uiState.isBorderColorPaletteOpen));
  borderColorPanel?.closest(".layer-control-color")?.classList.toggle("is-panel-open", uiState.isBorderColorPaletteOpen);
  borderColorPanel?.setAttribute("aria-hidden", String(!uiState.isBorderColorPaletteOpen));
  borderColorPresetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.borderColor?.toUpperCase() === borderStyleState.color.toUpperCase());
  });
  borderColorCustoms?.querySelectorAll(".layer-inline-color-choice").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.borderColor?.toUpperCase() === borderStyleState.color.toUpperCase());
  });
}

function syncGraticuleGroupUi() {
  const graticuleButton = document.querySelector('#graticuleLayerGroup [data-layer-id="graticule"]');
  const graticuleControls = document.getElementById("graticuleLayerControls");

  graticuleLayerGroup?.classList.toggle("is-active", layerState.graticule);
  graticuleLayerGroup?.classList.toggle("is-open", uiState.isGraticuleGroupOpen);
  graticuleGroupToggle?.setAttribute("aria-expanded", String(uiState.isGraticuleGroupOpen));
  graticuleButton?.classList.toggle("is-active", layerState.graticule);

  if (graticuleControls) {
    graticuleControls.style.maxHeight = uiState.isGraticuleGroupOpen ? `${graticuleControls.scrollHeight}px` : "0px";
  }

  if (graticuleWidthInput) {
    graticuleWidthInput.value = String(graticuleStyleState.width);
  }
  if (graticuleWidthValue) {
    graticuleWidthValue.textContent = formatBorderWidthLabel(graticuleStyleState.width);
  }
  if (graticuleOpacityInput) {
    graticuleOpacityInput.value = String(Math.round(clamp(graticuleStyleState.opacity, 0, 1) * 100));
  }

  syncColorControlUi("graticule");
}

function syncColorControlUi(controlId) {
  const config = getColorControlConfig(controlId);
  const style = getColorStyleState(controlId);
  if (!config || !style) {
    return;
  }

  config.input && (config.input.value = style.color.toUpperCase());
  config.value && (config.value.textContent = style.color.toUpperCase());
  config.inlineDot?.style.setProperty("--layer-active-color", style.color);
  config.fieldHandle?.style.setProperty("--layer-active-color", style.color);
  config.field?.style.setProperty("--layer-color-field-hue", hsvToHex(style.hue, 1, 1));
  config.field?.style.setProperty("--layer-color-field-x", `${clamp(style.saturation, 0, 1) * 100}%`);
  config.field?.style.setProperty("--layer-color-field-y", `${(1 - clamp(style.value, 0, 1)) * 100}%`);
  config.hueHandle?.style.setProperty("--layer-color-field-hue", hsvToHex(style.hue, 1, 1));
  config.hueSlider?.style.setProperty("--layer-color-hue-x", `${(style.hue / 360) * 100}%`);
  config.swatchButton?.setAttribute("aria-expanded", String(uiState[config.paletteOpenKey]));
  config.panel?.closest(".layer-control-color")?.classList.toggle("is-panel-open", uiState[config.paletteOpenKey]);
  config.panel?.setAttribute("aria-hidden", String(!uiState[config.paletteOpenKey]));
  config.presetButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset[config.datasetKey]?.toUpperCase() === style.color.toUpperCase());
  });
  config.customs?.querySelectorAll(".layer-inline-color-choice").forEach((button) => {
    button.classList.toggle("is-active", button.dataset[config.datasetKey]?.toUpperCase() === style.color.toUpperCase());
  });
}

function syncEarthGroupUi() {
  const earthControls = document.getElementById("earthLayerControls");

  earthLayerGroup?.classList.add("is-active");
  earthLayerGroup?.classList.toggle("is-open", uiState.isEarthGroupOpen);
  earthGroupButton?.classList.add("is-active");
  earthGroupToggle?.setAttribute("aria-expanded", String(uiState.isEarthGroupOpen));
  if (earthControls) {
    earthControls.style.maxHeight = uiState.isEarthGroupOpen ? `${earthControls.scrollHeight}px` : "0px";
  }
  syncColorControlUi("land");
  syncColorControlUi("water");
}

function setColorControlPreviewState(controlId, previewTarget) {
  const config = getColorControlConfig(controlId);
  const control = config?.panel?.closest(".layer-control-color");
  const isPreviewing = Boolean(previewTarget);
  control?.classList.toggle("is-previewing-color", isPreviewing);
  control?.classList.toggle("is-previewing-field", previewTarget === "field");
  control?.classList.toggle("is-previewing-hue", previewTarget === "hue");
  layerPanel?.classList.toggle("is-color-previewing", isPreviewing);
}

function setOpacityPreviewState(isPreviewing) {
  const opacityControl = borderOpacityInput?.closest(".layer-opacity-control");
  opacityControl?.classList.toggle("is-previewing-opacity", Boolean(isPreviewing));
  layerPanel?.classList.toggle("is-color-previewing", Boolean(isPreviewing));
}

function setBorderWidthPreviewState(isPreviewing) {
  const widthControl = borderWidthInput?.closest(".layer-control");
  widthControl?.classList.toggle("is-previewing-width", Boolean(isPreviewing));
  layerPanel?.classList.toggle("is-color-previewing", Boolean(isPreviewing));
}

function setGraticuleWidthPreviewState(isPreviewing) {
  const widthControl = graticuleWidthInput?.closest(".layer-control");
  widthControl?.classList.toggle("is-previewing-width", Boolean(isPreviewing));
  layerPanel?.classList.toggle("is-color-previewing", Boolean(isPreviewing));
}

function setGraticuleOpacityPreviewState(isPreviewing) {
  const opacityControl = graticuleOpacityInput?.closest(".layer-opacity-control");
  opacityControl?.classList.toggle("is-previewing-opacity", Boolean(isPreviewing));
  layerPanel?.classList.toggle("is-color-previewing", Boolean(isPreviewing));
}

function enableSharedColorControl(controlId) {
  const config = getColorControlConfig(controlId);
  const runtime = colorControlRuntimeState[controlId];
  renderCustomColors(controlId);

  config.input?.addEventListener("input", () => {
    const draftValue = normalizeHexDraftValue(config.input.value);
    config.input.value = draftValue;
    const normalizedColor = normalizeHexColor(draftValue);
    if (!normalizedColor || !setColorControlValue(controlId, normalizedColor)) {
      return;
    }
    syncColorControlUi(controlId);
    drawAtlas();
  });

  config.input?.addEventListener("blur", () => {
    config.input.value = getColorStyleState(controlId).color.toUpperCase();
  });

  config.swatchButton?.addEventListener("click", () => {
    uiState[config.paletteOpenKey] = !uiState[config.paletteOpenKey];
    syncColorControlUi(controlId);
    syncLayerPanelScrollbar();
    showLayerPanelScrollbarTemporarily();
  });

  config.presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!setColorControlValue(controlId, button.dataset[config.datasetKey])) {
        return;
      }
      syncColorControlUi(controlId);
      drawAtlas();
    });
  });

  config.field?.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    runtime.fieldDragState = { pointerId: event.pointerId };
    config.field.setPointerCapture?.(event.pointerId);
    setColorControlPreviewState(controlId, "field");
    if (layerPanelScroll) {
      layerPanelScroll.style.overflowY = "hidden";
    }
    setColorControlFromField(controlId, event.clientX, event.clientY);
    syncColorControlUi(controlId);
    drawAtlas();
  });

  config.field?.addEventListener("pointermove", (event) => {
    if (!runtime.fieldDragState || event.pointerId !== runtime.fieldDragState.pointerId) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setColorControlFromField(controlId, event.clientX, event.clientY);
    syncColorControlUi(controlId);
    drawAtlas();
  });

  const endFieldDrag = (event) => {
    if (!runtime.fieldDragState || event.pointerId !== runtime.fieldDragState.pointerId) {
      return;
    }
    config.field.releasePointerCapture?.(event.pointerId);
    runtime.fieldDragState = null;
    setColorControlPreviewState(controlId, null);
    if (layerPanelScroll) {
      layerPanelScroll.style.overflowY = "";
    }
  };
  config.field?.addEventListener("pointerup", endFieldDrag);
  config.field?.addEventListener("pointercancel", endFieldDrag);

  config.hueSlider?.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    runtime.hueDragState = { pointerId: event.pointerId };
    config.hueSlider.setPointerCapture?.(event.pointerId);
    setColorControlPreviewState(controlId, "hue");
    setColorControlFromHueSlider(controlId, event.clientX);
    syncColorControlUi(controlId);
    drawAtlas();
  });

  config.hueSlider?.addEventListener("pointermove", (event) => {
    if (!runtime.hueDragState || event.pointerId !== runtime.hueDragState.pointerId) {
      return;
    }
    event.preventDefault();
    setColorControlFromHueSlider(controlId, event.clientX);
    syncColorControlUi(controlId);
    drawAtlas();
  });

  const endHueDrag = (event) => {
    if (!runtime.hueDragState || event.pointerId !== runtime.hueDragState.pointerId) {
      return;
    }
    config.hueSlider.releasePointerCapture?.(event.pointerId);
    runtime.hueDragState = null;
    setColorControlPreviewState(controlId, null);
  };
  config.hueSlider?.addEventListener("pointerup", endHueDrag);
  config.hueSlider?.addEventListener("pointercancel", endHueDrag);

  config.addButton?.addEventListener("click", () => {
    const normalizedColor = normalizeHexColor(getColorStyleState(controlId).color);
    if (!normalizedColor) {
      return;
    }
    const presetButton = revealPresetColor(controlId, normalizedColor);
    if (presetButton) {
      flashColorFeedback(controlId, presetButton);
      return;
    }
    setCustomColorList(
      controlId,
      [normalizedColor, ...getCustomColorList(controlId).filter((color) => color !== normalizedColor)]
        .slice(0, MAX_CUSTOM_BORDER_COLORS),
    );
    saveCustomColors(controlId);
    renderCustomColors(controlId);
    syncColorControlUi(controlId);
    const customButton = revealCustomColor(controlId, normalizedColor);
    if (customButton) {
      flashColorFeedback(controlId, customButton);
    }
  });

  document.addEventListener("click", (event) => {
    if (!uiState[config.paletteOpenKey]) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    const colorControl = config.panel?.closest(".layer-control-color");
    if (colorControl?.contains(target)) {
      return;
    }
    uiState[config.paletteOpenKey] = false;
    syncColorControlUi(controlId);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (colorControlRuntimeState[controlId].removeTarget?.contains(target)) {
      return;
    }
    hideCustomColorRemoveButton(controlId);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && uiState[config.paletteOpenKey]) {
      uiState[config.paletteOpenKey] = false;
      syncColorControlUi(controlId);
    }
  });
}

function enableBorderStyleControls() {
  enableSharedColorControl("border");

  borderWidthInput?.addEventListener("input", () => {
    const nextWidth = Number.parseFloat(borderWidthInput.value);
    if (!Number.isFinite(nextWidth)) {
      return;
    }

    borderStyleState.width = nextWidth;
    saveStyleSettings();
    syncBorderGroupUi();
    drawAtlas();
  });

  borderWidthInput?.addEventListener("pointerdown", () => {
    setBorderWidthPreviewState(true);
  });

  const endBorderWidthPreview = () => {
    setBorderWidthPreviewState(false);
  };

  borderWidthInput?.addEventListener("pointerup", endBorderWidthPreview);
  borderWidthInput?.addEventListener("pointercancel", endBorderWidthPreview);
  borderWidthInput?.addEventListener("touchend", endBorderWidthPreview, { passive: true });
  borderWidthInput?.addEventListener("touchcancel", endBorderWidthPreview, { passive: true });

  const applyBorderOpacityPercent = (value) => {
    const nextPercent = clampOpacityPercent(value);
    borderStyleState.opacity = nextPercent / 100;
    saveStyleSettings();
    syncBorderGroupUi();
    drawAtlas();
  };

  borderOpacityInput?.addEventListener("input", () => {
    applyBorderOpacityPercent(borderOpacityInput.value);
  });

  borderOpacityInput?.addEventListener("pointerdown", () => {
    setOpacityPreviewState(true);
  });

  const endOpacityPreview = () => {
    setOpacityPreviewState(false);
  };

  borderOpacityInput?.addEventListener("pointerup", endOpacityPreview);
  borderOpacityInput?.addEventListener("pointercancel", endOpacityPreview);
  borderOpacityInput?.addEventListener("touchend", endOpacityPreview, { passive: true });
  borderOpacityInput?.addEventListener("touchcancel", endOpacityPreview, { passive: true });
}

function enableGraticuleStyleControls() {
  enableSharedColorControl("graticule");

  graticuleWidthInput?.addEventListener("input", () => {
    const nextWidth = Number.parseFloat(graticuleWidthInput.value);
    if (!Number.isFinite(nextWidth)) {
      return;
    }

    graticuleStyleState.width = nextWidth;
    saveStyleSettings();
    syncGraticuleGroupUi();
    drawAtlas();
  });

  graticuleWidthInput?.addEventListener("pointerdown", () => {
    setGraticuleWidthPreviewState(true);
  });

  const endGraticuleWidthPreview = () => {
    setGraticuleWidthPreviewState(false);
  };

  graticuleWidthInput?.addEventListener("pointerup", endGraticuleWidthPreview);
  graticuleWidthInput?.addEventListener("pointercancel", endGraticuleWidthPreview);
  graticuleWidthInput?.addEventListener("touchend", endGraticuleWidthPreview, { passive: true });
  graticuleWidthInput?.addEventListener("touchcancel", endGraticuleWidthPreview, { passive: true });

  const applyGraticuleOpacityPercent = (value) => {
    const nextPercent = clampOpacityPercent(value);
    graticuleStyleState.opacity = nextPercent / 100;
    saveStyleSettings();
    syncGraticuleGroupUi();
    drawAtlas();
  };

  graticuleOpacityInput?.addEventListener("input", () => {
    applyGraticuleOpacityPercent(graticuleOpacityInput.value);
  });

  graticuleOpacityInput?.addEventListener("pointerdown", () => {
    setGraticuleOpacityPreviewState(true);
  });

  const endGraticuleOpacityPreview = () => {
    setGraticuleOpacityPreviewState(false);
  };

  graticuleOpacityInput?.addEventListener("pointerup", endGraticuleOpacityPreview);
  graticuleOpacityInput?.addEventListener("pointercancel", endGraticuleOpacityPreview);
  graticuleOpacityInput?.addEventListener("touchend", endGraticuleOpacityPreview, { passive: true });
  graticuleOpacityInput?.addEventListener("touchcancel", endGraticuleOpacityPreview, { passive: true });
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
    projectionPickerButton?.focus();
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
  if (!projectionPickerButton || !projectionPickerList) {
    return;
  }

  projectionState.selectedProjection = normalizeProjectionSelection(projectionState.selectedProjection);
  syncProjectionPicker();
  syncProjectionSwitcher();

  projectionPickerButton.addEventListener("click", () => {
    setProjectionMenuOpen(!uiState.isProjectionMenuOpen);
  });

  projectionOptionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setProjectionMenuOpen(false);
      setProjectionFromPickerValue(button.dataset.projectionOption);
    });
  });

  document.addEventListener("click", (event) => {
    if (!uiState.isProjectionMenuOpen) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (projectionPicker?.contains(target)) {
      return;
    }

    setProjectionMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !uiState.isProjectionMenuOpen) {
      return;
    }

    setProjectionMenuOpen(false);
    releaseLayerPanelFocusAfterPointerInteraction(projectionPickerButton);
  });
}

function setProjectionFromPickerValue(projectionKind) {
  projectionState.selectedProjection = normalizeProjectionSelection(projectionKind);
  syncProjectionPicker();
  zoomState.scale = clampZoomScale(zoomState.scale);
  syncFlatProjectionPanOffset();
  syncProjectionSwitcher();
  scheduleViewStateSave();
  releaseLayerPanelFocusAfterPointerInteraction(projectionPickerButton);
  handleResize();
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
      scheduleViewStateSave();
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

  configureEmpireCanvas(viewDimensions, pixelRatio);
  overlayContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  lastEmpireRenderKey = null;
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
