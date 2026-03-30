function hasAnyEmpireChildEnabled(layerState, empireLayerIds) {
  return (empireLayerIds ?? []).some((layerId) => Boolean(layerState?.[layerId]));
}

function isEmpireParentActive(layerState, empireLayerIds) {
  return Boolean(layerState?.empires) && hasAnyEmpireChildEnabled(layerState, empireLayerIds);
}

function isEmpireChildDisplayed(layerState, empireLayerId) {
  return Boolean(layerState?.empires) && Boolean(layerState?.[empireLayerId]);
}

const AtlasLayerSelectors = {
  hasAnyEmpireChildEnabled,
  isEmpireChildDisplayed,
  isEmpireParentActive,
};

export {
  hasAnyEmpireChildEnabled,
  isEmpireChildDisplayed,
  isEmpireParentActive,
};

export default AtlasLayerSelectors;

window.AtlasLayerSelectors = AtlasLayerSelectors;
