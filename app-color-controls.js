(() => {
  function bindSharedColorControl(controlId, hooks) {
    const {
      getConfig,
      getRuntime,
      renderCustomColors,
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
      maxCustomColors,
      hideCustomColorRemoveButton,
      documentTarget,
      uiState,
      syncLayerPanelScrollbar,
      showLayerPanelScrollbarTemporarily,
      colorControlRuntimeState,
    } = hooks;

    const config = getConfig(controlId);
    const runtime = getRuntime(controlId);
    renderCustomColors(controlId);

    config.input?.addEventListener("input", () => {
      const draftValue = normalizeHexDraftValue(config.input.value);
      config.input.value = draftValue;
      const normalizedColor = normalizeHexColor(draftValue);
      if (!normalizedColor || !setColorControlValue(controlId, normalizedColor)) {
        return;
      }
      syncColorControlUi(controlId);
      drawForColorControl(controlId);
    });

    config.input?.addEventListener("blur", () => {
      config.input.value = getColorStyleState(controlId).color.toUpperCase();
    });

    config.swatchButton?.addEventListener("click", () => {
      uiState[config.paletteOpenKey] = !uiState[config.paletteOpenKey];
      syncColorControlUi(controlId);
      syncLayerPanelScrollbar();
      showLayerPanelScrollbarTemporarily();
    });

    config.presetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (!setColorControlValue(controlId, button.dataset[config.datasetKey])) {
          return;
        }
        syncColorControlUi(controlId);
        drawForColorControl(controlId);
      });
    });

    config.field?.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      runtime.fieldDragState = { pointerId: event.pointerId };
      config.field.setPointerCapture?.(event.pointerId);
      setColorControlPreviewState(controlId, "field");
      if (layerPanelScroll) {
        layerPanelScroll.style.overflowY = "hidden";
      }
      setColorControlFromField(controlId, event.clientX, event.clientY);
      syncColorControlUi(controlId);
      drawForColorControl(controlId);
    });

    config.field?.addEventListener("pointermove", (event) => {
      if (!runtime.fieldDragState || event.pointerId !== runtime.fieldDragState.pointerId) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setColorControlFromField(controlId, event.clientX, event.clientY);
      syncColorControlUi(controlId);
      drawForColorControl(controlId);
    });

    const endFieldDrag = (event) => {
      if (!runtime.fieldDragState || event.pointerId !== runtime.fieldDragState.pointerId) {
        return;
      }
      config.field.releasePointerCapture?.(event.pointerId);
      runtime.fieldDragState = null;
      setColorControlPreviewState(controlId, null);
      if (layerPanelScroll) {
        layerPanelScroll.style.overflowY = "";
      }
    };
    config.field?.addEventListener("pointerup", endFieldDrag);
    config.field?.addEventListener("pointercancel", endFieldDrag);

    config.hueSlider?.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      runtime.hueDragState = { pointerId: event.pointerId };
      config.hueSlider.setPointerCapture?.(event.pointerId);
      setColorControlPreviewState(controlId, "hue");
      setColorControlFromHueSlider(controlId, event.clientX);
      syncColorControlUi(controlId);
      drawForColorControl(controlId);
    });

    config.hueSlider?.addEventListener("pointermove", (event) => {
      if (!runtime.hueDragState || event.pointerId !== runtime.hueDragState.pointerId) {
        return;
      }
      event.preventDefault();
      setColorControlFromHueSlider(controlId, event.clientX);
      syncColorControlUi(controlId);
      drawForColorControl(controlId);
    });

    const endHueDrag = (event) => {
      if (!runtime.hueDragState || event.pointerId !== runtime.hueDragState.pointerId) {
        return;
      }
      config.hueSlider.releasePointerCapture?.(event.pointerId);
      runtime.hueDragState = null;
      setColorControlPreviewState(controlId, null);
    };
    config.hueSlider?.addEventListener("pointerup", endHueDrag);
    config.hueSlider?.addEventListener("pointercancel", endHueDrag);

    config.addButton?.addEventListener("click", () => {
      const normalizedColor = normalizeHexColor(getColorStyleState(controlId).color);
      if (!normalizedColor) {
        return;
      }
      const presetButton = revealPresetColor(controlId, normalizedColor);
      if (presetButton) {
        flashColorFeedback(controlId, presetButton);
        return;
      }
      setCustomColorList(
        controlId,
        [normalizedColor, ...getCustomColorList(controlId).filter((color) => color !== normalizedColor)]
          .slice(0, maxCustomColors),
      );
      saveCustomColors(controlId);
      renderCustomColors(controlId);
      syncColorControlUi(controlId);
      const customButton = revealCustomColor(controlId, normalizedColor);
      if (customButton) {
        flashColorFeedback(controlId, customButton);
      }
    });

    documentTarget.addEventListener("click", (event) => {
      if (!uiState[config.paletteOpenKey]) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      const colorControl = config.panel?.closest(".layer-control-color");
      if (colorControl?.contains(target)) {
        return;
      }
      uiState[config.paletteOpenKey] = false;
      syncColorControlUi(controlId);
    });

    documentTarget.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (colorControlRuntimeState[controlId].removeTarget?.contains(target)) {
        return;
      }
      hideCustomColorRemoveButton(controlId);
    });

    documentTarget.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && uiState[config.paletteOpenKey]) {
        uiState[config.paletteOpenKey] = false;
        syncColorControlUi(controlId);
      }
    });
  }

  window.AtlasColorControls = {
    bindSharedColorControl,
  };
})();
