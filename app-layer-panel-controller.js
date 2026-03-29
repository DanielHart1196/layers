(() => {
  const { getExpandableLayerDefinitions } = window.AtlasLayersRegistry;

  function getOwnedLayerGroup(button) {
    if (!button) {
      return null;
    }

    const parentElement = button.parentElement;
    if (!parentElement) {
      return null;
    }

    if (parentElement.classList.contains("layer-group-head")) {
      return parentElement.parentElement;
    }

    if (parentElement.classList.contains("layer-group")) {
      return parentElement;
    }

    return null;
  }

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
    toggleElementsByLayerId,
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
    setEmpireQualityPreviewState,
    invalidateEmpireRenderCache,
    enableSharedColorControl,
    enableGraticuleStyleControls,
    enableBorderStyleControls,
  }) {
    const expandableLayersById = Object.fromEntries(
      getExpandableLayerDefinitions().map((definition) => [definition.id, definition]),
    );

    layerButtons.forEach((button) => {
      const layerId = button.dataset.layerId;
      if (button.dataset.empireLayerId) {
        return;
      }

      if (!layerId || !(layerId in layerState)) {
        return;
      }

      const ownedLayerGroup = getOwnedLayerGroup(button);
      button.classList.toggle("is-active", Boolean(layerState[layerId]));
      ownedLayerGroup?.classList.toggle("is-active", Boolean(layerState[layerId]));

      button.addEventListener("click", async (event) => {
        const expandableLayer = expandableLayersById[layerId];
        const syncHandlersByLayerId = {
          borders: syncBorderGroupUi,
          empires: syncEmpireGroupUi,
          graticule: syncGraticuleGroupUi,
        };

        if (expandableLayer && handleExpandableToggleClick({
          event,
          toggleElement: toggleElementsByLayerId?.[layerId],
          uiState,
          layerId,
          toggleLayerGroupOpen,
          syncUi: syncHandlersByLayerId[layerId],
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
          ownedLayerGroup?.classList.toggle("is-active", layerState[layerId]);
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
        if (expandableLayersById[empireLayerId] && handleExpandableToggleClick({
          event,
          toggleElement: toggleElementsByLayerId?.[empireLayerId],
          uiState,
          layerId: empireLayerId,
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

    empireQualityInput?.addEventListener("pointerdown", () => {
      setEmpireQualityPreviewState?.(true);
    });

    const endEmpireQualityPreview = () => {
      setEmpireQualityPreviewState?.(false);
    };

    empireQualityInput?.addEventListener("pointerup", endEmpireQualityPreview);
    empireQualityInput?.addEventListener("pointercancel", endEmpireQualityPreview);
    empireQualityInput?.addEventListener("touchend", endEmpireQualityPreview, { passive: true });
    empireQualityInput?.addEventListener("touchcancel", endEmpireQualityPreview, { passive: true });

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
