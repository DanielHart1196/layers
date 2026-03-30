const RENDER_PASSES = ["chrome", "earth", "empire", "overlay", "poster"];

function createRenderInvalidationManager() {
  const dirtyPasses = new Set(RENDER_PASSES);

  function invalidate(passes = ["all"]) {
    const nextPasses = Array.isArray(passes) ? passes : [passes];
    if (nextPasses.includes("all")) {
      RENDER_PASSES.forEach((pass) => dirtyPasses.add(pass));
      return;
    }

    nextPasses.forEach((pass) => {
      if (RENDER_PASSES.includes(pass)) {
        dirtyPasses.add(pass);
      }
    });
  }

  function consume() {
    const consumed = new Set(dirtyPasses);
    dirtyPasses.clear();
    return consumed;
  }

  function hasDirtyPasses() {
    return dirtyPasses.size > 0;
  }

  return {
    consume,
    hasDirtyPasses,
    invalidate,
  };
}

const AtlasRenderState = {
  createRenderInvalidationManager,
  RENDER_PASSES,
};

export {
  createRenderInvalidationManager,
  RENDER_PASSES,
};

export default AtlasRenderState;

window.AtlasRenderState = AtlasRenderState;
