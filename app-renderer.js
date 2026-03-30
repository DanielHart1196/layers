function createRenderer({
  renderInvalidation,
  requestAnimationFrameFn = window.requestAnimationFrame.bind(window),
}) {
  let renderScheduled = false;

  function draw({ passes = ["all"], render }) {
    renderInvalidation.invalidate(passes);
    if (!renderInvalidation.hasDirtyPasses()) {
      return;
    }

    const dirtyPasses = renderInvalidation.consume();
    render(dirtyPasses);
  }

  function request({ passes = ["all"], render }) {
    renderInvalidation.invalidate(passes);
    if (renderScheduled) {
      return;
    }

    renderScheduled = true;
    requestAnimationFrameFn(() => {
      renderScheduled = false;
      draw({ passes: [], render });
    });
  }

  return {
    draw,
    request,
  };
}

const AtlasRenderer = {
  createRenderer,
};

export { createRenderer };

export default AtlasRenderer;

window.AtlasRenderer = AtlasRenderer;
