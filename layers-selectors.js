(() => {
  function hasAnyEmpireChildEnabled(empireLayerState) {
    return Object.values(empireLayerState ?? {}).some(Boolean);
  }

  function isEmpireParentActive(layerState, empireLayerState) {
    return Boolean(layerState?.empires) && hasAnyEmpireChildEnabled(empireLayerState);
  }

  function isEmpireChildDisplayed(layerState, empireLayerState, empireLayerId) {
    return Boolean(layerState?.empires) && Boolean(empireLayerState?.[empireLayerId]);
  }

  window.AtlasLayerSelectors = {
    hasAnyEmpireChildEnabled,
    isEmpireChildDisplayed,
    isEmpireParentActive,
  };
})();
