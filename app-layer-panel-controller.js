(() => {
  function handleExpandableToggleClick({
    event,
    toggleElement,
    uiState,
    layerId,
    toggleLayerGroupOpen,
    syncUi,
    syncLayerPanelScrollbar,
    showLayerPanelScrollbarTemporarily,
    releaseLayerPanelFocusAfterPointerInteraction,
    focusTarget,
  }) {
    if (!toggleElement || !(event.target instanceof Node) || !toggleElement.contains(event.target)) {
      return false;
    }

    toggleLayerGroupOpen(uiState, layerId);
    syncUi();
    syncLayerPanelScrollbar();
    showLayerPanelScrollbarTemporarily();
    releaseLayerPanelFocusAfterPointerInteraction(focusTarget);
    return true;
  }

  function bindLayerControls({
    layerButtons,
    empireLayerButtons,
    earthGroupButton,
    empireGroupToggle,
    borderGroupToggle,
    graticuleGroupToggle,
    romanEmpireGroupToggle,
    empireQualityInput,
    layerState,
    empireLayerState,
    empireQualityState,
    uiState,
    clamp,
    empireQualityLevels,
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
    hasEarthTexture,
    scheduleViewStateSave,
    drawForLayerToggle,
    drawForEmpireSublayerToggle,
    drawForEmpireQuality,
    releaseLayerPanelFocusAfterPointerInteraction,
    syncLayerPanelScrollbar,
    showLayerPanelScrollbarTemporarily,
    syncEmpireQualityUi,
    invalidateEmpireRenderCache,
    enableSharedColorControl,
    enableGraticuleStyleControls,
    enableBorderStyleControls,
  }) {
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
        if (layerId === "empires" && handleExpandableToggleClick({
          event,
          toggleElement: empireGroupToggle,
          uiState,
          layerId: "empires",
          toggleLayerGroupOpen,
          syncUi: syncEmpireGroupUi,
          syncLayerPanelScrollbar,
          showLayerPanelScrollbarTemporarily,
          releaseLayerPanelFocusAfterPointerInteraction,
          focusTarget: button,
        })) {
          return;
        }

        if (layerId === "borders" && handleExpandableToggleClick({
          event,
          toggleElement: borderGroupToggle,
          uiState,
          layerId: "borders",
          toggleLayerGroupOpen,
          syncUi: syncBorderGroupUi,
          syncLayerPanelScrollbar,
          showLayerPanelScrollbarTemporarily,
          releaseLayerPanelFocusAfterPointerInteraction,
          focusTarget: button,
        })) {
          return;
        }

        if (layerId === "graticule" && handleExpandableToggleClick({
          event,
          toggleElement: graticuleGroupToggle,
          uiState,
          layerId: "graticule",
          toggleLayerGroupOpen,
          syncUi: syncGraticuleGroupUi,
          syncLayerPanelScrollbar,
          showLayerPanelScrollbarTemporarily,
          releaseLayerPanelFocusAfterPointerInteraction,
          focusTarget: button,
        })) {
          return;
        }

        toggleLayerEnabled(layerState, empireLayerState, layerId, hasAnyEmpireChildEnabled);
        if (layerId !== "empires") {
          button.classList.toggle("is-active", layerState[layerId]);
          button.closest(".layer-group")?.classList.toggle("is-active", layerState[layerId]);
        }
        if (layerId === "earth") {
          syncMobileMonthChrome();
          if (layerState.earth && !hasEarthTexture()) {
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
        drawForLayerToggle(layerId);
        releaseLayerPanelFocusAfterPointerInteraction(button);
      });
    });

    earthGroupButton?.addEventListener("click", () => {
      toggleLayerGroupOpen(uiState, "earth");
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
      button.addEventListener("click", (event) => {
        if (empireLayerId === "romanComparison" && handleExpandableToggleClick({
          event,
          toggleElement: romanEmpireGroupToggle,
          uiState,
          layerId: "romanComparison",
          toggleLayerGroupOpen,
          syncUi: syncEmpireGroupUi,
          syncLayerPanelScrollbar,
          showLayerPanelScrollbarTemporarily,
          releaseLayerPanelFocusAfterPointerInteraction,
          focusTarget: button,
        })) {
          return;
        }

        toggleEmpireSublayer(layerState, empireLayerState, empireLayerId, hasAnyEmpireChildEnabled);
        syncEmpireGroupUi();
        scheduleViewStateSave();
        drawForEmpireSublayerToggle();
        releaseLayerPanelFocusAfterPointerInteraction(button);
      });
    });

    empireQualityInput?.addEventListener("input", () => {
      const nextIndex = clamp(Number.parseInt(empireQualityInput.value, 10) || 0, 0, empireQualityLevels.length - 1);
      const nextQuality = empireQualityLevels[nextIndex];
      setAllEmpireQuality(empireQualityState, nextQuality);
      syncEmpireQualityUi();
      invalidateEmpireRenderCache();
      scheduleViewStateSave();
      drawForEmpireQuality();
    });

    syncEmpireGroupUi();
    enableSharedColorControl("romanEmpireFill");
    enableSharedColorControl("land");
    enableSharedColorControl("water");
    syncEarthGroupUi();
    enableGraticuleStyleControls();
    syncGraticuleGroupUi();
    enableBorderStyleControls();
    syncBorderGroupUi();
  }

  window.AtlasLayerPanelController = {
    bindLayerControls,
    handleExpandableToggleClick,
  };
})();
