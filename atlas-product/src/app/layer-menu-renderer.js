function formatRowValue(row, value) {
  if (row?.valueFormat === "points") {
    return `${Number(value) || 0}pt`;
  }

  if (row?.valueFormat === "percent") {
    return `${Math.round(Number(value) || 0)}%`;
  }

  return String(value ?? "");
}

function normalizeHexColor(value) {
  const normalized = String(value ?? "").trim().replace(/^#*/, "");
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `#${normalized.toUpperCase()}`;
  }

  return null;
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHsv({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
  }

  return {
    h: (h * 60 + 360) % 360,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
}

function hsvToHex({ h, s, v }) {
  const c = v * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs(hp % 2 - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hp >= 0 && hp < 1) {
    r1 = c; g1 = x;
  } else if (hp < 2) {
    r1 = x; g1 = c;
  } else if (hp < 3) {
    g1 = c; b1 = x;
  } else if (hp < 4) {
    g1 = x; b1 = c;
  } else if (hp < 5) {
    r1 = x; b1 = c;
  } else {
    r1 = c; b1 = x;
  }

  const m = v - c;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  return normalizeHexColor(`#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`);
}

function getStoredColors(storageKey) {
  if (!storageKey) {
    return [];
  }

  try {
    const raw = window.localStorage?.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeHexColor).filter(Boolean);
  } catch (_error) {
    return [];
  }
}

function saveStoredColors(storageKey, colors) {
  if (!storageKey) {
    return;
  }

  window.localStorage?.setItem(storageKey, JSON.stringify(colors.slice(0, 10)));
}

function createColorPressRuntime() {
  return {
    removePressTimer: null,
    deleteTarget: null,
    deleteColor: null,
    longPressTriggered: false,
  };
}

function clearColorRemovePressTimer(runtime) {
  if (runtime.removePressTimer !== null) {
    window.clearTimeout(runtime.removePressTimer);
    runtime.removePressTimer = null;
  }
}

function hideCustomColorRemoveButton(runtime) {
  runtime.deleteTarget?.classList.remove("is-delete-armed");
  runtime.deleteTarget = null;
  runtime.deleteColor = null;
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

function createOpacitySlider(inputClassName, row, value, onInput) {
  const slider = document.createElement("input");
  slider.className = inputClassName;
  slider.type = "range";
  slider.min = String(row.min);
  slider.max = String(row.max);
  slider.step = String(row.step);
  slider.value = String(value);
  slider.addEventListener("input", () => {
    onInput(Number(slider.value));
  });
  return slider;
}

function createSliderBlock({ label, row, value, onInput, className = "" }) {
  const block = document.createElement("div");
  block.className = className ? className : "layer-menu-row-fill-opacity";

  const header = document.createElement("div");
  header.className = "layer-menu-slider-header";

  const sliderLabel = document.createElement("span");
  sliderLabel.className = "layer-menu-row-label";
  sliderLabel.textContent = label;

  const sliderValue = document.createElement("span");
  sliderValue.className = "layer-menu-row-value";
  sliderValue.textContent = formatRowValue(row, value);

  header.append(sliderLabel, sliderValue);

  const slider = createOpacitySlider("layer-menu-slider", row, value, (nextValue) => {
    sliderValue.textContent = formatRowValue(row, nextValue);
    onInput(nextValue);
  });

  block.append(header, slider);
  return block;
}

function createColorRow(row, value, onInput, requestRender) {
  const wrapper = document.createElement("div");
  wrapper.className = "layer-menu-row layer-menu-row-color";
  let currentHex = normalizeHexColor(value) ?? "#8C6A2A";
  let currentHsv = rgbToHsv(hexToRgb(currentHex));
  const pressRuntime = createColorPressRuntime();

  const header = document.createElement("div");
  header.className = "layer-menu-color-header";

  const label = document.createElement("span");
  label.className = "layer-menu-row-label";
  label.textContent = row.label;

  const valueLabel = document.createElement("span");
  valueLabel.className = "layer-menu-row-value";
  valueLabel.textContent = formatRowValue(row, currentHex);

  header.append(label, valueLabel);

  const swatches = document.createElement("div");
  swatches.className = "layer-menu-color-swatches";

  const storedColors = getStoredColors(row.storageKey);
  const presetColors = row.presets ?? [];
  let addButton = null;

  function syncAddButtonState() {
    if (!addButton) {
      return;
    }

    const isDeleteArmed = Boolean(pressRuntime.deleteColor);
    const isOpen = panel.classList.contains("is-open");
    addButton.classList.toggle("is-open", isOpen && !isDeleteArmed);
    addButton.classList.toggle("is-delete-armed", isDeleteArmed);
    addButton.textContent = isDeleteArmed ? "−" : "+";
    addButton.setAttribute("aria-label", isDeleteArmed ? "Delete saved color" : (isOpen ? "Close color picker" : "Open color picker"));
  }

  if (row.storageKey) {
    addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "layer-menu-color-swatch layer-menu-color-swatch-add";
    addButton.setAttribute("aria-label", "Open color picker");
    addButton.textContent = "+";
    swatches.append(addButton);
  }

  function createSwatchButton(color, { removable = false } = {}) {
    if (!removable) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "layer-menu-color-swatch";
      button.setAttribute("aria-label", `Choose ${color}`);
      button.style.setProperty("--swatch-color", color);
      if (String(color).toLowerCase() === String(currentHex).toLowerCase()) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", () => {
        currentHex = normalizeHexColor(color) ?? currentHex;
        currentHsv = rgbToHsv(hexToRgb(currentHex));
        onInput(color);
        requestRender();
      });
      return button;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "layer-menu-color-swatch";
    button.setAttribute("aria-label", `Choose ${color}`);
    button.style.setProperty("--swatch-color", color);
    if (String(color).toLowerCase() === String(currentHex).toLowerCase()) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      if (pressRuntime.longPressTriggered) {
        pressRuntime.longPressTriggered = false;
        return;
      }
      currentHex = normalizeHexColor(color) ?? currentHex;
      currentHsv = rgbToHsv(hexToRgb(currentHex));
      hideCustomColorRemoveButton(pressRuntime);
      syncAddButtonState();
      onInput(color);
      requestRender();
    });

    const startLongPress = () => {
      clearColorRemovePressTimer(pressRuntime);
      pressRuntime.longPressTriggered = false;
      pressRuntime.removePressTimer = window.setTimeout(() => {
        if (pressRuntime.deleteTarget && pressRuntime.deleteTarget !== button) {
          pressRuntime.deleteTarget.classList.remove("is-delete-armed");
        }
        pressRuntime.deleteTarget = button;
        pressRuntime.deleteTarget.classList.add("is-delete-armed");
        pressRuntime.deleteColor = color;
        pressRuntime.longPressTriggered = true;
        pressRuntime.removePressTimer = null;
        syncAddButtonState();
      }, 300);
    };

    const cancelLongPress = () => {
      clearColorRemovePressTimer(pressRuntime);
    };

    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      startLongPress();
    });
    button.addEventListener("pointerup", cancelLongPress);
    button.addEventListener("pointerleave", cancelLongPress);
    button.addEventListener("pointercancel", cancelLongPress);
    button.addEventListener("touchstart", startLongPress, { passive: true });
    button.addEventListener("touchend", cancelLongPress, { passive: true });
    button.addEventListener("touchcancel", cancelLongPress, { passive: true });
    button.addEventListener("contextmenu", (event) => event.preventDefault());
    return button;
  }

  storedColors.forEach((preset) => {
    swatches.append(createSwatchButton(preset, { removable: true }));
  });

  presetColors.forEach((preset) => {
    const button = document.createElement("button");
    swatches.append(createSwatchButton(preset));
  });

  const panel = document.createElement("div");
  panel.className = "layer-menu-color-panel";
  panel.hidden = true;

  const field = document.createElement("div");
  field.className = "layer-menu-color-field";
  const fieldHandle = document.createElement("span");
  fieldHandle.className = "layer-menu-color-field-handle";
  field.append(fieldHandle);

  const hue = document.createElement("div");
  hue.className = "layer-menu-color-hue";
  const hueHandle = document.createElement("span");
  hueHandle.className = "layer-menu-color-hue-handle";
  hue.append(hueHandle);

  const inputRow = document.createElement("div");
  inputRow.className = "layer-menu-color-input-row";
  const hexInput = document.createElement("input");
  hexInput.className = "layer-menu-color-hex";
  hexInput.type = "text";
  hexInput.value = currentHex;
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "layer-menu-color-save";
  saveButton.textContent = "Add";
  inputRow.append(hexInput, saveButton);

  panel.append(field, hue, inputRow);

  function syncPickerUi() {
    valueLabel.textContent = formatRowValue(row, currentHex);
    hexInput.value = currentHex;
    field.style.setProperty("--picker-hue", `hsl(${currentHsv.h} 100% 50%)`);
    fieldHandle.style.left = `${currentHsv.s * 100}%`;
    fieldHandle.style.top = `${(1 - currentHsv.v) * 100}%`;
    hueHandle.style.left = `${(currentHsv.h / 360) * 100}%`;
  }

  function commitColor(nextHex, { persist = false, preserveHsv = false } = {}) {
    const normalized = normalizeHexColor(nextHex);
    if (!normalized) {
      return;
    }

    currentHex = normalized;
    if (!preserveHsv) {
      currentHsv = rgbToHsv(hexToRgb(currentHex));
    }
    onInput(currentHex);

    if (persist && row.storageKey) {
      const nextStoredColors = [currentHex, ...storedColors.filter((color) => color !== currentHex)];
      saveStoredColors(row.storageKey, nextStoredColors);
      syncPickerUi();
      requestRender();
      return;
    }

    syncPickerUi();
  }

  function bind2dPointer(target, onMove) {
    function updateFromEvent(event) {
      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
      onMove({ x, y, width: rect.width, height: rect.height });
    }

    target.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      target.setPointerCapture?.(event.pointerId);
      updateFromEvent(event);
    });
    target.addEventListener("pointermove", (event) => {
      if ((event.buttons & 1) !== 1 && event.pointerType !== "touch") {
        return;
      }
      updateFromEvent(event);
    });
  }

  bind2dPointer(field, ({ x, y, width, height }) => {
    currentHsv = {
      ...currentHsv,
      s: width === 0 ? currentHsv.s : x / width,
      v: height === 0 ? currentHsv.v : 1 - (y / height),
    };
    commitColor(hsvToHex(currentHsv), { preserveHsv: true });
  });

  bind2dPointer(hue, ({ x, width }) => {
    const nextHueRatio = width === 0 ? (currentHsv.h / 360) : (x / width);
    currentHsv = {
      ...currentHsv,
      h: Math.min(nextHueRatio * 360, 359.999),
    };
    commitColor(hsvToHex(currentHsv), { preserveHsv: true });
  });

  hexInput.addEventListener("change", () => {
    commitColor(hexInput.value);
  });

  saveButton.addEventListener("click", () => {
    commitColor(hexInput.value, { persist: true });
  });

  addButton?.addEventListener("click", () => {
    if (pressRuntime.deleteColor) {
      const nextStoredColors = storedColors.filter((entry) => entry !== pressRuntime.deleteColor);
      saveStoredColors(row.storageKey, nextStoredColors);
      hideCustomColorRemoveButton(pressRuntime);
      syncAddButtonState();
      requestRender();
      return;
    }

    const nextOpen = !panel.classList.contains("is-open");
    panel.classList.toggle("is-open", nextOpen);
    panel.hidden = !nextOpen;
    hideCustomColorRemoveButton(pressRuntime);
    syncAddButtonState();
  });

  wrapper.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (!swatches.contains(target) && !panel.contains(target)) {
      hideCustomColorRemoveButton(pressRuntime);
      clearColorRemovePressTimer(pressRuntime);
      pressRuntime.longPressTriggered = false;
      syncAddButtonState();
    }
  });

  syncPickerUi();
  syncAddButtonState();
  wrapper.append(header, swatches, panel);
  return wrapper;
}

function createFillRow(row, value, onInput, requestRender) {
  const wrapper = document.createElement("div");
  wrapper.className = "layer-menu-row layer-menu-row-fill";

  const colorValue = value?.color ?? "#8C6A2A";
  const opacityValue = Number(value?.opacity ?? 100);

  const colorRow = createColorRow({
    id: `${row.id}-color`,
    label: row.label,
    type: "color",
    storageKey: row.storageKey,
    presets: row.presets,
  }, colorValue, (nextColor) => {
    onInput(
      { target: row.colorTarget },
      nextColor,
    );
  }, requestRender);
  colorRow.classList.add("layer-menu-row-fill-color");

  const sliderBlock = createSliderBlock({
    label: "Opacity",
    row,
    value: opacityValue,
    onInput: (nextOpacity) => {
      onInput(
        { target: row.opacityTarget },
        nextOpacity,
      );
    },
  });

  wrapper.append(colorRow, sliderBlock);
  return wrapper;
}

function createLineRow(row, value, onInput, requestRender) {
  const wrapper = document.createElement("div");
  wrapper.className = "layer-menu-row layer-menu-row-line";

  const weightValue = Number(value?.weight ?? 100);
  const colorValue = value?.color ?? "#C89A42";
  const opacityValue = Number(value?.opacity ?? 100);

  const weightRow = createSliderBlock({
    label: "Line",
    row: {
      ...row,
      min: row.weightMin,
      max: row.weightMax,
      step: row.weightStep,
    },
    value: weightValue,
    onInput: (nextWeight) => {
      onInput(
        { target: row.weightTarget },
        nextWeight,
      );
    },
  });

  const colorRow = createColorRow({
    id: `${row.id}-color`,
    label: "Color",
    type: "color",
    storageKey: row.storageKey,
    presets: row.presets,
  }, colorValue, (nextColor) => {
    onInput(
      { target: row.colorTarget },
      nextColor,
    );
  }, requestRender);
  colorRow.classList.add("layer-menu-row-line-color");

  const opacityRow = createSliderBlock({
    label: "Opacity",
    row: {
      ...row,
      valueFormat: "percent",
    },
    value: opacityValue,
    onInput: (nextOpacity) => {
      onInput(
        { target: row.opacityTarget },
        nextOpacity,
      );
    },
  });

  wrapper.append(weightRow, colorRow, opacityRow);
  return wrapper;
}

function buildRows(rows, layerModel, onToggleExpanded, onRowInput, depth = 0) {
  const fragment = document.createDocumentFragment();
  const state = layerModel.getState();

  rows.forEach((row) => {
    if (row.type === "slider") {
      const slider = createSliderRow(row, layerModel.getRowValue(row), (nextValue) => {
        onRowInput(row, nextValue);
      });
      slider.style.setProperty("--row-depth", String(depth));
      fragment.append(slider);
      return;
    }

    if (row.type === "color") {
      const colorRow = createColorRow(row, layerModel.getRowValue(row), (nextValue) => {
        onRowInput(row, nextValue);
      }, onToggleExpanded.__requestRender);
      colorRow.style.setProperty("--row-depth", String(depth));
      fragment.append(colorRow);
      return;
    }

    if (row.type === "fill") {
      const fillRow = createFillRow(row, layerModel.getRowValue(row), (syntheticRow, nextValue) => {
        onRowInput(syntheticRow, nextValue);
      }, onToggleExpanded.__requestRender);
      fillRow.style.setProperty("--row-depth", String(depth));
      fragment.append(fillRow);
      return;
    }

    if (row.type === "line") {
      const lineRow = createLineRow(row, layerModel.getRowValue(row), (syntheticRow, nextValue) => {
        onRowInput(syntheticRow, nextValue);
      }, onToggleExpanded.__requestRender);
      lineRow.style.setProperty("--row-depth", String(depth));
      fragment.append(lineRow);
      return;
    }

    const button = createLayerRowButton(row, state[row.id], onToggleExpanded);
    button.style.setProperty("--row-depth", String(depth));
    fragment.append(button);

    if (row.rows?.length && state[row.id]?.expanded) {
      fragment.append(buildRows(row.rows, layerModel, onToggleExpanded, onRowInput, depth + 1));
    }
  });

  return fragment;
}

function renderLayerMenuRows({
  panel,
  layerModel,
  onRowInput,
}) {
  if (!panel || !layerModel) {
    return () => {};
  }

  function render() {
    panel.innerHTML = "";
    const onToggleExpanded = (layerId) => {
      layerModel.toggleExpanded(layerId);
      render();
    };
    onToggleExpanded.__requestRender = render;
    panel.append(
      buildRows(
        layerModel.getRootRows(),
        layerModel,
        onToggleExpanded,
        onRowInput,
      ),
    );
  }

  render();
  return render;
}

export { renderLayerMenuRows };
