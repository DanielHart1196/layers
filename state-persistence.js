(() => {
  function saveStyleSettings({
    storage,
    storageKey,
    borderStyleState,
    graticuleStyleState,
    earthStyleState,
    empireStyleState,
  }) {
    try {
      storage?.setItem(
        storageKey,
        JSON.stringify({
          border: {
            color: borderStyleState.color,
            opacity: borderStyleState.opacity,
            width: borderStyleState.width,
          },
          graticule: {
            color: graticuleStyleState.color,
            opacity: graticuleStyleState.opacity,
            width: graticuleStyleState.width,
          },
          earth: {
            land: {
              color: earthStyleState.land.color,
            },
            water: {
              color: earthStyleState.water.color,
            },
          },
          empires: {
            romanComparison: {
              fillColor: empireStyleState.romanComparison.fillColor,
            },
          },
        }),
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
    setColorControlValue,
    borderStyleState,
    graticuleStyleState,
  }) {
    try {
      const stored = storage?.getItem(storageKey);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      const borderColor = normalizeHexColor(parsed?.border?.color);
      if (borderColor) {
        setColorControlValue("border", borderColor);
      }

      const borderOpacity = Number(parsed?.border?.opacity);
      if (Number.isFinite(borderOpacity)) {
        borderStyleState.opacity = clamp(borderOpacity, 0, 1);
      }

      const borderWidth = Number(parsed?.border?.width);
      if (Number.isFinite(borderWidth)) {
        borderStyleState.width = clamp(borderWidth, 0.4, 3);
      }

      const graticuleColor = normalizeHexColor(parsed?.graticule?.color);
      if (graticuleColor) {
        setColorControlValue("graticule", graticuleColor);
      }

      const graticuleWidth = Number(parsed?.graticule?.width);
      if (Number.isFinite(graticuleWidth)) {
        graticuleStyleState.width = clamp(graticuleWidth, 0.4, 3);
      }

      const graticuleOpacity = Number(parsed?.graticule?.opacity);
      if (Number.isFinite(graticuleOpacity)) {
        graticuleStyleState.opacity = clamp(graticuleOpacity, 0, 1);
      }

      const landColor = normalizeHexColor(parsed?.earth?.land?.color);
      if (landColor) {
        setColorControlValue("land", landColor);
      }

      const waterColor = normalizeHexColor(parsed?.earth?.water?.color);
      if (waterColor) {
        setColorControlValue("water", waterColor);
      }

      const romanEmpireFillColor = normalizeHexColor(parsed?.empires?.romanComparison?.fillColor);
      if (romanEmpireFillColor) {
        setColorControlValue("romanEmpireFill", romanEmpireFillColor);
      }
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
    empireLayerState,
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
          layers: {
            earth: layerState.earth,
            empires: layerState.empires,
            borders: layerState.borders,
            graticule: layerState.graticule,
            tissot: layerState.tissot,
          },
          empireSublayers: {
            ...empireLayerState,
          },
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
    empireLayerState,
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

      if (parsed?.empireSublayers && typeof parsed.empireSublayers === "object") {
        Object.keys(empireLayerState).forEach((key) => {
          if (typeof parsed.empireSublayers[key] === "boolean") {
            empireLayerState[key] = parsed.empireSublayers[key];
          }
        });
        if (!hasStoredLayerVisibility || typeof parsed.layers.empires !== "boolean") {
          layerState.empires = hasAnyEmpireChildEnabled(empireLayerState);
        }
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

  window.AtlasStatePersistence = {
    loadStyleSettings,
    loadViewState,
    saveStyleSettings,
    saveViewState,
  };
})();
