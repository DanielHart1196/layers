import { getDefaultEmpireChildOnEnable, getLayerGroupUiKey } from "./layers-registry.js";

function toggleLayerGroupOpen(uiState, layerId) {
  const uiKey = getLayerGroupUiKey(layerId);
  if (!uiKey || !(uiKey in uiState)) {
    return false;
  }

  uiState[uiKey] = !uiState[uiKey];
  return true;
}

function toggleLayerEnabled(layerState, empireLayerState, layerId, hasAnyEmpireChildEnabled) {
  if (!(layerId in layerState)) {
    return false;
  }

  if (layerId === "empires") {
    const nextEmpireVisibility = !layerState.empires;
    if (nextEmpireVisibility && !hasAnyEmpireChildEnabled(empireLayerState)) {
      const defaultEmpireChildOnEnable = getDefaultEmpireChildOnEnable();
      if (defaultEmpireChildOnEnable && defaultEmpireChildOnEnable in empireLayerState) {
        empireLayerState[defaultEmpireChildOnEnable] = true;
      }
    }
    layerState.empires = nextEmpireVisibility;
    return true;
  }

  layerState[layerId] = !layerState[layerId];
  return true;
}

function toggleEmpireSublayer(layerState, empireLayerState, empireLayerId, hasAnyEmpireChildEnabled) {
  if (!(empireLayerId in empireLayerState)) {
    return false;
  }

  if (!layerState.empires) {
    empireLayerState[empireLayerId] = true;
  } else {
    empireLayerState[empireLayerId] = !empireLayerState[empireLayerId];
  }

  layerState.empires = hasAnyEmpireChildEnabled(empireLayerState);
  return true;
}

function setAllEmpireQuality(empireQualityState, quality) {
  Object.keys(empireQualityState).forEach((empireKey) => {
    empireQualityState[empireKey] = quality;
  });
}

const AtlasAppActions = {
  setAllEmpireQuality,
  toggleEmpireSublayer,
  toggleLayerEnabled,
  toggleLayerGroupOpen,
};

export {
  setAllEmpireQuality,
  toggleEmpireSublayer,
  toggleLayerEnabled,
  toggleLayerGroupOpen,
};

export default AtlasAppActions;

window.AtlasAppActions = AtlasAppActions;
