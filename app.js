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
const romanEmpireLayerGroup = document.getElementById("romanEmpireLayerGroup");
const romanEmpireRow = document.getElementById("romanEmpireRow");
const romanEmpireGroupToggle = document.getElementById("romanEmpireGroupToggle");
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
const romanEmpireFillColorInput = document.getElementById("romanEmpireFillColorInput");
const romanEmpireFillColorValue = document.getElementById("romanEmpireFillColorValue");
const romanEmpireFillColorInlineDot = document.getElementById("romanEmpireFillColorInlineDot");
const romanEmpireFillColorSwatchButton = document.getElementById("romanEmpireFillColorSwatchButton");
const romanEmpireFillColorCustoms = document.getElementById("romanEmpireFillColorCustoms");
const romanEmpireFillColorPresetButtons = Array.from(document.querySelectorAll("[data-roman-empire-fill-color]"));
const romanEmpireFillColorPanel = document.getElementById("romanEmpireFillColorPanel");
const romanEmpireFillColorField = document.getElementById("romanEmpireFillColorField");
const romanEmpireFillColorFieldHandle = document.getElementById("romanEmpireFillColorFieldHandle");
const romanEmpireFillColorHueSlider = document.getElementById("romanEmpireFillColorHueSlider");
const romanEmpireFillColorHueHandle = document.getElementById("romanEmpireFillColorHueHandle");
const romanEmpireFillColorAddButton = document.getElementById("romanEmpireFillColorAddButton");
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
const {
  createDefaultBorderStyleState,
  createDefaultEarthStyleState,
  createDefaultEmpireLayerState,
  createDefaultEmpireQualityState,
  createDefaultEmpireStyleState,
  createDefaultGraticuleStyleState,
  createDefaultLayerState,
  empireQualityLevels,
} = window.AtlasLayersRegistry;
const { createAppState } = window.AtlasAppState;
const {
  setAllEmpireQuality,
  toggleEmpireSublayer,
  toggleLayerEnabled,
  toggleLayerGroupOpen,
} = window.AtlasAppActions;
const {
  createMapGestureController,
  createProjectionSwitcherController,
} = window.AtlasGestures;
const { createRenderInvalidationManager } = window.AtlasRenderState;
const { createRenderer } = window.AtlasRenderer;
const colorModel = window.AtlasColorModel;
const { bindSharedColorControl } = window.AtlasColorControls;
const layerBodyComposer = window.AtlasLayerBodyComposer;
const layerPanelUi = window.AtlasLayerPanel;
const layerPanelController = window.AtlasLayerPanelController;
const {
  hasAnyEmpireChildEnabled,
  isEmpireChildDisplayed,
  isEmpireParentActive,
} = window.AtlasLayerSelectors;

let worldData;
let assetManifest;
let earthTextureImage = null;
let glRenderer = null;
let rotationOffset = { lambda: 0, phi: 0 };
let pixelRatio = 1;
let lastEmpireRenderKey = null;
let currentEmpirePixelRatio = 1;
const earthTextureStore = window.AtlasLayers.createEarthTextureStore();
const renderInvalidation = createRenderInvalidationManager();
const renderer = createRenderer({ renderInvalidation });
const mobileLayerMenuMediaQuery = window.matchMedia("(max-width: 800px)");
const EMPIRE_INTERACTION_PIXEL_RATIO = 0.6;
const mapGestureController = createMapGestureController();
const projectionSwitcherController = createProjectionSwitcherController();
let refreshMenuPressTimer = null;
let refreshMenuLongPressTriggered = false;
let interactionSettleTimer = null;
let bootStagePosterSnapshotTimer = null;
let viewStateSaveTimer = null;
let layerScrollbarDragState = null;
let layerScrollbarFadeTimer = null;
let expandableLayoutFrame = null;
let expandableLayoutSettleTimer = null;
let layerPanelSavedScrollTop = 0;
const SHARED_CUSTOM_COLORS_STORAGE_KEY = "atlas.colors.customColors";
const LEGACY_CUSTOM_COLOR_STORAGE_KEYS = [
  "atlas.border.customColors",
  "atlas.graticule.customColors",
  "atlas.earth.land.customColors",
  "atlas.earth.water.customColors",
  "atlas.empires.roman.fill.customColors",
];
const STYLE_SETTINGS_STORAGE_KEY = "atlas.style.settings";
const VIEW_STATE_STORAGE_KEY = "atlas.view.state";
const MAX_CUSTOM_BORDER_COLORS = 10;
const BOOT_STAGE_POSTER_STORAGE_KEY = "atlas.bootViewportPoster";
let sharedCustomColors = [];
const flatProjectionPanOffsets = {
  "natural-earth-ii": { x: 0, y: 0 },
  "goode-homolosine": { x: 0, y: 0 },
  "waterman": { x: 0, y: 0 },
};

function getDefaultProjection() {
  return mobileLayerMenuMediaQuery.matches ? "orthographic" : "azimuthal-equidistant";
}

const appState = createAppState({
  getDefaultMonth,
  getDefaultProjection,
  createDefaultLayerState,
  createDefaultEmpireLayerState,
  createDefaultEmpireQualityState,
  createDefaultEarthStyleState,
  createDefaultBorderStyleState,
  createDefaultGraticuleStyleState,
  createDefaultEmpireStyleState,
});
const layerState = appState.layers;
const empireLayerState = appState.empireSublayers;
const empireQualityState = appState.empireQuality;
const temporalState = appState.temporal;
const projectionState = appState.projection;
const zoomState = appState.zoom;
const uiState = appState.ui;
const earthStyleState = appState.styles.earth;
const borderStyleState = appState.styles.borders;
const graticuleStyleState = appState.styles.graticule;
const empireStyleState = appState.styles.empires;
const colorControlRuntimeState = appState.controlRuntime;
const EMPIRE_QUALITY_LEVELS = empireQualityLevels;
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

projectionState.selectedProjection = normalizeProjectionSelection(projectionState.selectedProjection);
renderProjectionSwitcher(0);

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
  layerBodyComposer.composeLayerBodies({
    getBodyElement: getLayerBodyElement,
    getRowElement: getLayerRowElement,
  });
  sharedCustomColors = loadSharedCustomColors();
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
      empireStyles: empireStyleState,
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
  syncEmpireGroupUi();
  drawAtlas();
  document.documentElement.classList.remove("is-mobile-default-globe");
  enableDragging();
  enableZoomControls();
  enableLayerPanelToggle();
  enableLayerPanelScrollbar();
  enableExpandableLayoutAutoSync();
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

function getLayerBodyElement(layerId, bodySectionId) {
  if (!bodySectionId) {
    return null;
  }

  return document.getElementById(bodySectionId);
}

function getLayerRowElement(layerId, row) {
  return row?.rowElementId ? document.getElementById(row.rowElementId) : null;
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

  drawAtlas(["earth", "overlay", "poster"]);
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
    requestRender(["overlay", "empire", "poster"]);
  }, 140);
}

function drawAtlas(passes = ["all"]) {
  renderer.draw({
    passes: ["all"],
    render: (dirtyPasses) => {
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

      if (dirtyPasses.has("chrome")) {
        document.body.classList.toggle("is-viewport-stage", isViewportStage);
        stage.classList.toggle("is-single-globe", projectionState.selectedProjection === "orthographic");
        stage.classList.toggle("is-viewport-stage", isViewportStage);
        stage.classList.toggle("is-flat-projection", isFlatProjection);
        stage.classList.toggle("is-mercator", isMercator);
        stage.classList.toggle("is-natural-earth-ii", projectionState.selectedProjection === "natural-earth-ii");
        stage.classList.toggle("is-goode-homolosine", projectionState.selectedProjection === "goode-homolosine");
        stage.classList.toggle("is-waterman", projectionState.selectedProjection === "waterman");
        stage.classList.toggle("is-dymaxion", projectionState.selectedProjection === "dymaxion");
      }

      if (dirtyPasses.has("earth")) {
        drawEarthPass(scenes);
      }
      if (dirtyPasses.has("empire")) {
        drawEmpirePass(scenes);
      }
      if (dirtyPasses.has("overlay")) {
        drawOverlayPass(scenes);
      }
      if (dirtyPasses.has("poster")) {
        scheduleBootStagePosterSnapshot();
      }
    },
  });
}

function getEmpireRenderKey(scenes) {
  return JSON.stringify({
    projection: projectionState.selectedProjection,
    empiresEnabled: layerState.empires,
    empireSublayers: empireLayerState,
    empireStyles: empireStyleState,
    empireQuality: empireQualityState,
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
      return window.AtlasCore.getMercatorCenterLatitudeClamp(
        window.AtlasCore.getViewDimensions("mercator"),
        zoomState.scale,
      );
    default:
      return 28;
  }
}

function enableDragging() {
  mapGestureController.enableDragging({
    stage,
    d3,
    isWithinMonthControls,
    getSelectedProjection: () => projectionState.selectedProjection,
    usesFlatProjectionPan,
    getZoomScale: () => zoomState.scale,
    onFlatPan: (event) => {
      const currentOffset = getFlatProjectionPanOffset();
      flatProjectionPanOffsets[projectionState.selectedProjection] = clampFlatProjectionPanOffset({
        x: currentOffset.x + event.dx,
        y: currentOffset.y + event.dy,
      });
      markInteractionActivity();
      requestRender(["earth", "empire", "overlay", "poster"]);
    },
    onRotate: (event) => {
      const effectiveDragSensitivity = getEffectiveDragSensitivity();
      rotationOffset.lambda += event.dx * effectiveDragSensitivity;
      rotationOffset.phi -= event.dy * effectiveDragSensitivity * getMercatorPhiSensitivityMultiplier();
      const phiClampRange = getProjectionPhiClampRange();
      rotationOffset.phi = clamp(rotationOffset.phi, -phiClampRange, phiClampRange);
      markInteractionActivity();
      requestRender(["earth", "empire", "overlay", "poster"]);
    },
  });
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

  const previousScale = zoomState.scale;
  const clampedScale = clampZoomScale(nextScale);
  if (Math.abs(clampedScale - previousScale) < 0.001) {
    return;
  }

  zoomState.scale = clampedScale;
  if (usesFlatProjectionPan() && previousScale > 0) {
    const currentOffset = getFlatProjectionPanOffset();
    flatProjectionPanOffsets[projectionState.selectedProjection] = {
      x: currentOffset.x * (clampedScale / previousScale),
      y: currentOffset.y * (clampedScale / previousScale),
    };
  }
  syncFlatProjectionPanOffset();
  syncMobileMonthChrome();
  syncStageChrome();
  markInteractionActivity();
  requestRender(["chrome", "earth", "empire", "overlay", "poster"]);
}

function adjustZoomBy(delta) {
  setZoomScale(zoomState.scale * delta);
}

function enableZoomControls() {
  mapGestureController.enableZoomControls({
    documentTarget: document,
    mobileLayerMenuMediaQuery,
    canZoomCurrentProjection,
    isWithinInteractiveUi,
    getZoomScale: () => zoomState.scale,
    setZoomScale,
    adjustZoomBy,
  });
}

function enableLayerControls() {
  layerPanelController.bindLayerControls({
    layerButtons,
    empireLayerButtons,
    earthGroupButton,
    toggleElementsByLayerId: {
      earth: earthGroupToggle,
      empires: empireGroupToggle,
      borders: borderGroupToggle,
      graticule: graticuleGroupToggle,
      romanComparison: romanEmpireGroupToggle,
    },
    empireQualityInput,
    layerState,
    empireLayerState,
    empireQualityState,
    uiState,
    clamp,
    empireQualityLevels: EMPIRE_QUALITY_LEVELS,
    hasAnyEmpireChildEnabled,
    toggleLayerGroupOpen,
    toggleLayerEnabled,
    toggleEmpireSublayer,
    setAllEmpireQuality,
    syncEmpireGroupUi,
    syncBorderGroupUi,
    syncGraticuleGroupUi,
    syncEarthGroupUi,
    syncMobileMonthChrome,
    refreshEarthTexture,
    hasEarthTexture: () => Boolean(earthTextureImage),
    scheduleViewStateSave,
    drawForLayerToggle,
    drawForEmpireSublayerToggle,
    drawForEmpireQuality,
    releaseLayerPanelFocusAfterPointerInteraction,
    syncLayerPanelScrollbar,
    showLayerPanelScrollbarTemporarily,
    syncEmpireQualityUi,
    setEmpireQualityPreviewState: (isPreviewing) => {
      setSliderPreviewState(empireQualityInput, isPreviewing);
    },
    invalidateEmpireRenderCache: () => {
      lastEmpireRenderKey = null;
    },
    enableSharedColorControl,
    enableGraticuleStyleControls,
    enableBorderStyleControls,
  });
}

function setLayerPanelOpen(isOpen) {
  if (!isOpen && layerPanelScroll) {
    layerPanelSavedScrollTop = layerPanelScroll.scrollTop;
  }

  uiState.isLayerPanelOpen = isOpen;
  layerPanel?.classList.toggle("is-open", isOpen);
  layerMenuToggle?.classList.toggle("is-hidden", isOpen);
  layerMenuToggle?.setAttribute("aria-expanded", String(isOpen));

  if (isOpen && layerPanelScroll) {
    window.requestAnimationFrame(() => {
      layerPanelScroll.scrollTop = Math.max(0, Math.min(
        layerPanelSavedScrollTop,
        layerPanelScroll.scrollHeight - layerPanelScroll.clientHeight,
      ));
      syncLayerPanelScrollbar();
      showLayerPanelScrollbarTemporarily();
    });
  }

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

function scheduleExpandableLayoutSync() {
  if (expandableLayoutFrame !== null) {
    return;
  }

  expandableLayoutFrame = requestAnimationFrame(() => {
    expandableLayoutFrame = null;

    layerPanelUi.syncExpandableSections({
      uiState,
      empireSubLayers: document.getElementById("empireSubLayers"),
    });

    syncLayerPanelScrollbar();
    showLayerPanelScrollbarTemporarily();
  });
}

function scheduleExpandableLayoutSettleSync() {
  if (expandableLayoutSettleTimer !== null) {
    window.clearTimeout(expandableLayoutSettleTimer);
  }

  expandableLayoutSettleTimer = window.setTimeout(() => {
    expandableLayoutSettleTimer = null;
    scheduleExpandableLayoutSync();
  }, 0);
}

function enableExpandableLayoutAutoSync() {
  layerPanel?.addEventListener("transitionend", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (
      target.classList.contains("layer-sublist")
      || target.classList.contains("layer-color-panel")
      || target.classList.contains("layer-control")
      || target.classList.contains("layer-control-color")
    ) {
      scheduleExpandableLayoutSettleSync();
    }
  });
}

function syncColorControlParentSections(controlId) {
  if (
    controlId === "border"
    || controlId === "graticule"
    || controlId === "land"
    || controlId === "water"
    || controlId === "romanEmpireFill"
  ) {
    scheduleExpandableLayoutSync();
  }
}

function syncEmpireGroupUi() {
  layerPanelUi.syncEmpireGroupUi({
    layerState,
    empireLayerState,
    uiState,
    empireLayerGroup,
    empireGroupToggle,
    empiresButton: document.querySelector('[data-layer-id="empires"]'),
    empireLayerButtons,
    romanEmpireLayerGroup,
    romanEmpireRow,
    romanEmpireGroupToggle,
    isEmpireParentActive,
    isEmpireChildDisplayed,
    scheduleExpandableLayoutSync,
    syncColorControlUi,
  });
}


function formatBorderWidthLabel(width) {
  return `${width.toFixed(1)} px`;
}

function clampOpacityPercent(value) {
  return clamp(Number.parseInt(String(value ?? "0"), 10) || 0, 0, 100);
}

function getRenderPassesForColorControl(controlId) {
  switch (controlId) {
    case "land":
    case "water":
      return ["overlay", "poster"];
    case "romanEmpireFill":
      return ["empire", "poster"];
    case "border":
    case "graticule":
      return ["overlay", "poster"];
    default:
      return ["all"];
  }
}

function drawForColorControl(controlId) {
  drawAtlas(getRenderPassesForColorControl(controlId));
}

function drawForBorderStyle() {
  drawAtlas(["overlay", "poster"]);
}

function drawForGraticuleStyle() {
  drawAtlas(["overlay", "poster"]);
}

function drawForLayerToggle(layerId) {
  switch (layerId) {
    case "earth":
      drawAtlas(["earth", "overlay", "poster"]);
      return;
    case "empires":
      drawAtlas(["empire", "poster"]);
      return;
    case "borders":
    case "graticule":
    case "tissot":
      drawAtlas(["overlay", "poster"]);
      return;
    default:
      drawAtlas(["all"]);
  }
}

function drawForEmpireSublayerToggle() {
  drawAtlas(["empire", "poster"]);
}

function drawForEmpireQuality() {
  drawAtlas(["empire", "poster"]);
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

function loadSharedCustomColors() {
  const primary = loadStoredCustomColors(SHARED_CUSTOM_COLORS_STORAGE_KEY);
  if (primary.length > 0) {
    return primary;
  }

  const merged = [];
  LEGACY_CUSTOM_COLOR_STORAGE_KEYS.forEach((storageKey) => {
    loadStoredCustomColors(storageKey).forEach((color) => {
      if (!merged.includes(color)) {
        merged.push(color);
      }
    });
  });
  return merged.slice(0, MAX_CUSTOM_BORDER_COLORS);
}

function saveStyleSettings() {
  window.AtlasStatePersistence.saveStyleSettings({
    storage: window.localStorage,
    storageKey: STYLE_SETTINGS_STORAGE_KEY,
    borderStyleState,
    graticuleStyleState,
    earthStyleState,
    empireStyleState,
  });
}

function loadStyleSettings() {
  window.AtlasStatePersistence.loadStyleSettings({
    storage: window.localStorage,
    storageKey: STYLE_SETTINGS_STORAGE_KEY,
    normalizeHexColor,
    clamp,
    setColorControlValue,
    borderStyleState,
    graticuleStyleState,
  });
}

function saveViewState() {
  window.AtlasStatePersistence.saveViewState({
    storage: window.localStorage,
    storageKey: VIEW_STATE_STORAGE_KEY,
    projectionState,
    zoomState,
    rotationOffset,
    flatProjectionPanOffsets,
    layerState,
    empireLayerState,
    empireQualityState,
    temporalState,
  });
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
  window.AtlasStatePersistence.loadViewState({
    storage: window.localStorage,
    storageKey: VIEW_STATE_STORAGE_KEY,
    normalizeProjectionSelection,
    clampZoomScale,
    clampPhi: (value) => clamp(value, -getProjectionPhiClampRange(), getProjectionPhiClampRange()),
    flatProjectionPanOffsets,
    layerState,
    empireLayerState,
    empireQualityState,
    temporalState,
    projectionState,
    zoomState,
    rotationOffset,
    hasAnyEmpireChildEnabled,
    empireQualityLevels: EMPIRE_QUALITY_LEVELS,
  });
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
      storageKey: SHARED_CUSTOM_COLORS_STORAGE_KEY,
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
      storageKey: SHARED_CUSTOM_COLORS_STORAGE_KEY,
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
      storageKey: SHARED_CUSTOM_COLORS_STORAGE_KEY,
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
      storageKey: SHARED_CUSTOM_COLORS_STORAGE_KEY,
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
    romanEmpireFill: {
      storageKey: SHARED_CUSTOM_COLORS_STORAGE_KEY,
      datasetKey: "romanEmpireFillColor",
      paletteOpenKey: "isRomanEmpireFillColorPaletteOpen",
      input: romanEmpireFillColorInput,
      value: romanEmpireFillColorValue,
      inlineDot: romanEmpireFillColorInlineDot,
      swatchButton: romanEmpireFillColorSwatchButton,
      customs: romanEmpireFillColorCustoms,
      presetButtons: romanEmpireFillColorPresetButtons,
      panel: romanEmpireFillColorPanel,
      field: romanEmpireFillColorField,
      fieldHandle: romanEmpireFillColorFieldHandle,
      hueSlider: romanEmpireFillColorHueSlider,
      hueHandle: romanEmpireFillColorHueHandle,
      addButton: romanEmpireFillColorAddButton,
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
  if (controlId === "romanEmpireFill") {
    return {
      get color() {
        return empireStyleState.romanComparison.fillColor;
      },
      set color(nextColor) {
        empireStyleState.romanComparison.fillColor = nextColor;
      },
      get hue() {
        return empireStyleState.romanComparison.fillHue;
      },
      set hue(nextHue) {
        empireStyleState.romanComparison.fillHue = nextHue;
      },
      get saturation() {
        return empireStyleState.romanComparison.fillSaturation;
      },
      set saturation(nextSaturation) {
        empireStyleState.romanComparison.fillSaturation = nextSaturation;
      },
      get value() {
        return empireStyleState.romanComparison.fillValue;
      },
      set value(nextValue) {
        empireStyleState.romanComparison.fillValue = nextValue;
      },
    };
  }
  return null;
}

function getCustomColorList(controlId) {
  return sharedCustomColors;
}

function setCustomColorList(controlId, colors) {
  sharedCustomColors = colors;
}

function saveCustomColors(controlId) {
  colorModel.saveCustomColors(controlId, {
    getConfig: getColorControlConfig,
    storage: window.localStorage,
    getCustomColorList,
  });
}

function renderAllCustomColors() {
  ["border", "graticule", "land", "water", "romanEmpireFill"].forEach((controlId) => {
    renderCustomColors(controlId);
  });
}

function clearColorRemovePressTimer(controlId) {
  colorModel.clearColorRemovePressTimer(controlId, {
    getRuntime: (id) => colorControlRuntimeState[id],
  });
}

function hideCustomColorRemoveButton(controlId) {
  colorModel.hideCustomColorRemoveButton(controlId, {
    getRuntime: (id) => colorControlRuntimeState[id],
  });
}

function getColorDatasetSelector(config) {
  return colorModel.getColorDatasetSelector(config);
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
  colorModel.setColorControlFromField(controlId, clientX, clientY, {
    getConfig: getColorControlConfig,
    getStyle: getColorStyleState,
    clamp,
    hsvToHex,
  });
}

function setColorControlFromHueSlider(controlId, clientX) {
  colorModel.setColorControlFromHueSlider(controlId, clientX, {
    getConfig: getColorControlConfig,
    getStyle: getColorStyleState,
    clamp,
    hsvToHex,
  });
}

function createCustomColorButton(controlId, color) {
  return colorModel.createCustomColorButton(controlId, color, {
    getConfig: getColorControlConfig,
    getRuntime: (id) => colorControlRuntimeState[id],
    setColorControlValue,
    syncColorControlUi,
    drawForColorControl,
    setCustomColorList,
    getCustomColorList,
    renderCustomColors: renderAllCustomColors,
    saveCustomColors,
    hideCustomColorRemoveButton,
  });
}

function renderCustomColors(controlId) {
  colorModel.renderCustomColors(controlId, {
    getConfig: getColorControlConfig,
    getCustomColorList,
    createCustomColorButton,
  });
}

function revealCustomColor(controlId, color) {
  return colorModel.revealCustomColor(controlId, color, {
    getConfig: getColorControlConfig,
  });
}

function revealPresetColor(controlId, color) {
  return colorModel.revealPresetColor(controlId, color, {
    getConfig: getColorControlConfig,
  });
}

function flashColorFeedback(controlId, button) {
  colorModel.flashColorFeedback(controlId, button, {
    getRuntime: (id) => colorControlRuntimeState[id],
  });
}

function syncBorderGroupUi() {
  layerPanelUi.syncBorderGroupUi({
    layerState,
    uiState,
    borderStyleState,
    borderLayerGroup,
    borderGroupToggle,
    bordersButton: document.querySelector('[data-layer-id="borders"]'),
    borderWidthInput,
    borderWidthValue,
    borderOpacityInput,
    borderColorInput,
    borderColorValue,
    borderColorInlineDot,
    borderColorFieldHandle,
    borderColorField,
    borderColorHueHandle,
    borderColorHueSlider,
    formatBorderWidthLabel,
    clamp,
    hsvToHex,
    scheduleExpandableLayoutSync,
    syncColorControlUi,
  });
}

function syncGraticuleGroupUi() {
  layerPanelUi.syncGraticuleGroupUi({
    layerState,
    uiState,
    graticuleStyleState,
    graticuleLayerGroup,
    graticuleGroupToggle,
    graticuleButton: document.querySelector('#graticuleLayerGroup [data-layer-id="graticule"]'),
    graticuleWidthInput,
    graticuleWidthValue,
    graticuleOpacityInput,
    formatBorderWidthLabel,
    clamp,
    scheduleExpandableLayoutSync,
    syncColorControlUi,
  });
}

function syncColorControlUi(controlId) {
  layerPanelUi.syncColorControlUi({
    config: getColorControlConfig(controlId),
    style: getColorStyleState(controlId),
    isPaletteOpen: uiState[getColorControlConfig(controlId)?.paletteOpenKey],
    hsvToHex,
    clamp,
    afterSync: () => syncColorControlParentSections(controlId),
  });
}

function syncEarthGroupUi() {
  layerPanelUi.syncEarthGroupUi({
    uiState,
    earthLayerGroup,
    earthGroupButton,
    earthGroupToggle,
    scheduleExpandableLayoutSync,
    syncColorControlUi,
  });
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

const sliderPreviewDebugHistory = [];

function logSliderPreviewDebug(message) {
  sliderPreviewDebugHistory.push(message);
  if (sliderPreviewDebugHistory.length > 10) {
    sliderPreviewDebugHistory.shift();
  }
}

function clearSliderPreviewState() {
  layerPanel?.querySelectorAll(".is-previewing-slider").forEach((element) => {
    element.classList.remove("is-previewing-slider");
  });
  layerPanel?.querySelectorAll(".is-previewing-slider-row").forEach((element) => {
    element.classList.remove("is-previewing-slider-row");
  });
  layerPanel?.querySelectorAll(".is-previewing-slider-body").forEach((element) => {
    element.classList.remove("is-previewing-slider-body");
  });
  layerPanel?.querySelectorAll(".is-previewing-slider-group").forEach((element) => {
    element.classList.remove("is-previewing-slider-group");
  });
  layerPanel?.classList.remove("is-slider-previewing");
}

function setSliderPreviewState(inputElement, isPreviewing) {
  const sliderControl = inputElement?.closest(".layer-control");
  const sliderRow = sliderControl?.closest(".layer-body-row");
  const sliderBody = sliderControl?.closest(".layer-body");
  const sliderGroup = sliderBody?.closest(".layer-group");
  clearSliderPreviewState();
  if (isPreviewing) {
    sliderControl?.classList.add("is-previewing-slider");
    sliderRow?.classList.add("is-previewing-slider-row");
    sliderBody?.classList.add("is-previewing-slider-body");
    sliderGroup?.classList.add("is-previewing-slider-group");
    layerPanel?.classList.add("is-slider-previewing");
  }
  logSliderPreviewDebug(
    `${isPreviewing ? "start" : "end"} ${inputElement?.id || "unknown"} | row=${sliderRow?.dataset.layerRowKey || "none"} | body=${sliderBody?.dataset.layerBodyFor || "none"} | panel=${layerPanel?.classList.contains("is-slider-previewing") ? "preview" : "normal"}`,
  );
}

function enableSharedColorControl(controlId) {
  bindSharedColorControl(controlId, {
    getConfig: getColorControlConfig,
    getRuntime: (id) => colorControlRuntimeState[id],
    renderCustomColors: renderAllCustomColors,
    normalizeHexDraftValue,
    normalizeHexColor,
    setColorControlValue,
    syncColorControlUi,
    drawForColorControl,
    getColorStyleState,
    setColorControlPreviewState,
    layerPanelScroll,
    setColorControlFromField,
    setColorControlFromHueSlider,
    revealPresetColor,
    flashColorFeedback,
    setCustomColorList,
    getCustomColorList,
    saveCustomColors,
    revealCustomColor,
    maxCustomColors: MAX_CUSTOM_BORDER_COLORS,
    hideCustomColorRemoveButton,
    documentTarget: document,
    uiState,
    syncLayerPanelScrollbar,
    showLayerPanelScrollbarTemporarily,
    colorControlRuntimeState,
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
    drawForBorderStyle();
  });

  borderWidthInput?.addEventListener("pointerdown", () => {
    setSliderPreviewState(borderWidthInput, true);
  });

  const endBorderWidthPreview = () => {
    setSliderPreviewState(borderWidthInput, false);
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
    drawForBorderStyle();
  };

  borderOpacityInput?.addEventListener("input", () => {
    applyBorderOpacityPercent(borderOpacityInput.value);
  });

  borderOpacityInput?.addEventListener("pointerdown", () => {
    setSliderPreviewState(borderOpacityInput, true);
  });

  const endOpacityPreview = () => {
    setSliderPreviewState(borderOpacityInput, false);
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
    drawForGraticuleStyle();
  });

  graticuleWidthInput?.addEventListener("pointerdown", () => {
    setSliderPreviewState(graticuleWidthInput, true);
  });

  const endGraticuleWidthPreview = () => {
    setSliderPreviewState(graticuleWidthInput, false);
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
    drawForGraticuleStyle();
  };

  graticuleOpacityInput?.addEventListener("input", () => {
    applyGraticuleOpacityPercent(graticuleOpacityInput.value);
  });

  graticuleOpacityInput?.addEventListener("pointerdown", () => {
    setSliderPreviewState(graticuleOpacityInput, true);
  });

  const endGraticuleOpacityPreview = () => {
    setSliderPreviewState(graticuleOpacityInput, false);
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
  projectionSwitcherController.bind({
    projectionSwitcher,
    projectionSwitcherTrack,
    renderProjectionSwitcher,
    getProjectionSlotWidth,
    cycleProjection,
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

function requestRender(passes = ["all"]) {
  renderer.request({
    passes: ["all"],
    render: () => {
      drawAtlas([]);
    },
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
