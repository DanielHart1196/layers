import { getDefaultEmpireChildOnEnable, getLayerGroupUiKey } from "./layers-registry.js";

function toggleLayerGroupOpen(uiState, layerId) {
  const uiKey = getLayerGroupUiKey(layerId);
  if (!uiKey || !(uiKey in uiState)) {
    return false;
  }

  uiState[uiKey] = !uiState[uiKey];
  return true;
}

function hasAnyEnabled(layerState, layerIds) {
  return layerIds.some((layerId) => Boolean(layerState?.[layerId]));
}

function toggleLayerEnabled(layerState, layerId, childLayerIds = []) {
  if (!(layerId in layerState)) {
    return false;
  }

  if (layerId === "empires") {
    const nextEmpireVisibility = !layerState.empires;
    if (nextEmpireVisibility && !hasAnyEnabled(layerState, childLayerIds)) {
      const defaultEmpireChildOnEnable = getDefaultEmpireChildOnEnable();
      if (defaultEmpireChildOnEnable && defaultEmpireChildOnEnable in layerState) {
        layerState[defaultEmpireChildOnEnable] = true;
      }
    }
    layerState.empires = nextEmpireVisibility;
    return true;
  }

  layerState[layerId] = !layerState[layerId];
  return true;
}

function toggleEmpireSublayer(layerState, empireLayerId, childLayerIds = []) {
  if (!(empireLayerId in layerState)) {
    return false;
  }

  if (!layerState.empires) {
    layerState[empireLayerId] = true;
  } else {
    layerState[empireLayerId] = !layerState[empireLayerId];
  }

  layerState.empires = hasAnyEnabled(layerState, childLayerIds);
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
