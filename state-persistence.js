import {
  getColorControlDefinitions,
  getSliderControlDefinitions,
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
        const binding = definition?.styleBinding;
        if (!binding) {
          return;
        }
        const scopeTarget = resolveStyleScope(binding.scope, {
          borderStyleState,
          graticuleStyleState,
          earthStyleState,
          layerStyleState,
        });
        if (!scopeTarget) {
          return;
        }
        ensureScopeObject(payload, binding.scope)[binding.colorKey] = scopeTarget[binding.colorKey];
      });

      Object.values(getSliderControlDefinitions()).forEach((definition) => {
        const binding = definition?.binding;
        if (!binding || binding.kind === "empireQualityAll") {
          return;
        }
        const scopeTarget = resolveStyleScope(binding.scope, {
          borderStyleState,
          graticuleStyleState,
          earthStyleState,
          layerStyleState,
        });
        if (!scopeTarget) {
          return;
        }
        ensureScopeObject(payload, binding.scope)[binding.key] = scopeTarget[binding.key];
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
        const binding = definition?.styleBinding;
        if (!binding) {
          return;
        }
        const scopeObject = getScopeObject(parsed, binding.scope);
        const colorValue = normalizeHexColor(scopeObject?.[binding.colorKey]);
        if (colorValue) {
          applyPersistedColorControlValue(definition.controlId, colorValue);
        }
      });

      Object.values(getSliderControlDefinitions()).forEach((definition) => {
        const binding = definition?.binding;
        if (!binding || binding.kind === "empireQualityAll") {
          return;
        }
        const scopeTarget = resolveStyleScope(binding.scope, {
          borderStyleState,
          graticuleStyleState,
          earthStyleState,
          layerStyleState,
        });
        const scopeObject = getScopeObject(parsed, binding.scope);
        const rawValue = Number(scopeObject?.[binding.key]);
        if (!scopeTarget || !Number.isFinite(rawValue)) {
          return;
        }

        if (binding.kind === "percent") {
          scopeTarget[binding.key] = clamp(rawValue, 0, 1);
          return;
        }

        if (binding.kind === "float") {
          scopeTarget[binding.key] = clamp(rawValue, definition.min, definition.max);
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
    empireQualityState,
    temporalState,
  }) {
    try {
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
          empireQuality: {
            ...empireQualityState,
          },
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
