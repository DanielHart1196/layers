(() => {
  function createDefaultUiState() {
    return {
      isLayerPanelOpen: false,
      isMonthOverlayOpen: false,
      isEarthGroupOpen: false,
      isGraticuleGroupOpen: false,
      isEmpireGroupOpen: false,
      isRomanEmpireGroupOpen: false,
      isBorderGroupOpen: false,
      isBorderColorPaletteOpen: false,
      isGraticuleColorPaletteOpen: false,
      isLandColorPaletteOpen: false,
      isWaterColorPaletteOpen: false,
      isRomanEmpireFillColorPaletteOpen: false,
      isProjectionMenuOpen: false,
      isProjectionWheelOpen: false,
      isProjectionSwitcherReady: false,
      isInteracting: false,
    };
  }

  function createDefaultColorControlRuntimeState() {
    return {
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
      romanEmpireFill: {
        fieldDragState: null,
        hueDragState: null,
        duplicateFlashTimer: null,
        duplicateFlashButton: null,
        removePressTimer: null,
        removeTarget: null,
        longPressTriggered: false,
      },
    };
  }

  function createAppState({
    getDefaultMonth,
    getDefaultProjection,
    createDefaultLayerState,
    createDefaultEmpireLayerState,
    createDefaultEmpireQualityState,
    createDefaultEarthStyleState,
    createDefaultBorderStyleState,
    createDefaultGraticuleStyleState,
    createDefaultEmpireStyleState,
  }) {
    return {
      layers: createDefaultLayerState(),
      empireSublayers: createDefaultEmpireLayerState(),
      empireQuality: createDefaultEmpireQualityState(),
      temporal: {
        selectedMonth: getDefaultMonth(),
      },
      projection: {
        selectedProjection: getDefaultProjection(),
      },
      zoom: {
        scale: 1,
      },
      ui: createDefaultUiState(),
      styles: {
        earth: createDefaultEarthStyleState(),
        borders: createDefaultBorderStyleState(),
        graticule: createDefaultGraticuleStyleState(),
        empires: createDefaultEmpireStyleState(),
      },
      controlRuntime: createDefaultColorControlRuntimeState(),
    };
  }

  window.AtlasAppState = {
    createAppState,
    createDefaultColorControlRuntimeState,
    createDefaultUiState,
  };
})();
