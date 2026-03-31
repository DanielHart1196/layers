import {
  getColorControlDefinitions,
  getColorControlPersistenceDefinition,
  getSliderControlDefinitions,
  getSliderControlPersistenceDefinition,
  resolveStyleScope,
} from "./layers-registry.js";

  function ensureScopeObject(root, scope) {
    return scope.split(".").reduce((current, segment) => {
      if (!current[segment] || typeof current[segment] !== "object") {
        current[segment] = {};
      }
      return current[segment];
    }, root);
  }

  function getScopeObject(root, scope) {
    return scope.split(".").reduce((current, segment) => current?.[segment], root) ?? null;
  }

function saveStyleSettings({
  storage,
  storageKey,
  borderStyleState,
  graticuleStyleState,
  earthStyleState,
  layerStyleState,
}) {
    try {
      const payload = {};

      Object.values(getColorControlDefinitions()).forEach((definition) => {
        const persistence = getColorControlPersistenceDefinition(definition?.controlId);
        if (!persistence || persistence.domain !== "style") {
          return;
        }
        const scopeTarget = resolveStyleScope(persistence.scope, {
          borderStyleState,
          graticuleStyleState,
          earthStyleState,
          layerStyleState,
        });
        if (!scopeTarget) {
          return;
        }
        ensureScopeObject(payload, persistence.scope)[persistence.key] = scopeTarget[persistence.key];
      });

      Object.values(getSliderControlDefinitions()).forEach((definition) => {
        const persistence = getSliderControlPersistenceDefinition(definition?.controlId);
        if (!persistence || persistence.domain !== "style") {
          return;
        }
        const scopeTarget = resolveStyleScope(persistence.scope, {
          borderStyleState,
          graticuleStyleState,
          earthStyleState,
          layerStyleState,
        });
        if (!scopeTarget) {
          return;
        }
        ensureScopeObject(payload, persistence.scope)[persistence.key] = scopeTarget[persistence.key];
      });

      storage?.setItem(
        storageKey,
        JSON.stringify(payload),
      );
    } catch (error) {
      // Ignore persistence failures and keep runtime state.
    }
  }

function loadStyleSettings({
  storage,
  storageKey,
  normalizeHexColor,
  clamp,
  applyPersistedColorControlValue,
  borderStyleState,
  graticuleStyleState,
  earthStyleState,
  layerStyleState,
}) {
    try {
      const stored = storage?.getItem(storageKey);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      Object.values(getColorControlDefinitions()).forEach((definition) => {
        const persistence = getColorControlPersistenceDefinition(definition?.controlId);
        if (!persistence || persistence.domain !== "style") {
          return;
        }
        const scopeObject = getScopeObject(parsed, persistence.scope);
        const colorValue = normalizeHexColor(scopeObject?.[persistence.key]);
        if (colorValue) {
          applyPersistedColorControlValue(definition.controlId, colorValue);
        }
      });

      Object.values(getSliderControlDefinitions()).forEach((definition) => {
        const persistence = getSliderControlPersistenceDefinition(definition?.controlId);
        if (!persistence || persistence.domain !== "style") {
          return;
        }
        const scopeTarget = resolveStyleScope(persistence.scope, {
          borderStyleState,
          graticuleStyleState,
          earthStyleState,
          layerStyleState,
        });
        const scopeObject = getScopeObject(parsed, persistence.scope);
        const rawValue = Number(scopeObject?.[persistence.key]);
        if (!scopeTarget || !Number.isFinite(rawValue)) {
          return;
        }

        if (persistence.valueType === "percent") {
          scopeTarget[persistence.key] = clamp(rawValue, 0, 1);
          return;
        }

        if (persistence.valueType === "float") {
          scopeTarget[persistence.key] = clamp(rawValue, persistence.min, persistence.max);
        }
      });
    } catch (error) {
      // Ignore invalid persisted data.
    }
  }

  function saveViewState({
    storage,
    storageKey,
    projectionState,
    zoomState,
    rotationOffset,
    flatProjectionPanOffsets,
    layerState,
    layerTemporalState,
    empireQualityState,
    temporalState,
  }) {
    try {
      const persistedLayerTimes = {};
      Object.values(getSliderControlDefinitions()).forEach((definition) => {
        const persistence = getSliderControlPersistenceDefinition(definition?.controlId);
        if (!persistence || persistence.domain !== "layer-time") {
          return;
        }
        persistedLayerTimes[persistence.layerId] = {
          selectedTime: layerTemporalState?.[persistence.layerId]?.selectedTime ?? null,
          isTimeLocked: Boolean(layerTemporalState?.[persistence.layerId]?.isTimeLocked),
        };
      });

      const hasEmpireQualityControl = Object.values(getSliderControlDefinitions()).some((definition) => {
        const persistence = getSliderControlPersistenceDefinition(definition?.controlId);
        return persistence?.domain === "empire-quality-all";
      });

      storage?.setItem(
        storageKey,
        JSON.stringify({
          projection: projectionState.selectedProjection,
          zoom: zoomState.scale,
          rotationOffset: {
            lambda: rotationOffset.lambda,
            phi: rotationOffset.phi,
          },
          flatProjectionPanOffsets,
          layers: { ...layerState },
          layerTimes: persistedLayerTimes,
          empireQuality: hasEmpireQualityControl
            ? {
                ...empireQualityState,
              }
            : undefined,
          month: temporalState.selectedMonth,
        }),
      );
    } catch (error) {
      // Ignore persistence failures and keep runtime state.
    }
  }

  function loadViewState({
    storage,
    storageKey,
    normalizeProjectionSelection,
    clampZoomScale,
    clampPhi,
    flatProjectionPanOffsets,
    layerState,
    layerTemporalState,
    empireChildLayerIds,
    empireQualityState,
    temporalState,
    projectionState,
    zoomState,
    rotationOffset,
    hasAnyEmpireChildEnabled,
    empireQualityLevels,
  }) {
    try {
      const stored = storage?.getItem(storageKey);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);
      projectionState.selectedProjection = normalizeProjectionSelection(parsed?.projection);

      const zoom = Number(parsed?.zoom);
      if (Number.isFinite(zoom)) {
        zoomState.scale = clampZoomScale(zoom);
      }

      const lambda = Number(parsed?.rotationOffset?.lambda);
      const phi = Number(parsed?.rotationOffset?.phi);
      if (Number.isFinite(lambda)) {
        rotationOffset.lambda = lambda;
      }
      if (Number.isFinite(phi)) {
        rotationOffset.phi = clampPhi(phi);
      }

      if (parsed?.flatProjectionPanOffsets && typeof parsed.flatProjectionPanOffsets === "object") {
        Object.keys(flatProjectionPanOffsets).forEach((projectionKey) => {
          const offset = parsed.flatProjectionPanOffsets?.[projectionKey];
          const x = Number(offset?.x);
          const y = Number(offset?.y);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            flatProjectionPanOffsets[projectionKey] = { x, y };
          }
        });
      }

      const hasStoredLayerVisibility = parsed?.layers && typeof parsed.layers === "object";
      if (hasStoredLayerVisibility) {
        Object.keys(layerState).forEach((key) => {
          if (typeof parsed.layers[key] === "boolean") {
            layerState[key] = parsed.layers[key];
          }
        });
      }

      if (!hasStoredLayerVisibility && parsed?.empireSublayers && typeof parsed.empireSublayers === "object") {
        Object.keys(parsed.empireSublayers).forEach((key) => {
          if (typeof parsed.empireSublayers[key] === "boolean" && key in layerState) {
            layerState[key] = parsed.empireSublayers[key];
          }
        });
      }

      if (!hasStoredLayerVisibility || typeof parsed.layers?.empires !== "boolean") {
        layerState.empires = hasAnyEmpireChildEnabled(layerState, empireChildLayerIds);
      }

      if (parsed?.layerTimes && typeof parsed.layerTimes === "object") {
        Object.keys(layerTemporalState ?? {}).forEach((key) => {
          const persistedState = parsed.layerTimes?.[key];
          if (!persistedState || typeof persistedState !== "object") {
            return;
          }

          if (
            typeof persistedState.selectedTime === "string"
            || typeof persistedState.selectedTime === "number"
          ) {
            layerTemporalState[key].selectedTime = persistedState.selectedTime;
          }

          if (typeof persistedState.isTimeLocked === "boolean") {
            layerTemporalState[key].isTimeLocked = persistedState.isTimeLocked;
          }
        });
      }

      if (parsed?.empireQuality && typeof parsed.empireQuality === "object") {
        Object.keys(empireQualityState).forEach((key) => {
          if (empireQualityLevels.includes(parsed.empireQuality[key])) {
            empireQualityState[key] = parsed.empireQuality[key];
          }
        });
      }

      const month = String(parsed?.month ?? "");
      if (/^\d{2}$/.test(month)) {
        temporalState.selectedMonth = month;
      }
    } catch (error) {
      // Ignore invalid persisted data.
    }
  }

const AtlasStatePersistence = {
  loadStyleSettings,
  loadViewState,
  saveStyleSettings,
  saveViewState,
};

export {
  loadStyleSettings,
  loadViewState,
  saveStyleSettings,
  saveViewState,
};

export default AtlasStatePersistence;

window.AtlasStatePersistence = AtlasStatePersistence;
