(() => {
  const { getExpandableSectionDefinitions } = window.AtlasLayersRegistry;

  function syncGroupChrome({
    groupElement,
    buttonElement,
    toggleElement,
    isActive,
    isOpen,
    isDisabled = false,
  }) {
    groupElement?.classList.toggle("is-active", Boolean(isActive));
    groupElement?.classList.toggle("is-open", Boolean(isOpen));
    groupElement?.classList.toggle("is-disabled", Boolean(isDisabled));
    buttonElement?.classList.toggle("is-active", Boolean(isActive));
    toggleElement?.setAttribute("aria-expanded", String(Boolean(isOpen)));
  }

  function syncColorControlUi({
    config,
    style,
    isPaletteOpen,
    hsvToHex,
    clamp,
    afterSync,
  }) {
    if (!config || !style) {
      return;
    }

    config.input && (config.input.value = style.color.toUpperCase());
    config.value && (config.value.textContent = style.color.toUpperCase());
    config.inlineDot?.style.setProperty("--layer-active-color", style.color);
    config.fieldHandle?.style.setProperty("--layer-active-color", style.color);
    config.field?.style.setProperty("--layer-color-field-hue", hsvToHex(style.hue, 1, 1));
    config.field?.style.setProperty("--layer-color-field-x", `${clamp(style.saturation, 0, 1) * 100}%`);
    config.field?.style.setProperty("--layer-color-field-y", `${(1 - clamp(style.value, 0, 1)) * 100}%`);
    config.hueHandle?.style.setProperty("--layer-color-field-hue", hsvToHex(style.hue, 1, 1));
    config.hueSlider?.style.setProperty("--layer-color-hue-x", `${(style.hue / 360) * 100}%`);
    config.swatchButton?.setAttribute("aria-expanded", String(Boolean(isPaletteOpen)));
    config.panel?.closest(".layer-control-color")?.classList.toggle("is-panel-open", Boolean(isPaletteOpen));
    config.panel?.setAttribute("aria-hidden", String(!isPaletteOpen));
    config.presetButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset[config.datasetKey]?.toUpperCase() === style.color.toUpperCase());
    });
    config.customs?.querySelectorAll(".layer-inline-color-choice").forEach((button) => {
      button.classList.toggle("is-active", button.dataset[config.datasetKey]?.toUpperCase() === style.color.toUpperCase());
    });

    afterSync?.();
  }

  function syncEarthGroupUi({
    uiState,
    earthLayerGroup,
    earthGroupButton,
    earthGroupToggle,
    scheduleExpandableLayoutSync,
    syncColorControlUi,
  }) {
    syncGroupChrome({
      groupElement: earthLayerGroup,
      buttonElement: earthGroupButton,
      toggleElement: earthGroupToggle,
      isActive: true,
      isOpen: uiState.isEarthGroupOpen,
    });
    scheduleExpandableLayoutSync();
    syncColorControlUi("land");
    syncColorControlUi("water");
  }

  function syncBorderGroupUi({
    layerState,
    uiState,
    borderLayerGroup,
    borderGroupToggle,
    bordersButton,
    scheduleExpandableLayoutSync,
    syncSliderControlsForLayer,
    syncColorControlUi,
  }) {
    syncGroupChrome({
      groupElement: borderLayerGroup,
      buttonElement: bordersButton,
      toggleElement: borderGroupToggle,
      isActive: layerState.borders,
      isOpen: uiState.isBorderGroupOpen,
    });
    scheduleExpandableLayoutSync();

    syncSliderControlsForLayer("borders");
    syncColorControlUi("border");
  }

  function syncGraticuleGroupUi({
    layerState,
    uiState,
    graticuleLayerGroup,
    graticuleGroupToggle,
    graticuleButton,
    scheduleExpandableLayoutSync,
    syncSliderControlsForLayer,
    syncColorControlUi,
  }) {
    syncGroupChrome({
      groupElement: graticuleLayerGroup,
      buttonElement: graticuleButton,
      toggleElement: graticuleGroupToggle,
      isActive: layerState.graticule,
      isOpen: uiState.isGraticuleGroupOpen,
    });
    scheduleExpandableLayoutSync();

    syncSliderControlsForLayer("graticule");

    syncColorControlUi("graticule");
  }

  function syncEmpireGroupUi({
    layerState,
    empireLayerState,
    uiState,
    empireLayerGroup,
    empireGroupToggle,
    empiresButton,
    empireLayerButtons,
    romanEmpireLayerGroup,
    romanEmpireRow,
    romanEmpireGroupToggle,
    isEmpireParentActive,
    isEmpireChildDisplayed,
    scheduleExpandableLayoutSync,
    syncSliderControlsForLayer,
    syncColorControlUi,
  }) {
    const parentIsActive = isEmpireParentActive(layerState, empireLayerState);

    syncGroupChrome({
      groupElement: empireLayerGroup,
      buttonElement: empiresButton,
      toggleElement: empireGroupToggle,
      isActive: parentIsActive,
      isOpen: uiState.isEmpireGroupOpen,
      isDisabled: !layerState.empires,
    });

    empireLayerButtons.forEach((button) => {
      const empireLayerId = button.dataset.empireLayerId;
      const displayIsActive = empireLayerId
        ? isEmpireChildDisplayed(layerState, empireLayerState, empireLayerId)
        : false;
      button.classList.toggle("is-active", displayIsActive);
      button.disabled = false;
      button.setAttribute("aria-disabled", "false");
    });

    syncGroupChrome({
      groupElement: romanEmpireLayerGroup,
      buttonElement: romanEmpireRow,
      toggleElement: romanEmpireGroupToggle,
      isActive: layerState.empires && Boolean(empireLayerState.romanComparison),
      isOpen: uiState.isRomanEmpireGroupOpen,
    });

    syncSliderControlsForLayer("romanComparison");

    syncColorControlUi("romanEmpireFill");
    syncColorControlUi("romanEmpireBorder");
    scheduleExpandableLayoutSync();
  }

  function syncExpandableSectionHeight(section, isOpen) {
    if (!section) {
      return;
    }

    if (!isOpen) {
      section.style.maxHeight = "0px";
      return;
    }

    section.style.maxHeight = `${section.scrollHeight}px`;
  }

  function getExpandableSectionDepth(section) {
    let depth = 0;
    let current = section?.parentElement ?? null;

    while (current) {
      if (current.classList.contains("layer-sublist")) {
        depth += 1;
      }
      current = current.parentElement;
    }

    return depth;
  }

  function syncExpandableSections({ uiState, empireSubLayers }) {
    const sections = getExpandableSectionDefinitions()
      .map(({ sectionId, uiOpenKey }) => ({
        section: document.getElementById(sectionId),
        isOpen: Boolean(uiState?.[uiOpenKey]),
      }))
      .filter(({ section }) => Boolean(section));

    if (empireSubLayers) {
      sections.push({
        section: empireSubLayers,
        isOpen: Boolean(uiState?.isEmpireGroupOpen),
      });
    }

    sections
      .sort((left, right) => getExpandableSectionDepth(right.section) - getExpandableSectionDepth(left.section))
      .forEach(({ section, isOpen }) => {
        syncExpandableSectionHeight(section, isOpen);
      });
  }

  window.AtlasLayerPanel = {
    syncBorderGroupUi,
    syncColorControlUi,
    syncEarthGroupUi,
    syncEmpireGroupUi,
    syncExpandableSections,
    syncGraticuleGroupUi,
    syncGroupChrome,
  };
})();
