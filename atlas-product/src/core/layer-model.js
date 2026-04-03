function createLayerModel() {
  const STORAGE_KEY = "atlas.layerState.v1";

  function createFillRow({
    id,
    label = "Fill",
    layerId,
    storageKey = null,
    presets = [],
  }) {
    return {
      id,
      type: "fill",
      label,
      colorTarget: { kind: "layer-style", layerId, key: "fillColor" },
      opacityTarget: { kind: "layer-style", layerId, key: "fillOpacity" },
      storageKey,
      presets,
      min: 0,
      max: 100,
      step: 1,
      valueFormat: "percent",
    };
  }

  function createLineRow({
    id,
    label = "Line",
    layerId,
    storageKey = null,
    presets = [],
  }) {
    return {
      id,
      type: "line",
      label,
      colorTarget: { kind: "layer-style", layerId, key: "lineColor" },
      opacityTarget: { kind: "layer-style", layerId, key: "lineOpacity" },
      weightTarget: { kind: "layer-style", layerId, key: "lineWeight" },
      storageKey,
      presets,
      min: 0,
      max: 100,
      step: 1,
      valueFormat: "points",
      weightMin: 25,
      weightMax: 250,
      weightStep: 1,
    };
  }

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
            createFillRow({
              id: "ocean-fill",
              layerId: "ocean",
              storageKey: "atlas.colors.customColors",
              presets: ["#000000", "#FFFFFF", "#2C6F92", "#1F5A77", "#3A88B3", "#5B8C5A", "#D9C27A", "#4B6ED9"],
            }),
          ],
        },
        {
          id: "land",
          type: "layer",
          label: "Land",
          layerId: "land",
          rows: [
            createFillRow({
              id: "land-fill",
              layerId: "land",
              storageKey: "atlas.colors.customColors",
              presets: ["#000000", "#FFFFFF", "#6EAA6E", "#5B8F5B", "#93C07A", "#D9C27A", "#C84B31", "#4B6ED9"],
            }),
          ],
        },
        {
          id: "graticules",
          type: "layer",
          label: "Graticules",
          layerId: "graticules",
          rows: [
            createLineRow({
              id: "graticules-line",
              layerId: "graticules",
              storageKey: "atlas.colors.customColors",
              presets: ["#000000", "#FFFFFF", "#C8D7E2", "#8FA9BC", "#4B6ED9", "#D9C27A", "#5B8C5A", "#C84B31"],
            }),
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
            createFillRow({
              id: "roman-fill",
              layerId: "roman",
              storageKey: "atlas.colors.customColors",
              presets: ["#000000", "#FFFFFF", "#d94b4b", "#e58a2b", "#e5c84a", "#5b8c5a", "#4b6ed9", "#8c5bd6"],
            }),
            createLineRow({
              id: "roman-line",
              layerId: "roman",
              storageKey: "atlas.colors.customColors",
              presets: ["#000000", "#FFFFFF", "#c89a42", "#d94b4b", "#e58a2b", "#e5c84a", "#5b8c5a", "#4b6ed9"],
            }),
          ],
        },
        {
          id: "mongol",
          type: "layer",
          label: "Mongol",
          layerId: "mongol",
          rows: [
            createFillRow({
              id: "mongol-fill",
              layerId: "mongol",
              storageKey: "atlas.colors.customColors",
              presets: ["#000000", "#FFFFFF", "#b85c38", "#d94b4b", "#e58a2b", "#e5c84a", "#5b8c5a", "#4b6ed9"],
            }),
            createLineRow({
              id: "mongol-line",
              layerId: "mongol",
              storageKey: "atlas.colors.customColors",
              presets: ["#000000", "#FFFFFF", "#d96f44", "#d94b4b", "#e58a2b", "#e5c84a", "#5b8c5a", "#4b6ed9"],
            }),
          ],
        },
        {
          id: "british",
          type: "layer",
          label: "British",
          layerId: "british",
          rows: [
            createFillRow({
              id: "british-fill",
              layerId: "british",
              storageKey: "atlas.colors.customColors",
              presets: ["#000000", "#FFFFFF", "#c84b31", "#d94b4b", "#e58a2b", "#e5c84a", "#5b8c5a", "#4b6ed9"],
            }),
            createLineRow({
              id: "british-line",
              layerId: "british",
              storageKey: "atlas.colors.customColors",
              presets: ["#000000", "#FFFFFF", "#f07a58", "#d94b4b", "#e58a2b", "#e5c84a", "#5b8c5a", "#4b6ed9"],
            }),
          ],
        },
      ],
    },
  };

  const defaultLayerState = {
    earth: {
      expanded: layerDefinitions.earth.defaultExpanded,
    },
    empires: {
      expanded: layerDefinitions.empires.defaultExpanded,
    },
    roman: {
      expanded: true,
      fillColor: "#8c6a2a",
      fillOpacity: 100,
      lineColor: "#c89a42",
      lineOpacity: 100,
      lineWeight: 100,
    },
    mongol: {
      expanded: false,
      fillOpacity: 100,
      lineColor: "#d96f44",
      lineOpacity: 100,
      lineWeight: 100,
    },
    british: {
      expanded: false,
      fillColor: "#c84b31",
      fillOpacity: 100,
      lineColor: "#f07a58",
      lineOpacity: 100,
      lineWeight: 100,
    },
    ocean: {
      expanded: false,
      fillColor: "#2C6F92",
      fillOpacity: 100,
    },
    land: {
      expanded: false,
      fillColor: "#6EAA6E",
      fillOpacity: 100,
    },
    graticules: {
      expanded: false,
      lineColor: "#8FA9BC",
      lineOpacity: 100,
      lineWeight: 100,
    },
  };

  const layerState = hydrateLayerState();

  function hydrateLayerState() {
    const baseState = structuredClone(defaultLayerState);

    try {
      const raw = window.localStorage?.getItem(STORAGE_KEY);
      if (!raw) {
        return baseState;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return baseState;
      }

      Object.entries(baseState).forEach(([layerId, defaults]) => {
        const persisted = parsed[layerId];
        if (!persisted || typeof persisted !== "object") {
          return;
        }

        Object.keys(defaults).forEach((key) => {
          if (persisted[key] !== undefined) {
            baseState[layerId][key] = persisted[key];
          }
        });
      });
    } catch (_error) {
      return baseState;
    }

    return baseState;
  }

  function persistLayerState() {
    try {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(layerState));
    } catch (_error) {
      // Ignore storage failures and keep the runtime usable.
    }
  }

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
    if (row?.type === "fill") {
      return {
        color: layerState[row.colorTarget?.layerId]?.[row.colorTarget?.key] ?? null,
        opacity: layerState[row.opacityTarget?.layerId]?.[row.opacityTarget?.key] ?? null,
      };
    }

    if (row?.type === "line") {
      return {
        color: layerState[row.colorTarget?.layerId]?.[row.colorTarget?.key] ?? null,
        opacity: layerState[row.opacityTarget?.layerId]?.[row.opacityTarget?.key] ?? null,
        weight: layerState[row.weightTarget?.layerId]?.[row.weightTarget?.key] ?? null,
      };
    }

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
    persistLayerState();
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
    persistLayerState();
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
