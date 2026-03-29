(() => {
  const { getColorControlDefinitions } = window.AtlasLayersRegistry;

  function createDefaultUiState() {
    const uiState = {
      isLayerPanelOpen: false,
      isMonthOverlayOpen: false,
      isEarthGroupOpen: false,
      isGraticuleGroupOpen: false,
      isEmpireGroupOpen: false,
      isRomanEmpireGroupOpen: false,
      isBorderGroupOpen: false,
      isProjectionMenuOpen: false,
      isProjectionWheelOpen: false,
      isProjectionSwitcherReady: false,
      isInteracting: false,
    };

    Object.values(getColorControlDefinitions()).forEach((definition) => {
      if (definition?.paletteOpenKey) {
        uiState[definition.paletteOpenKey] = false;
      }
    });

    return uiState;
  }

  function createDefaultColorControlRuntimeState() {
    return Object.fromEntries(
      Object.keys(getColorControlDefinitions()).map((controlId) => [controlId, {
        fieldDragState: null,
        hueDragState: null,
        duplicateFlashTimer: null,
        duplicateFlashButton: null,
        removePressTimer: null,
        removeTarget: null,
        longPressTriggered: false,
      }]),
    );
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
