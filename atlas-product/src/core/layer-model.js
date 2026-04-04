function createLayerModel() {
  const STORAGE_KEY = "atlas.layerState.v1";
  const SHARED_COLOR_STORAGE_KEY = "atlas.colors.customColors";
  const SHARED_COLOR_PRESETS = ["#000000", "#FFFFFF", "#d94b4b", "#e58a2b", "#e5c84a", "#5b8c5a", "#4b6ed9", "#8c5bd6"];

  function createFillRow({
    id,
    label = "Fill",
    layerId,
    storageKey = null,
    presets = [],
    defaultColor = "#000000",
    defaultOpacity = 100,
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
      initialState: {
        fillColor: defaultColor,
        fillOpacity: defaultOpacity,
      },
    };
  }

  function createLineRow({
    id,
    label = "Line",
    layerId,
    storageKey = null,
    presets = [],
    defaultColor = "#000000",
    defaultOpacity = 100,
    defaultWeight = 100,
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
      initialState: {
        lineColor: defaultColor,
        lineOpacity: defaultOpacity,
        lineWeight: defaultWeight,
      },
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
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#2C6F92",
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
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#6EAA6E",
            }),
            createLineRow({
              id: "land-line",
              layerId: "land",
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#e1efe4",
              defaultOpacity: 0,
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
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#8FA9BC",
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
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#8c6a2a",
            }),
            createLineRow({
              id: "roman-line",
              layerId: "roman",
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#c89a42",
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
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#b85c38",
            }),
            createLineRow({
              id: "mongol-line",
              layerId: "mongol",
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#d96f44",
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
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#c84b31",
            }),
            createLineRow({
              id: "british-line",
              layerId: "british",
              storageKey: SHARED_COLOR_STORAGE_KEY,
              presets: SHARED_COLOR_PRESETS,
              defaultColor: "#f07a58",
            }),
          ],
        },
      ],
    },
  };

  const ROOT_ROW_IDS = ["earth", "empires"];
  const rowDefinitionsById = new Map();

  function indexRowDefinitions(rows = []) {
    rows.forEach((row) => {
      rowDefinitionsById.set(row.id, row);
      if (Array.isArray(row.rows) && row.rows.length) {
        indexRowDefinitions(row.rows);
      }
    });
  }

  ROOT_ROW_IDS.forEach((id) => {
    const rootDefinition = layerDefinitions[id];
    if (!rootDefinition) {
      return;
    }
    rowDefinitionsById.set(rootDefinition.id, rootDefinition);
    indexRowDefinitions(rootDefinition.rows);
  });

  function getDefaultChildOrder(parentId) {
    return (layerDefinitions[parentId]?.rows ?? []).map((row) => row.id);
  }

  function buildDefaultLayerState() {
    const state = {
    earth: {
      expanded: layerDefinitions.earth.defaultExpanded,
      rowOrder: getDefaultChildOrder("earth"),
    },
    empires: {
      expanded: layerDefinitions.empires.defaultExpanded,
      rowOrder: getDefaultChildOrder("empires"),
    },
    };

    const ensureLayerState = (layerId) => {
      if (!state[layerId]) {
        state[layerId] = {};
      }
      return state[layerId];
    };

    const applyRowDefaults = (row) => {
      if (row?.type === "layer") {
        const layerRecord = ensureLayerState(row.layerId);
        if (typeof layerRecord.expanded !== "boolean") {
          layerRecord.expanded = false;
        }
        if (typeof layerRecord.visible !== "boolean") {
          layerRecord.visible = true;
        }
        row.rows?.forEach(applyRowDefaults);
        return;
      }

      if (!row?.initialState) {
        return;
      }

      const layerId =
        row.colorTarget?.layerId ??
        row.opacityTarget?.layerId ??
        row.weightTarget?.layerId ??
        row.target?.layerId;
      if (!layerId) {
        return;
      }

      const layerRecord = ensureLayerState(layerId);
      Object.entries(row.initialState).forEach(([key, value]) => {
        if (layerRecord[key] === undefined) {
          layerRecord[key] = value;
        }
      });
    };

    Object.values(layerDefinitions).forEach((definition) => {
      definition.rows?.forEach(applyRowDefaults);
    });

    return state;
  }

  const layerState = hydrateLayerState();

  function hydrateLayerState() {
    const baseState = buildDefaultLayerState();

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
    return ROOT_ROW_IDS.map((id) => layerDefinitions[id]);
  }

  function getChildRows(parentId) {
    const parent = rowDefinitionsById.get(parentId) ?? layerDefinitions[parentId];
    if (!parent?.rows?.length) {
      return [];
    }

    const rowById = new Map(parent.rows.map((row) => [row.id, row]));
    const persistedOrder = Array.isArray(layerState[parentId]?.rowOrder)
      ? layerState[parentId].rowOrder
      : [];
    const orderedRows = persistedOrder
      .map((id) => rowById.get(id))
      .filter(Boolean);

    parent.rows.forEach((row) => {
      if (!orderedRows.includes(row)) {
        orderedRows.push(row);
      }
    });

    return orderedRows;
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

  function toggleVisibility(layerId) {
    const record = layerState[layerId];
    if (!record || typeof record.visible !== "boolean") {
      return null;
    }

    record.visible = !record.visible;
    persistLayerState();
    return record.visible;
  }

  function reorderChildRow(parentId, rowId, targetRowId, placement = "before") {
    const parent = layerDefinitions[parentId];
    if (!parent?.rows?.length) {
      return null;
    }

    const currentOrder = getChildRows(parentId).map((row) => row.id);
    const fromIndex = currentOrder.indexOf(rowId);
    const targetIndex = currentOrder.indexOf(targetRowId);
    if (fromIndex === -1 || targetIndex === -1 || rowId === targetRowId) {
      return null;
    }

    const nextOrder = currentOrder.slice();
    const [moved] = nextOrder.splice(fromIndex, 1);
    let insertIndex = nextOrder.indexOf(targetRowId);
    if (insertIndex === -1) {
      return null;
    }
    if (placement === "after") {
      insertIndex += 1;
    }
    nextOrder.splice(insertIndex, 0, moved);

    layerState[parentId].rowOrder = nextOrder;
    persistLayerState();
    return nextOrder.slice();
  }

  function setChildRowOrder(parentId, nextOrder) {
    const parent = layerDefinitions[parentId];
    if (!parent?.rows?.length || !Array.isArray(nextOrder)) {
      return null;
    }

    const allowedIds = parent.rows.map((row) => row.id);
    if (
      nextOrder.length !== allowedIds.length
      || allowedIds.some((rowId) => !nextOrder.includes(rowId))
    ) {
      return null;
    }

    layerState[parentId].rowOrder = nextOrder.slice();
    persistLayerState();
    return layerState[parentId].rowOrder.slice();
  }

  return {
    getChildRows,
    getDefinitions,
    getRootRows,
    getRowValue,
    getState,
    reorderChildRow,
    setChildRowOrder,
    setRowValue,
    toggleExpanded,
    toggleVisibility,
  };
}

export { createLayerModel };
