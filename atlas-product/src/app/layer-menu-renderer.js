function formatRowValue(row, value) {
  if (row?.valueFormat === "percent") {
    return `${Math.round(Number(value) || 0)}%`;
  }

  return String(value ?? "");
}

function createLayerRowButton(definition, state, onToggleExpanded) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "layer-menu-row layer-menu-row-layer";
  button.textContent = definition.label;

  const hasChildren = Array.isArray(definition.rows) && definition.rows.length > 0;
  if (hasChildren) {
    button.classList.add("is-expandable");
    button.setAttribute("aria-expanded", String(Boolean(state?.expanded)));
    button.addEventListener("click", () => {
      onToggleExpanded(definition.id);
    });
  }

  return button;
}

function createSliderRow(row, value, onInput) {
  const wrapper = document.createElement("label");
  wrapper.className = "layer-menu-row layer-menu-row-slider";

  const label = document.createElement("span");
  label.className = "layer-menu-row-label";
  label.textContent = row.label;

  const valueLabel = document.createElement("span");
  valueLabel.className = "layer-menu-row-value";
  valueLabel.textContent = formatRowValue(row, value);

  const input = document.createElement("input");
  input.className = "layer-menu-slider";
  input.type = "range";
  input.min = String(row.min);
  input.max = String(row.max);
  input.step = String(row.step);
  input.value = String(value);
  input.addEventListener("input", () => {
    const nextValue = Number(input.value);
    valueLabel.textContent = formatRowValue(row, nextValue);
    onInput(nextValue);
  });

  const header = document.createElement("div");
  header.className = "layer-menu-slider-header";
  header.append(label, valueLabel);

  wrapper.append(header, input);
  return wrapper;
}

function buildRows(rows, layerModel, onToggleExpanded, onSliderInput, depth = 0) {
  const fragment = document.createDocumentFragment();
  const state = layerModel.getState();

  rows.forEach((row) => {
    if (row.type === "slider") {
      const slider = createSliderRow(row, layerModel.getRowValue(row), (nextValue) => {
        onSliderInput(row, nextValue);
      });
      slider.style.setProperty("--row-depth", String(depth));
      fragment.append(slider);
      return;
    }

    const button = createLayerRowButton(row, state[row.id], onToggleExpanded);
    button.style.setProperty("--row-depth", String(depth));
    fragment.append(button);

    if (row.rows?.length && state[row.id]?.expanded) {
      fragment.append(buildRows(row.rows, layerModel, onToggleExpanded, onSliderInput, depth + 1));
    }
  });

  return fragment;
}

function renderLayerMenuRows({
  panel,
  layerModel,
  onSliderInput,
}) {
  if (!panel || !layerModel) {
    return () => {};
  }

  function render() {
    panel.innerHTML = "";
    panel.append(
      buildRows(
        layerModel.getRootRows(),
        layerModel,
        (layerId) => {
          layerModel.toggleExpanded(layerId);
          render();
        },
        onSliderInput,
      ),
    );
  }

  render();
  return render;
}

export { renderLayerMenuRows };
