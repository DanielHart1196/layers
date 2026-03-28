(() => {
  function createRenderLayerManager() {
    const layers = [];

    function registerLayer(layer) {
      layers.push(layer);
      return layer;
    }

    function configureAll(context) {
      layers.forEach((layer) => {
        layer.configure?.(context);
      });
    }

    function renderAll(context) {
      layers.forEach((layer) => {
        if (layer.isEnabled && !layer.isEnabled(context)) {
          return;
        }

        layer.render?.(context);
      });
    }

    function invalidateLayer(layerId) {
      layers.forEach((layer) => {
        if (layer.id === layerId) {
          layer.invalidate?.();
        }
      });
    }

    function invalidateAll() {
      layers.forEach((layer) => {
        layer.invalidate?.();
      });
    }

    return {
      configureAll,
      invalidateAll,
      invalidateLayer,
      registerLayer,
      renderAll,
    };
  }

  window.AtlasRenderLayers = {
    createRenderLayerManager,
  };
})();
