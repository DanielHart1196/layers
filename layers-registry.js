function createSliderRow({
    controlId,
    rowElementId,
    label,
    inputId,
    valueElementId = null,
    min,
    max,
    step,
    binding = null,
    valueFormat = null,
    uiSync = null,
    renderPasses = null,
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
      binding,
      valueFormat,
      uiSync,
      renderPasses,
    };
  }

  function createColorRow({ controlId, rowElementId }) {
    return {
      type: "color",
      controlId,
      rowElementId,
    };
  }

  const SHARED_COLOR_STORAGE_KEY = "atlas.colors.customColors";

  const colorControlDefinitions = {
    border: {
      controlId: "border",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "borderColor",
      paletteOpenKey: "isBorderColorPaletteOpen",
      inputId: "borderColorInput",
      valueId: "borderColorValue",
      inlineDotId: "borderColorInlineDot",
      swatchButtonId: "borderColorSwatchButton",
      customsId: "borderColorCustoms",
      presetSelector: "[data-border-color]",
      panelId: "borderColorPanel",
      fieldId: "borderColorField",
      fieldHandleId: "borderColorFieldHandle",
      hueSliderId: "borderColorHueSlider",
      hueHandleId: "borderColorHueHandle",
      addButtonId: "borderColorAddButton",
      styleBinding: {
        scope: "border",
        colorKey: "color",
        hueKey: "hue",
        saturationKey: "saturation",
        valueKey: "value",
      },
      renderPasses: ["overlay", "poster"],
    },
    graticule: {
      controlId: "graticule",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "graticuleColor",
      paletteOpenKey: "isGraticuleColorPaletteOpen",
      inputId: "graticuleColorInput",
      valueId: "graticuleColorValue",
      inlineDotId: "graticuleColorInlineDot",
      swatchButtonId: "graticuleColorSwatchButton",
      customsId: "graticuleColorCustoms",
      presetSelector: "[data-graticule-color]",
      panelId: "graticuleColorPanel",
      fieldId: "graticuleColorField",
      fieldHandleId: "graticuleColorFieldHandle",
      hueSliderId: "graticuleColorHueSlider",
      hueHandleId: "graticuleColorHueHandle",
      addButtonId: "graticuleColorAddButton",
      styleBinding: {
        scope: "graticule",
        colorKey: "color",
        hueKey: "hue",
        saturationKey: "saturation",
        valueKey: "value",
      },
      renderPasses: ["overlay", "poster"],
    },
    land: {
      controlId: "land",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "landColor",
      paletteOpenKey: "isLandColorPaletteOpen",
      inputId: "landColorInput",
      valueId: "landColorValue",
      inlineDotId: "landColorInlineDot",
      swatchButtonId: "landColorSwatchButton",
      customsId: "landColorCustoms",
      presetSelector: "[data-land-color]",
      panelId: "landColorPanel",
      fieldId: "landColorField",
      fieldHandleId: "landColorFieldHandle",
      hueSliderId: "landColorHueSlider",
      hueHandleId: "landColorHueHandle",
      addButtonId: "landColorAddButton",
      styleBinding: {
        scope: "earth.land",
        colorKey: "color",
        hueKey: "hue",
        saturationKey: "saturation",
        valueKey: "value",
      },
      renderPasses: ["overlay", "poster"],
    },
    water: {
      controlId: "water",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "waterColor",
      paletteOpenKey: "isWaterColorPaletteOpen",
      inputId: "waterColorInput",
      valueId: "waterColorValue",
      inlineDotId: "waterColorInlineDot",
      swatchButtonId: "waterColorSwatchButton",
      customsId: "waterColorCustoms",
      presetSelector: "[data-water-color]",
      panelId: "waterColorPanel",
      fieldId: "waterColorField",
      fieldHandleId: "waterColorFieldHandle",
      hueSliderId: "waterColorHueSlider",
      hueHandleId: "waterColorHueHandle",
      addButtonId: "waterColorAddButton",
      styleBinding: {
        scope: "earth.water",
        colorKey: "color",
        hueKey: "hue",
        saturationKey: "saturation",
        valueKey: "value",
      },
      renderPasses: ["overlay", "poster"],
    },
    romanEmpireFill: {
      controlId: "romanEmpireFill",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "romanEmpireFillColor",
      paletteOpenKey: "isRomanEmpireFillColorPaletteOpen",
      inputId: "romanEmpireFillColorInput",
      valueId: "romanEmpireFillColorValue",
      inlineDotId: "romanEmpireFillColorInlineDot",
      swatchButtonId: "romanEmpireFillColorSwatchButton",
      customsId: "romanEmpireFillColorCustoms",
      presetSelector: "[data-roman-empire-fill-color]",
      panelId: "romanEmpireFillColorPanel",
      fieldId: "romanEmpireFillColorField",
      fieldHandleId: "romanEmpireFillColorFieldHandle",
      hueSliderId: "romanEmpireFillColorHueSlider",
      hueHandleId: "romanEmpireFillColorHueHandle",
      addButtonId: "romanEmpireFillColorAddButton",
      styleBinding: {
        scope: "layers.roman",
        colorKey: "fillColor",
        hueKey: "fillHue",
        saturationKey: "fillSaturation",
        valueKey: "fillValue",
      },
      renderPasses: ["empire", "poster"],
    },
    romanEmpireBorder: {
      controlId: "romanEmpireBorder",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "romanEmpireBorderColor",
      paletteOpenKey: "isRomanEmpireBorderColorPaletteOpen",
      inputId: "romanEmpireBorderColorInput",
      valueId: "romanEmpireBorderColorValue",
      inlineDotId: "romanEmpireBorderColorInlineDot",
      swatchButtonId: "romanEmpireBorderColorSwatchButton",
      customsId: "romanEmpireBorderColorCustoms",
      presetSelector: "[data-roman-empire-border-color]",
      panelId: "romanEmpireBorderColorPanel",
      fieldId: "romanEmpireBorderColorField",
      fieldHandleId: "romanEmpireBorderColorFieldHandle",
      hueSliderId: "romanEmpireBorderColorHueSlider",
      hueHandleId: "romanEmpireBorderColorHueHandle",
      addButtonId: "romanEmpireBorderColorAddButton",
      styleBinding: {
        scope: "layers.roman",
        colorKey: "strokeColor",
        hueKey: "strokeHue",
        saturationKey: "strokeSaturation",
        valueKey: "strokeValue",
      },
      renderPasses: ["empire", "poster"],
    },
    mongolEmpireFill: {
      controlId: "mongolEmpireFill",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "mongolEmpireFillColor",
      paletteOpenKey: "isMongolEmpireFillColorPaletteOpen",
      inputId: "mongolEmpireFillColorInput",
      valueId: "mongolEmpireFillColorValue",
      inlineDotId: "mongolEmpireFillColorInlineDot",
      swatchButtonId: "mongolEmpireFillColorSwatchButton",
      customsId: "mongolEmpireFillColorCustoms",
      presetSelector: "[data-mongol-empire-fill-color]",
      panelId: "mongolEmpireFillColorPanel",
      fieldId: "mongolEmpireFillColorField",
      fieldHandleId: "mongolEmpireFillColorFieldHandle",
      hueSliderId: "mongolEmpireFillColorHueSlider",
      hueHandleId: "mongolEmpireFillColorHueHandle",
      addButtonId: "mongolEmpireFillColorAddButton",
      styleBinding: {
        scope: "layers.mongol",
        colorKey: "fillColor",
        hueKey: "fillHue",
        saturationKey: "fillSaturation",
        valueKey: "fillValue",
      },
      renderPasses: ["empire", "poster"],
    },
    mongolEmpireBorder: {
      controlId: "mongolEmpireBorder",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "mongolEmpireBorderColor",
      paletteOpenKey: "isMongolEmpireBorderColorPaletteOpen",
      inputId: "mongolEmpireBorderColorInput",
      valueId: "mongolEmpireBorderColorValue",
      inlineDotId: "mongolEmpireBorderColorInlineDot",
      swatchButtonId: "mongolEmpireBorderColorSwatchButton",
      customsId: "mongolEmpireBorderColorCustoms",
      presetSelector: "[data-mongol-empire-border-color]",
      panelId: "mongolEmpireBorderColorPanel",
      fieldId: "mongolEmpireBorderColorField",
      fieldHandleId: "mongolEmpireBorderColorFieldHandle",
      hueSliderId: "mongolEmpireBorderColorHueSlider",
      hueHandleId: "mongolEmpireBorderColorHueHandle",
      addButtonId: "mongolEmpireBorderColorAddButton",
      styleBinding: {
        scope: "layers.mongol",
        colorKey: "strokeColor",
        hueKey: "strokeHue",
        saturationKey: "strokeSaturation",
        valueKey: "strokeValue",
      },
      renderPasses: ["empire", "poster"],
    },
    britishEmpireFill: {
      controlId: "britishEmpireFill",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "britishEmpireFillColor",
      paletteOpenKey: "isBritishEmpireFillColorPaletteOpen",
      inputId: "britishEmpireFillColorInput",
      valueId: "britishEmpireFillColorValue",
      inlineDotId: "britishEmpireFillColorInlineDot",
      swatchButtonId: "britishEmpireFillColorSwatchButton",
      customsId: "britishEmpireFillColorCustoms",
      presetSelector: "[data-british-empire-fill-color]",
      panelId: "britishEmpireFillColorPanel",
      fieldId: "britishEmpireFillColorField",
      fieldHandleId: "britishEmpireFillColorFieldHandle",
      hueSliderId: "britishEmpireFillColorHueSlider",
      hueHandleId: "britishEmpireFillColorHueHandle",
      addButtonId: "britishEmpireFillColorAddButton",
      styleBinding: {
        scope: "layers.british",
        colorKey: "fillColor",
        hueKey: "fillHue",
        saturationKey: "fillSaturation",
        valueKey: "fillValue",
      },
      renderPasses: ["empire", "poster"],
    },
    britishEmpireBorder: {
      controlId: "britishEmpireBorder",
      storageKey: SHARED_COLOR_STORAGE_KEY,
      datasetKey: "britishEmpireBorderColor",
      paletteOpenKey: "isBritishEmpireBorderColorPaletteOpen",
      inputId: "britishEmpireBorderColorInput",
      valueId: "britishEmpireBorderColorValue",
      inlineDotId: "britishEmpireBorderColorInlineDot",
      swatchButtonId: "britishEmpireBorderColorSwatchButton",
      customsId: "britishEmpireBorderColorCustoms",
      presetSelector: "[data-british-empire-border-color]",
      panelId: "britishEmpireBorderColorPanel",
      fieldId: "britishEmpireBorderColorField",
      fieldHandleId: "britishEmpireBorderColorFieldHandle",
      hueSliderId: "britishEmpireBorderColorHueSlider",
      hueHandleId: "britishEmpireBorderColorHueHandle",
      addButtonId: "britishEmpireBorderColorAddButton",
      styleBinding: {
        scope: "layers.british",
        colorKey: "strokeColor",
        hueKey: "strokeHue",
        saturationKey: "strokeSaturation",
        valueKey: "strokeValue",
      },
      renderPasses: ["empire", "poster"],
    },
  };

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
      controls: ["landColor", "waterColor"],
      rows: [
        createColorRow({ controlId: "land", rowElementId: "landColorRow" }),
        createColorRow({ controlId: "water", rowElementId: "waterColorRow" }),
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
      children: ["roman", "mongol", "british"],
      defaultChildOnEnable: "roman",
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
          binding: { kind: "empireQualityAll" },
          valueFormat: "qualityLabel",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
        { type: "layer", layerId: "roman", rowElementId: "romanEmpireLayerGroup" },
        { type: "layer", layerId: "mongol", rowElementId: "mongolEmpireLayerGroup" },
        { type: "layer", layerId: "british", rowElementId: "britishEmpireLayerGroup" },
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
          binding: { kind: "float", scope: "border", key: "width" },
          valueFormat: "widthPx",
          uiSync: "border",
          renderPasses: ["overlay", "poster"],
        }),
        createColorRow({ controlId: "border", rowElementId: "borderColorRow" }),
        createSliderRow({
          controlId: "borderOpacity",
          rowElementId: "borderOpacityRow",
          label: "Opacity",
          inputId: "borderOpacityInput",
          valueElementId: "borderOpacityValue",
          min: 0,
          max: 100,
          step: 1,
          binding: { kind: "percent", scope: "border", key: "opacity" },
          valueFormat: "percent",
          uiSync: "border",
          renderPasses: ["overlay", "poster"],
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
          binding: { kind: "float", scope: "graticule", key: "width" },
          valueFormat: "widthPx",
          uiSync: "graticule",
          renderPasses: ["overlay", "poster"],
        }),
        createColorRow({ controlId: "graticule", rowElementId: "graticuleColorRow" }),
        createSliderRow({
          controlId: "graticuleOpacity",
          rowElementId: "graticuleOpacityRow",
          label: "Opacity",
          inputId: "graticuleOpacityInput",
          valueElementId: "graticuleOpacityValue",
          min: 0,
          max: 100,
          step: 1,
          binding: { kind: "percent", scope: "graticule", key: "opacity" },
          valueFormat: "percent",
          uiSync: "graticule",
          renderPasses: ["overlay", "poster"],
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
    roman: {
      id: "roman",
      definitionType: "layer-definition",
      layerKind: "thematic",
      ownerType: "system",
      parentId: "empires",
      defaultEnabled: true,
      defaultQuality: "medium",
      uiOpenKey: "isRomanEmpireGroupOpen",
      uiSection: "layers",
      children: [],
      controls: ["romanEmpireFill", "romanEmpireFillOpacity", "romanEmpireBorder", "romanEmpireBorderWidth", "romanEmpireBorderOpacity"],
      rows: [
        createColorRow({ controlId: "romanEmpireFill", rowElementId: "romanEmpireFillRow" }),
        createSliderRow({
          controlId: "romanEmpireFillOpacity",
          rowElementId: "romanEmpireFillOpacityRow",
          label: "Fill Opacity",
          inputId: "romanEmpireFillOpacityInput",
          valueElementId: "romanEmpireFillOpacityValue",
          min: 0,
          max: 100,
          step: 1,
          binding: { kind: "percent", scope: "layers.roman", key: "fillOpacity" },
          valueFormat: "percent",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
        createColorRow({ controlId: "romanEmpireBorder", rowElementId: "romanEmpireBorderRow" }),
        createSliderRow({
          controlId: "romanEmpireBorderWidth",
          rowElementId: "romanEmpireBorderWidthRow",
          label: "Stroke Width",
          inputId: "romanEmpireBorderWidthInput",
          valueElementId: "romanEmpireBorderWidthValue",
          min: 0.4,
          max: 3,
          step: 0.1,
          binding: { kind: "float", scope: "layers.roman", key: "strokeWidth" },
          valueFormat: "widthPx",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
        createSliderRow({
          controlId: "romanEmpireBorderOpacity",
          rowElementId: "romanEmpireBorderOpacityRow",
          label: "Border Opacity",
          inputId: "romanEmpireBorderOpacityInput",
          valueElementId: "romanEmpireBorderOpacityValue",
          min: 0,
          max: 100,
          step: 1,
          binding: { kind: "percent", scope: "layers.roman", key: "strokeOpacity" },
          valueFormat: "percent",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
      ],
      bodySectionId: "romanEmpireLayerControls",
      renderSource: "roman",
    },
    mongol: {
      id: "mongol",
      definitionType: "layer-definition",
      layerKind: "thematic",
      ownerType: "system",
      parentId: "empires",
      defaultEnabled: false,
      defaultQuality: "medium",
      uiOpenKey: "isMongolEmpireGroupOpen",
      uiSection: "layers",
      children: [],
      controls: ["mongolEmpireFill", "mongolEmpireFillOpacity", "mongolEmpireBorder", "mongolEmpireBorderWidth", "mongolEmpireBorderOpacity"],
      rows: [
        createColorRow({ controlId: "mongolEmpireFill", rowElementId: "mongolEmpireFillRow" }),
        createSliderRow({
          controlId: "mongolEmpireFillOpacity",
          rowElementId: "mongolEmpireFillOpacityRow",
          label: "Fill Opacity",
          inputId: "mongolEmpireFillOpacityInput",
          valueElementId: "mongolEmpireFillOpacityValue",
          min: 0,
          max: 100,
          step: 1,
          binding: { kind: "percent", scope: "layers.mongol", key: "fillOpacity" },
          valueFormat: "percent",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
        createColorRow({ controlId: "mongolEmpireBorder", rowElementId: "mongolEmpireBorderRow" }),
        createSliderRow({
          controlId: "mongolEmpireBorderWidth",
          rowElementId: "mongolEmpireBorderWidthRow",
          label: "Stroke Width",
          inputId: "mongolEmpireBorderWidthInput",
          valueElementId: "mongolEmpireBorderWidthValue",
          min: 0.4,
          max: 3,
          step: 0.1,
          binding: { kind: "float", scope: "layers.mongol", key: "strokeWidth" },
          valueFormat: "widthPx",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
        createSliderRow({
          controlId: "mongolEmpireBorderOpacity",
          rowElementId: "mongolEmpireBorderOpacityRow",
          label: "Border Opacity",
          inputId: "mongolEmpireBorderOpacityInput",
          valueElementId: "mongolEmpireBorderOpacityValue",
          min: 0,
          max: 100,
          step: 1,
          binding: { kind: "percent", scope: "layers.mongol", key: "strokeOpacity" },
          valueFormat: "percent",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
      ],
      bodySectionId: "mongolEmpireLayerControls",
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
      uiOpenKey: "isBritishEmpireGroupOpen",
      uiSection: "layers",
      children: [],
      controls: ["britishEmpireFill", "britishEmpireFillOpacity", "britishEmpireBorder", "britishEmpireBorderWidth", "britishEmpireBorderOpacity"],
      rows: [
        createColorRow({ controlId: "britishEmpireFill", rowElementId: "britishEmpireFillRow" }),
        createSliderRow({
          controlId: "britishEmpireFillOpacity",
          rowElementId: "britishEmpireFillOpacityRow",
          label: "Fill Opacity",
          inputId: "britishEmpireFillOpacityInput",
          valueElementId: "britishEmpireFillOpacityValue",
          min: 0,
          max: 100,
          step: 1,
          binding: { kind: "percent", scope: "layers.british", key: "fillOpacity" },
          valueFormat: "percent",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
        createColorRow({ controlId: "britishEmpireBorder", rowElementId: "britishEmpireBorderRow" }),
        createSliderRow({
          controlId: "britishEmpireBorderWidth",
          rowElementId: "britishEmpireBorderWidthRow",
          label: "Stroke Width",
          inputId: "britishEmpireBorderWidthInput",
          valueElementId: "britishEmpireBorderWidthValue",
          min: 0.4,
          max: 3,
          step: 0.1,
          binding: { kind: "float", scope: "layers.british", key: "strokeWidth" },
          valueFormat: "widthPx",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
        createSliderRow({
          controlId: "britishEmpireBorderOpacity",
          rowElementId: "britishEmpireBorderOpacityRow",
          label: "Border Opacity",
          inputId: "britishEmpireBorderOpacityInput",
          valueElementId: "britishEmpireBorderOpacityValue",
          min: 0,
          max: 100,
          step: 1,
          binding: { kind: "percent", scope: "layers.british", key: "strokeOpacity" },
          valueFormat: "percent",
          uiSync: "empire",
          renderPasses: ["empire", "poster"],
        }),
      ],
      bodySectionId: "britishEmpireLayerControls",
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

  const defaultLayerStyleState = {
    roman: {
      fillColor: "#C48B35",
      fillOpacity: 0.22,
      fillHue: 35,
      fillSaturation: 0.73,
      fillValue: 0.77,
      strokeColor: "#B07825",
      strokeOpacity: 0.9,
      strokeWidth: 1.1,
      strokeHue: 37,
      strokeSaturation: 0.79,
      strokeValue: 0.69,
    },
    mongol: {
      fillColor: "#C48B35",
      fillOpacity: 0.22,
      fillHue: 35,
      fillSaturation: 0.73,
      fillValue: 0.77,
      strokeColor: "#B07825",
      strokeOpacity: 0.9,
      strokeWidth: 1.1,
      strokeHue: 37,
      strokeSaturation: 0.79,
      strokeValue: 0.69,
    },
    british: {
      fillColor: "#C48B35",
      fillOpacity: 0.22,
      fillHue: 35,
      fillSaturation: 0.73,
      fillValue: 0.77,
      strokeColor: "#B07825",
      strokeOpacity: 0.9,
      strokeWidth: 1.1,
      strokeHue: 37,
      strokeSaturation: 0.79,
      strokeValue: 0.69,
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

  function getColorControlDefinition(controlId) {
    return cloneValue(colorControlDefinitions[controlId] ?? null);
  }

  function getColorControlDefinitions() {
    return cloneValue(colorControlDefinitions);
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
    return Object.values(layerDefinitions);
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

  function getSliderControlDefinition(controlId) {
    return cloneValue(
      Object.values(layerDefinitions)
        .flatMap((definition) => definition.rows ?? [])
        .find((row) => row.type === "slider" && row.controlId === controlId)
        ?? null,
    );
  }

  function getSliderControlDefinitions() {
    return Object.fromEntries(
      Object.values(layerDefinitions)
        .flatMap((definition) => definition.rows ?? [])
        .filter((row) => row.type === "slider" && row.controlId)
        .map((row) => [row.controlId, cloneValue(row)]),
    );
  }

  function resolveStyleScope(scope, {
    borderStyleState,
    graticuleStyleState,
    earthStyleState,
    layerStyleState,
  }) {
    switch (scope) {
      case "border":
        return borderStyleState;
      case "graticule":
        return graticuleStyleState;
      case "earth.land":
        return earthStyleState.land;
      case "earth.water":
        return earthStyleState.water;
      case "layers.roman":
        return layerStyleState.roman;
      case "layers.mongol":
        return layerStyleState.mongol;
      case "layers.british":
        return layerStyleState.british;
      default:
        return null;
    }
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

  function createDefaultLayerStyleState() {
    return cloneValue(defaultLayerStyleState);
  }

const AtlasLayersRegistry = {
  colorControlDefinitions,
  createDefaultBorderStyleState,
  createDefaultEarthStyleState,
  createDefaultEmpireQualityState,
  createDefaultLayerStyleState,
  createDefaultGraticuleStyleState,
  createDefaultLayerState,
  createLayerInstance,
  createSystemLayerInstances,
  empireQualityLevels,
  getColorControlDefinition,
  getColorControlDefinitions,
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
  getSliderControlDefinition,
  getSliderControlDefinitions,
  resolveStyleScope,
  isExpandableLayer,
  layerDefinitions,
};

export {
  colorControlDefinitions,
  createDefaultBorderStyleState,
  createDefaultEarthStyleState,
  createDefaultEmpireQualityState,
  createDefaultLayerStyleState,
  createDefaultGraticuleStyleState,
  createDefaultLayerState,
  createLayerInstance,
  createSystemLayerInstances,
  empireQualityLevels,
  getColorControlDefinition,
  getColorControlDefinitions,
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
  getSliderControlDefinition,
  getSliderControlDefinitions,
  resolveStyleScope,
  isExpandableLayer,
  layerDefinitions,
};

export default AtlasLayersRegistry;

window.AtlasLayersRegistry = AtlasLayersRegistry;
