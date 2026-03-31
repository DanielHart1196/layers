import {
  createDefaultLayerTemporalState,
  getColorControlDefinitions,
  getExpandableSectionDefinitions,
} from "./layers-registry.js";

function createDefaultUiState() {
  const uiState = {
    isLayerPanelOpen: false,
    isMonthOverlayOpen: false,
    isProjectionMenuOpen: false,
    isProjectionWheelOpen: false,
    isProjectionSwitcherReady: false,
    isInteracting: false,
  };

  getExpandableSectionDefinitions().forEach((definition) => {
    if (definition?.uiOpenKey) {
      uiState[definition.uiOpenKey] = false;
    }
  });

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
  createDefaultEmpireQualityState,
  createDefaultEarthStyleState,
  createDefaultBorderStyleState,
  createDefaultGraticuleStyleState,
  createDefaultLayerStyleState,
}) {
  return {
    layers: createDefaultLayerState(),
    empireQuality: createDefaultEmpireQualityState(),
    temporal: {
      selectedMonth: getDefaultMonth(),
      layers: createDefaultLayerTemporalState(),
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
      layers: createDefaultLayerStyleState(),
    },
    controlRuntime: createDefaultColorControlRuntimeState(),
  };
}

export {
  createAppState,
  createDefaultColorControlRuntimeState,
  createDefaultUiState,
};

window.AtlasAppState = {
  createAppState,
  createDefaultColorControlRuntimeState,
  createDefaultUiState,
};
