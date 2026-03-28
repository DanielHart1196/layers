(() => {
  function createPreparedVectorCache() {
    const cache = new Map();

    function get(cacheKey) {
      return cache.get(cacheKey) ?? null;
    }

    function set(cacheKey, preparedValue) {
      cache.set(cacheKey, preparedValue);
      return preparedValue;
    }

    function getOrCreate(cacheKey, factory) {
      const existing = get(cacheKey);
      if (existing) {
        return existing;
      }

      return set(cacheKey, factory());
    }

    function clear() {
      cache.clear();
    }

    return {
      clear,
      get,
      getOrCreate,
      set,
    };
  }

  window.AtlasPreparedVectors = {
    createPreparedVectorCache,
  };
})();
