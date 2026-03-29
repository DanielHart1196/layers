(() => {
  function createSliderRow({
    controlId,
    rowElementId,
    label,
    inputId,
    valueElementId = null,
    min,
    max,
    step,
  }) {
    return {
      type: "slider",
      controlId,
      rowElementId,
      label,
      inputId,
      valueElementId,
      min,
      max,
      step,
    };
  }

  const layerDefinitions = {
    earth: {
      id: "earth",
      definitionType: "layer-definition",
      layerKind: "basemap",
      ownerType: "system",
      defaultEnabled: false,
      uiOpenKey: "isEarthGroupOpen",
      uiSection: "basemap",
      parentId: null,
      children: ["graticule", "tissot"],
      controls: ["landColor", "waterColor", "projection"],
      rows: [
        { type: "color", controlId: "land", rowElementId: "landColorRow" },
        { type: "color", controlId: "water", rowElementId: "waterColorRow" },
        { type: "dropdown", controlId: "projection", rowElementId: "projectionRow" },
        { type: "layer", layerId: "graticule", rowElementId: "graticuleLayerGroup" },
        { type: "layer", layerId: "tissot", rowElementId: "tissotLayerRow" },
      ],
      bodySectionId: "earthLayerControls",
      renderSource: null,
    },
    empires: {
      id: "empires",
      definitionType: "layer-definition",
      layerKind: "thematic",
      ownerType: "system",
      defaultEnabled: false,
      uiOpenKey: "isEmpireGroupOpen",
      uiSection: "layers",
      parentId: null,
      children: ["romanComparison", "mongol", "british"],
      defaultChildOnEnable: "romanComparison",
      controls: ["empireQuality"],
      rows: [
        createSliderRow({
          controlId: "empireQuality",
          rowElementId: "empireQualityRow",
          label: "Detail",
          inputId: "empireQualityInput",
          valueElementId: "empireQualityValue",
          min: 0,
          max: 2,
          step: 1,
        }),
        { type: "layer", layerId: "romanComparison", rowElementId: "romanEmpireLayerGroup" },
        { type: "layer", layerId: "mongol", rowElementId: "mongolLayerRow" },
        { type: "layer", layerId: "british", rowElementId: "britishLayerRow" },
      ],
      bodySectionId: "empireSubLayers",
      renderSource: "empires",
    },
    borders: {
      id: "borders",
      definitionType: "layer-definition",
      layerKind: "reference",
      ownerType: "system",
      defaultEnabled: false,
      uiOpenKey: "isBorderGroupOpen",
      uiSection: "layers",
      parentId: null,
      children: [],
      controls: ["borderWidth", "borderColor", "borderOpacity"],
      rows: [
        createSliderRow({
          controlId: "borderWidth",
          rowElementId: "borderWidthRow",
          label: "Stroke Width",
          inputId: "borderWidthInput",
          valueElementId: "borderWidthValue",
          min: 0.4,
          max: 3,
          step: 0.1,
        }),
        { type: "color", controlId: "border", rowElementId: "borderColorRow" },
        createSliderRow({
          controlId: "borderOpacity",
          rowElementId: "borderOpacityRow",
          label: "Opacity",
          inputId: "borderOpacityInput",
          min: 0,
          max: 100,
          step: 1,
        }),
      ],
      bodySectionId: "borderLayerControls",
      renderSource: "borders",
    },
    graticule: {
      id: "graticule",
      definitionType: "layer-definition",
      layerKind: "utility",
      ownerType: "system",
      defaultEnabled: true,
      uiOpenKey: "isGraticuleGroupOpen",
      uiSection: "projection-settings",
      parentId: "earth",
      children: [],
      controls: ["graticuleWidth", "graticuleColor", "graticuleOpacity"],
      rows: [
        createSliderRow({
          controlId: "graticuleWidth",
          rowElementId: "graticuleWidthRow",
          label: "Stroke Width",
          inputId: "graticuleWidthInput",
          valueElementId: "graticuleWidthValue",
          min: 0.4,
          max: 3,
          step: 0.1,
        }),
        { type: "color", controlId: "graticule", rowElementId: "graticuleColorRow" },
        createSliderRow({
          controlId: "graticuleOpacity",
          rowElementId: "graticuleOpacityRow",
          label: "Opacity",
          inputId: "graticuleOpacityInput",
          min: 0,
          max: 100,
          step: 1,
        }),
      ],
      bodySectionId: "graticuleLayerControls",
      renderSource: "graticule",
    },
    tissot: {
      id: "tissot",
      definitionType: "layer-definition",
      layerKind: "utility",
      ownerType: "system",
      defaultEnabled: false,
      uiSection: "projection-settings",
      parentId: "earth",
      children: [],
      rows: [],
      controls: [],
      renderSource: "tissot",
    },
    romanComparison: {
      id: "romanComparison",
      definitionType: "layer-definition",
      layerKind: "thematic",
      ownerType: "system",
      parentId: "empires",
      defaultEnabled: true,
      defaultQuality: "medium",
      uiOpenKey: "isRomanEmpireGroupOpen",
      uiSection: "layers",
      children: [],
      controls: ["romanEmpireFill"],
      rows: [
        { type: "color", controlId: "romanEmpireFill", rowElementId: "romanEmpireFillRow" },
      ],
      bodySectionId: "romanEmpireLayerControls",
      renderSource: "romanComparison",
    },
    mongol: {
      id: "mongol",
      definitionType: "layer-definition",
      layerKind: "thematic",
      ownerType: "system",
      parentId: "empires",
      defaultEnabled: false,
      defaultQuality: "medium",
      uiSection: "layers",
      children: [],
      rows: [],
      controls: [],
      renderSource: "mongol",
    },
    british: {
      id: "british",
      definitionType: "layer-definition",
      layerKind: "thematic",
      ownerType: "system",
      parentId: "empires",
      defaultEnabled: false,
      defaultQuality: "medium",
      uiSection: "layers",
      children: [],
      rows: [],
      controls: [],
      renderSource: "british",
    },
  };

  const empireQualityLevels = ["low", "medium", "high"];

  const defaultEarthStyleState = {
    land: {
      color: "#98B977",
      hue: 88,
      saturation: 0.37,
      value: 0.73,
    },
    water: {
      color: "#2F7398",
      hue: 201,
      saturation: 0.69,
      value: 0.6,
    },
  };

  const defaultBorderStyleState = {
    color: "#ffffff",
    opacity: 0.36,
    width: 0.8,
    hue: 0,
    saturation: 0,
    value: 1,
  };

  const defaultGraticuleStyleState = {
    color: "#ffffff",
    opacity: 0.12,
    width: 0.7,
    hue: 0,
    saturation: 0,
    value: 1,
  };

  const defaultEmpireStyleState = {
    romanComparison: {
      fillColor: "#C48B35",
      fillHue: 35,
      fillSaturation: 0.73,
      fillValue: 0.77,
    },
  };

  function cloneValue(value) {
    if (Array.isArray(value)) {
      return value.map(cloneValue);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)]),
      );
    }

    return value;
  }

  function getLayerDefinition(layerId) {
    return layerDefinitions[layerId] ?? null;
  }

  function getLayerChildrenDefinitions(layerId) {
    return (getLayerDefinition(layerId)?.children ?? [])
      .map((childId) => getLayerDefinition(childId))
      .filter(Boolean);
  }

  function getRootLayerDefinitions() {
    return Object.values(layerDefinitions).filter((definition) => !definition.parentId);
  }

  function getGenericLayerDefinitions() {
    return Object.values(layerDefinitions).filter((definition) => definition.parentId !== "empires");
  }

  function getDefinitionsBySection(sectionId) {
    return getRootLayerDefinitions().filter((definition) => definition.uiSection === sectionId);
  }

  function getLayerGroupUiKey(layerId) {
    return getLayerDefinition(layerId)?.uiOpenKey ?? null;
  }

  function getLayerRows(layerId) {
    return cloneValue(getLayerDefinition(layerId)?.rows ?? []);
  }

  function isExpandableLayer(layerId) {
    return getLayerRows(layerId).length > 0;
  }

  function getExpandableLayerDefinitions() {
    return Object.values(layerDefinitions).filter((definition) => (
      definition.uiOpenKey
      && definition.bodySectionId
      && isExpandableLayer(definition.id)
    ));
  }

  function getEmpireSublayerDefinitions() {
    return getLayerChildrenDefinitions("empires");
  }

  function getEmpireSublayerIds() {
    return getEmpireSublayerDefinitions().map((definition) => definition.id);
  }

  function getDefaultEmpireChildOnEnable() {
    return getLayerDefinition("empires")?.defaultChildOnEnable ?? null;
  }

  function getExpandableSectionDefinitions() {
    return getExpandableLayerDefinitions().map((definition) => ({
      layerId: definition.id,
      sectionId: definition.bodySectionId,
      uiOpenKey: definition.uiOpenKey,
    }));
  }

  function createLayerInstance(definitionId, overrides = {}) {
    const definition = getLayerDefinition(definitionId);
    if (!definition) {
      return null;
    }

    return {
      instanceId: overrides.instanceId ?? definitionId,
      definitionId,
      parentInstanceId: overrides.parentInstanceId ?? null,
      enabled: overrides.enabled ?? definition.defaultEnabled ?? false,
      uiOpen: overrides.uiOpen ?? false,
      childInstanceIds: overrides.childInstanceIds ?? definition.children.map((childId) => childId),
      settingsOverrides: cloneValue(overrides.settingsOverrides ?? {}),
      metadata: cloneValue(overrides.metadata ?? {}),
    };
  }

  function createSystemLayerInstances() {
    return Object.fromEntries(
      getRootLayerDefinitions().map((definition) => [definition.id, createLayerInstance(definition.id)]),
    );
  }

  function isRootLayer(definition) {
    return !definition.parentId;
  }

  function hasChildLayers(layerId) {
    return getLayerChildrenDefinitions(layerId).length > 0;
  }

  function createDefaultLayerState() {
    return Object.fromEntries(
      getGenericLayerDefinitions()
        .map((definition) => [definition.id, definition.defaultEnabled]),
    );
  }

  function createDefaultEmpireLayerState() {
    return Object.fromEntries(
      getEmpireSublayerDefinitions().map((definition) => [definition.id, definition.defaultEnabled]),
    );
  }

  function createDefaultEmpireQualityState() {
    return Object.fromEntries(
      getEmpireSublayerDefinitions().map((definition) => [definition.id, definition.defaultQuality]),
    );
  }

  function createDefaultEarthStyleState() {
    return cloneValue(defaultEarthStyleState);
  }

  function createDefaultBorderStyleState() {
    return cloneValue(defaultBorderStyleState);
  }

  function createDefaultGraticuleStyleState() {
    return cloneValue(defaultGraticuleStyleState);
  }

  function createDefaultEmpireStyleState() {
    return cloneValue(defaultEmpireStyleState);
  }

  window.AtlasLayersRegistry = {
    createDefaultBorderStyleState,
    createDefaultEarthStyleState,
    createDefaultEmpireLayerState,
    createDefaultEmpireQualityState,
    createDefaultEmpireStyleState,
    createDefaultGraticuleStyleState,
    createDefaultLayerState,
    createLayerInstance,
    createSystemLayerInstances,
    empireQualityLevels,
    getDefaultEmpireChildOnEnable,
    getDefinitionsBySection,
    getExpandableLayerDefinitions,
    getGenericLayerDefinitions,
    getEmpireSublayerDefinitions,
    getEmpireSublayerIds,
    getExpandableSectionDefinitions,
    hasChildLayers,
    isRootLayer,
    getLayerChildrenDefinitions,
    getLayerDefinition,
    getLayerGroupUiKey,
    getLayerRows,
    getRootLayerDefinitions,
    isExpandableLayer,
    layerDefinitions,
  };
})();
