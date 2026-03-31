import { getExpandableSectionDefinitions, getLayerGroupUiKey, getLayerRows } from "./layers-registry.js";

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
  syncColorControlUi: syncSharedColorControlUi,
}) {
  syncGroupChrome({
    groupElement: earthLayerGroup,
    buttonElement: earthGroupButton,
    toggleElement: earthGroupToggle,
    isActive: true,
    isOpen: uiState.isEarthGroupOpen,
  });
  scheduleExpandableLayoutSync();
  syncSharedColorControlUi("land");
  syncSharedColorControlUi("water");
}

function syncStandardLayerGroupUi({
  layerId,
  layerState,
  uiState,
  groupElement,
  toggleElement,
  buttonElement,
  scheduleExpandableLayoutSync,
  syncSliderControlsForLayer,
  syncColorControlsForLayer,
}) {
  const groupUiKey = getLayerGroupUiKey(layerId);
  syncGroupChrome({
    groupElement,
    buttonElement,
    toggleElement,
    isActive: layerState[layerId],
    isOpen: Boolean(groupUiKey ? uiState[groupUiKey] : false),
  });
  scheduleExpandableLayoutSync();
  syncSliderControlsForLayer(layerId);
  syncColorControlsForLayer(layerId);
}

function syncEmpireGroupUi({
  layerState,
  empireChildLayerIds,
  uiState,
  empireLayerGroup,
  empireGroupToggle,
  empiresButton,
  empireLayerButtons,
  toggleElementsByLayerId,
  isEmpireParentActive,
  isEmpireChildDisplayed,
  scheduleExpandableLayoutSync,
  syncSliderControlsForLayer,
  syncColorControlsForLayer,
  syncColorControlUi: syncSharedColorControlUi,
}) {
  const parentIsActive = isEmpireParentActive(layerState, empireChildLayerIds);

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
      ? isEmpireChildDisplayed(layerState, empireLayerId)
      : false;
    button.classList.toggle("is-active", displayIsActive);
    button.disabled = false;
    button.setAttribute("aria-disabled", "false");
    const groupElement = getOwnedLayerGroup(button);
    const toggleElement = empireLayerId ? toggleElementsByLayerId?.[empireLayerId] : null;
    const groupUiKey = empireLayerId ? getLayerGroupUiKey(empireLayerId) : null;
    if (!groupElement || !toggleElement || !groupUiKey) {
      return;
    }
    syncGroupChrome({
      groupElement,
      buttonElement: button,
      toggleElement,
      isActive: displayIsActive,
      isOpen: Boolean(uiState[groupUiKey]),
    });
  });

  empireChildLayerIds.forEach((layerId) => {
    if (!getLayerRows(layerId).length) {
      return;
    }
    syncSliderControlsForLayer(layerId);
    syncColorControlsForLayer(layerId);
  });
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

const AtlasLayerPanel = {
  syncColorControlUi,
  syncEarthGroupUi,
  syncEmpireGroupUi,
  syncExpandableSections,
  syncGroupChrome,
  syncStandardLayerGroupUi,
};

export {
  syncColorControlUi,
  syncEarthGroupUi,
  syncEmpireGroupUi,
  syncExpandableSections,
  syncGroupChrome,
  syncStandardLayerGroupUi,
};

export default AtlasLayerPanel;

window.AtlasLayerPanel = AtlasLayerPanel;
