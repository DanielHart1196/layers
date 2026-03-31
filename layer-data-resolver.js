function getFirstDefinedValue(values) {
  return values.find((value) => value != null) ?? null;
}

function resolveKeyedState(states, preferredKey = null, fallbackKey = null) {
  if (!states || typeof states !== "object") {
    return null;
  }

  if (preferredKey != null && states[preferredKey] != null) {
    return states[preferredKey];
  }

  if (fallbackKey != null && states[fallbackKey] != null) {
    return states[fallbackKey];
  }

  return getFirstDefinedValue(Object.values(states));
}

function normalizeTimeKey(value) {
  if (value == null) {
    return null;
  }

  return String(value);
}

function resolveLayerSourceData(source, selectors = {}) {
  if (source == null) {
    return selectors.fallbackValue ?? null;
  }

  if (source.kind === "states") {
    const nextSource = resolveKeyedState(
      source.states,
      selectors.stateKey,
      source.defaultState ?? null,
    );
    return resolveLayerSourceData(nextSource, selectors);
  }

  if (source.kind === "statesByTime") {
    const statesByTime = source.statesByTime ?? null;
    const preferredTimeKey = normalizeTimeKey(selectors.timeKey);
    const defaultTimeKey = normalizeTimeKey(source.defaultTime);
    const nextSource = resolveKeyedState(statesByTime, preferredTimeKey, defaultTimeKey);
    return resolveLayerSourceData(nextSource, selectors);
  }

  return source;
}

function resolveActiveLayerSourceData({
  layerSources,
  layerId,
  layerTemporalState = null,
  stateKey = null,
  fallbackValue = null,
} = {}) {
  const timeKey = layerTemporalState?.[layerId]?.selectedTime ?? null;
  return resolveLayerSourceData(layerSources?.[layerId], {
    stateKey,
    timeKey,
    fallbackValue,
  });
}

function createStateLayerSource(states, defaultState = null) {
  return {
    kind: "states",
    states,
    defaultState,
  };
}

function createTemporalLayerSource(artifact) {
  const availableTimes = Array.isArray(artifact?.availableTimes)
    ? artifact.availableTimes.slice()
    : [];

  return {
    kind: "statesByTime",
    timeField: artifact?.timeField ?? null,
    availableTimes,
    defaultTime: availableTimes.length ? availableTimes[availableTimes.length - 1] : null,
    filterFields: Array.isArray(artifact?.filterFields) ? artifact.filterFields.slice() : [],
    coverageByTime: artifact?.coverageByTime ?? {},
    metadata: {
      layerId: artifact?.layerId ?? null,
      label: artifact?.label ?? null,
      geometryType: artifact?.geometryType ?? null,
      source: artifact?.source ?? null,
    },
    statesByTime: artifact?.featuresByTime ?? {},
  };
}

const AtlasLayerDataResolver = {
  createStateLayerSource,
  createTemporalLayerSource,
  resolveActiveLayerSourceData,
  resolveLayerSourceData,
};

export {
  createStateLayerSource,
  createTemporalLayerSource,
  resolveActiveLayerSourceData,
  resolveLayerSourceData,
};

export default AtlasLayerDataResolver;

window.AtlasLayerDataResolver = AtlasLayerDataResolver;
