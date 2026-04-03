function createLayerModel() {
  const layerDefinitions = {
    earth: {
      id: "earth",
      label: "Earth",
      kind: "group",
      defaultExpanded: true,
      rows: [
        {
          id: "ocean",
          type: "layer",
          label: "Ocean",
          layerId: "ocean",
          rows: [
            {
              id: "ocean-opacity",
              type: "slider",
              label: "Opacity",
              target: { kind: "layer-style", layerId: "ocean", key: "fillOpacity" },
              min: 0,
              max: 100,
              step: 1,
              valueFormat: "percent",
            },
          ],
        },
        {
          id: "land",
          type: "layer",
          label: "Land",
          layerId: "land",
          rows: [
            {
              id: "land-opacity",
              type: "slider",
              label: "Opacity",
              target: { kind: "layer-style", layerId: "land", key: "fillOpacity" },
              min: 0,
              max: 100,
              step: 1,
              valueFormat: "percent",
            },
          ],
        },
      ],
    },
    empires: {
      id: "empires",
      label: "Empires",
      kind: "group",
      defaultExpanded: true,
      rows: [
        {
          id: "roman",
          type: "layer",
          label: "Roman",
          layerId: "roman",
          rows: [
            {
              id: "roman-fill-opacity",
              type: "slider",
              label: "Opacity",
              target: { kind: "layer-style", layerId: "roman", key: "fillOpacity" },
              min: 0,
              max: 100,
              step: 1,
              valueFormat: "percent",
            },
          ],
        },
        {
          id: "mongol",
          type: "layer",
          label: "Mongol",
          layerId: "mongol",
          rows: [
            {
              id: "mongol-fill-opacity",
              type: "slider",
              label: "Opacity",
              target: { kind: "layer-style", layerId: "mongol", key: "fillOpacity" },
              min: 0,
              max: 100,
              step: 1,
              valueFormat: "percent",
            },
          ],
        },
        {
          id: "british",
          type: "layer",
          label: "British",
          layerId: "british",
          rows: [
            {
              id: "british-fill-opacity",
              type: "slider",
              label: "Opacity",
              target: { kind: "layer-style", layerId: "british", key: "fillOpacity" },
              min: 0,
              max: 100,
              step: 1,
              valueFormat: "percent",
            },
          ],
        },
      ],
    },
  };

  const layerState = {
    earth: {
      expanded: layerDefinitions.earth.defaultExpanded,
    },
    empires: {
      expanded: layerDefinitions.empires.defaultExpanded,
    },
    roman: {
      expanded: true,
      fillOpacity: 100,
    },
    mongol: {
      expanded: false,
      fillOpacity: 100,
    },
    british: {
      expanded: false,
      fillOpacity: 100,
    },
    ocean: {
      expanded: false,
      fillOpacity: 100,
    },
    land: {
      expanded: false,
      fillOpacity: 94,
    },
  };

  function getRootRows() {
    return ["earth", "empires"].map((id) => layerDefinitions[id]);
  }

  function getDefinitions() {
    return structuredClone(layerDefinitions);
  }

  function getState() {
    return structuredClone(layerState);
  }

  function getRowValue(row) {
    const target = row?.target;
    if (target?.kind !== "layer-style") {
      return null;
    }

    return layerState[target.layerId]?.[target.key] ?? null;
  }

  function setRowValue(row, nextValue) {
    const target = row?.target;
    if (target?.kind !== "layer-style") {
      return null;
    }

    if (!layerState[target.layerId]) {
      return null;
    }

    layerState[target.layerId][target.key] = nextValue;
    return {
      layerId: target.layerId,
      key: target.key,
      value: nextValue,
    };
  }

  function toggleExpanded(layerId) {
    const record = layerState[layerId];
    if (!record || typeof record.expanded !== "boolean") {
      return null;
    }

    record.expanded = !record.expanded;
    return record.expanded;
  }

  return {
    getDefinitions,
    getRootRows,
    getRowValue,
    getState,
    setRowValue,
    toggleExpanded,
  };
}

export { createLayerModel };
