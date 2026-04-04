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

function getRenderedLayerRow(parentId, rowId) {
  return document.querySelector(`.layer-menu-row-layer[data-parent-id="${parentId}"][data-row-id="${rowId}"]`);
}

function getAdjacentPreviewOrder(rowIds, rowId, direction) {
  if (!Array.isArray(rowIds) || !rowIds.length || !rowId) {
    return null;
  }

  const sourceIndex = rowIds.indexOf(rowId);
  if (sourceIndex === -1) {
    return null;
  }

  const targetIndex = direction === "up" ? sourceIndex - 1 : sourceIndex + 1;
  if (targetIndex < 0 || targetIndex >= rowIds.length) {
    return null;
  }

  const nextOrder = rowIds.slice();
  const [moved] = nextOrder.splice(sourceIndex, 1);
  nextOrder.splice(targetIndex, 0, moved);
  return nextOrder;
}

function setupPointerReorderGrabber(grabber, parentId, rowId, reorderApi) {
  let activeGesture = null;
  let suppressClick = false;

  function cleanupGesture(commit = false) {
    const gesture = activeGesture;
    if (!gesture) {
      return;
    }

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);
    window.removeEventListener("pointerleave", handlePointerCancel);
    document.body.classList.remove("is-reordering-rows");

    if (gesture.dragging) {
      if (commit && Array.isArray(gesture.previewOrder)) {
        reorderApi.onCommit(parentId, gesture.previewOrder);
      } else {
        reorderApi.onCancel(parentId);
      }
      reorderApi.setDragging(null);
    }

    if (typeof grabber.releasePointerCapture === "function") {
      try {
        if (grabber.hasPointerCapture?.(gesture.pointerId)) {
          grabber.releasePointerCapture(gesture.pointerId);
        }
      } catch {
        // Ignore release errors from browsers that lose capture during teardown.
      }
    }

    if (gesture.dragging) {
      suppressClick = true;
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    }

    activeGesture = null;
  }

  function handlePointerMove(event) {
    const gesture = activeGesture;
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;

    if (!gesture.dragging) {
      if (Math.hypot(deltaX, deltaY) < 6) {
        return;
      }

      gesture.dragging = true;
      document.body.classList.add("is-reordering-rows");
      reorderApi.setDragging({ parentId, rowId });
    }

    event.preventDefault();

    const renderedRow = getRenderedLayerRow(parentId, rowId);
    if (!renderedRow) {
      return;
    }

    const rect = renderedRow.getBoundingClientRect();
    let direction = null;
    if (event.clientY < rect.top) {
      direction = "up";
    } else if (event.clientY > rect.bottom) {
      direction = "down";
    }

    if (!direction) {
      return;
    }

    const nextPreviewOrder = getAdjacentPreviewOrder(
      reorderApi.getOrderedRowIds(parentId),
      rowId,
      direction,
    );

    if (!nextPreviewOrder) {
      return;
    }

    if (
      Array.isArray(gesture.previewOrder)
      && gesture.previewOrder.length === nextPreviewOrder.length
      && gesture.previewOrder.every((value, index) => value === nextPreviewOrder[index])
    ) {
      return;
    }

    gesture.previewOrder = nextPreviewOrder;
    reorderApi.onPreview(parentId, nextPreviewOrder);
  }

  function handlePointerUp(event) {
    if (!activeGesture || event.pointerId !== activeGesture.pointerId) {
      return;
    }

    event.preventDefault();
    cleanupGesture(true);
  }

  function handlePointerCancel(event) {
    if (!activeGesture || event.pointerId !== activeGesture.pointerId) {
      return;
    }

    cleanupGesture(false);
  }

  grabber.addEventListener("click", (event) => {
    event.stopPropagation();
    if (suppressClick) {
      event.preventDefault();
    }
  });

  grabber.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType !== "touch") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    activeGesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      previewOrder: null,
    };

    if (typeof grabber.setPointerCapture === "function") {
      try {
        grabber.setPointerCapture(event.pointerId);
      } catch {
        // Ignore capture failures and fall back to window listeners.
      }
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp, { passive: false });
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("pointerleave", handlePointerCancel);
  });
}

function createRowHeader(labelText, valueText = null, className, options = {}) {
  const header = document.createElement("div");
  header.className = className;

  const leading = document.createElement("div");
  leading.className = "layer-menu-row-leading";
  header.append(leading);

  if (options.grabber) {
    const grabber = document.createElement("button");
    grabber.type = "button";
    grabber.className = "layer-menu-row-grabber";
    grabber.setAttribute("aria-label", "Reorder row");
    grabber.innerHTML = "<span></span><span></span>";
    leading.append(grabber);
  }

  const label = options.labelButton ? document.createElement("button") : document.createElement("span");
  label.className = options.labelButton ? "layer-menu-row-toggle" : "layer-menu-row-label";
  if (options.labelButton) {
    label.type = "button";
    const labelTextNode = document.createElement("span");
    labelTextNode.className = "layer-menu-row-label";
    labelTextNode.textContent = labelText;
    label.append(labelTextNode);
  } else {
    label.textContent = labelText;
  }
  leading.append(label);

  if (options.chevron) {
    const chevron = options.chevronButton ? document.createElement("button") : document.createElement("span");
    chevron.className = options.chevronButton ? "layer-menu-row-chevron-button" : "layer-menu-row-chevron";
    chevron.setAttribute("aria-hidden", "true");
    if (options.chevronButton) {
      chevron.type = "button";
    }
    chevron.textContent = "›";
    if (options.chevronExpanded) {
      chevron.classList.add("is-expanded");
    }
    header.append(chevron);
  }

  if (valueText !== null) {
    const valueLabel = document.createElement("span");
    valueLabel.className = "layer-menu-row-value";
    valueLabel.textContent = valueText;
    header.append(valueLabel);
  }

  return {
    header,
    label,
    chevron: header.querySelector(".layer-menu-row-chevron, .layer-menu-row-chevron-button"),
    grabber: header.querySelector(".layer-menu-row-grabber"),
  };
}

function createLayerRow(definition, state, parentId, onToggleExpanded, onToggleVisibility, reorderApi, dragState) {
  const row = document.createElement("div");
  row.className = "layer-menu-row layer-menu-row-layer";
  const hasChildren = Array.isArray(definition.rows) && definition.rows.length > 0;
  const hasVisibility = Boolean(definition.layerId);
  const isReorderable = Boolean(parentId && definition.layerId && definition.layerId !== "ocean");
  const { header, label, chevron, grabber } = createRowHeader(definition.label, null, "layer-menu-row-header", {
    grabber: isReorderable,
    labelButton: hasVisibility || !hasChildren,
    chevron: hasChildren,
    chevronButton: hasChildren,
    chevronExpanded: Boolean(state?.expanded),
  });
  row.append(header);
  if (isReorderable) {
    row.dataset.rowId = definition.id;
    row.dataset.parentId = parentId;
    if (dragState?.parentId === parentId && dragState?.rowId === definition.id) {
      row.classList.add("is-dragging");
    }
  }

  if (hasChildren) {
    row.classList.add("is-expandable");
    row.setAttribute("aria-expanded", String(Boolean(state?.expanded)));
  }

  if (hasVisibility) {
    row.classList.toggle("is-hidden", state?.visible === false);
    label.addEventListener("click", (event) => {
      event.stopPropagation();
      onToggleVisibility(definition.layerId);
    });
  } else if (!hasChildren) {
    label.addEventListener("click", (event) => {
      event.stopPropagation();
      onToggleExpanded(definition.id);
    });
  }

  chevron?.addEventListener("click", (event) => {
    event.stopPropagation();
    onToggleExpanded(definition.id);
  });

  if (grabber && isReorderable) {
    setupPointerReorderGrabber(grabber, parentId, definition.id, reorderApi);
  }

  if (hasChildren) {
    header.addEventListener("click", (event) => {
      if (
        event.target?.closest?.(".layer-menu-row-grabber")
        || event.target?.closest?.(".layer-menu-row-toggle")
        || event.target?.closest?.(".layer-menu-row-chevron-button")
      ) {
        return;
      }
      onToggleExpanded(definition.id);
    });
  }

  return row;
}

function createSliderRow(row, value, onInput) {
  const wrapper = document.createElement("label");
  wrapper.className = "layer-menu-row layer-menu-row-slider";
  const { header, valueLabel } = (() => {
    const { header, label } = createRowHeader(row.label, formatRowValue(row, value), "layer-menu-slider-header");
    const valueLabel = header.querySelector(".layer-menu-row-value");
    return { header, label, valueLabel };
  })();

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
  const { header } = createRowHeader(label, formatRowValue(row, value), "layer-menu-slider-header");
  const sliderValue = header.querySelector(".layer-menu-row-value");

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
  const persistedUiState = requestRender?.__getColorRowUiState?.(row.id) ?? null;
  const { header } = createRowHeader(row.label, formatRowValue(row, currentHex), "layer-menu-color-header");
  const valueLabel = header.querySelector(".layer-menu-row-value");

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

  function buildUiState() {
    return {
      rowId: row.id,
      swatchScrollLeft: swatches.scrollLeft,
      panelOpen: panel.classList.contains("is-open"),
    };
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
        requestRender(buildUiState());
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
      requestRender(buildUiState());
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
      requestRender(buildUiState());
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
      requestRender(buildUiState());
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
  if (persistedUiState?.panelOpen) {
    panel.classList.add("is-open");
    panel.hidden = false;
  }
  syncAddButtonState();
  wrapper.append(header, swatches, panel);
  if (persistedUiState && typeof persistedUiState.swatchScrollLeft === "number") {
    requestAnimationFrame(() => {
      swatches.scrollLeft = persistedUiState.swatchScrollLeft;
    });
  }
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

function buildRows(rows, layerModel, onToggleExpanded, onToggleVisibility, reorderApi, onRowInput, depth = 0, parentId = null) {
  const fragment = document.createDocumentFragment();
  const state = layerModel.getState();

  rows.forEach((row) => {
    const childRows = row.id ? reorderApi.getOrderedRows(row.id) : [];

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

    const layerRow = createLayerRow(row, state[row.id], parentId, onToggleExpanded, onToggleVisibility, reorderApi, reorderApi.dragState);
    layerRow.style.setProperty("--row-depth", String(depth));
    fragment.append(layerRow);

    if (childRows.length && state[row.id]?.expanded) {
      fragment.append(buildRows(childRows, layerModel, onToggleExpanded, onToggleVisibility, reorderApi, onRowInput, depth + 1, row.id));
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

  const transientColorRowState = new Map();
  const transientReorderState = new Map();
  let activeDragState = null;

  function render(nextUiState = null) {
    if (nextUiState?.rowId) {
      transientColorRowState.set(nextUiState.rowId, nextUiState);
    }
    panel.innerHTML = "";
    const onToggleExpanded = (layerId) => {
      layerModel.toggleExpanded(layerId);
      render();
    };
    const onToggleVisibility = (layerId) => {
      const nextVisible = layerModel.toggleVisibility(layerId);
      if (typeof nextVisible === "boolean") {
        onRowInput({ target: { kind: "layer-style", layerId, key: "visible" } }, nextVisible);
      }
      render();
    };
    const getOrderedRows = (parentId) => {
      const previewOrder = transientReorderState.get(parentId);
      const baseRows = layerModel.getChildRows(parentId);
      if (!previewOrder?.length) {
        return baseRows;
      }
      const rowById = new Map(baseRows.map((row) => [row.id, row]));
      return previewOrder.map((rowId) => rowById.get(rowId)).filter(Boolean);
    };
    const reorderApi = {
      dragState: activeDragState,
      getOrderedRows,
      getOrderedRowIds: (parentId) => getOrderedRows(parentId).map((row) => row.id),
      setDragging(nextDragState) {
        activeDragState = nextDragState;
        render();
      },
      onPreview(parentId, previewOrder) {
        transientReorderState.set(parentId, previewOrder);
        render();
      },
      onCancel(parentId) {
        if (transientReorderState.delete(parentId)) {
          render();
        }
      },
      onCommit(parentId, nextOrder) {
        transientReorderState.delete(parentId);
        const committedOrder = layerModel.setChildRowOrder(parentId, nextOrder);
        if (committedOrder) {
          onRowInput({ type: "reorder", parentId }, committedOrder);
        }
        render();
      },
    };

    onToggleExpanded.__requestRender = render;
    onToggleExpanded.__requestRender.__getColorRowUiState = (rowId) => transientColorRowState.get(rowId) ?? null;
    panel.append(
      buildRows(
        layerModel.getRootRows(),
        layerModel,
        onToggleExpanded,
        onToggleVisibility,
        reorderApi,
        onRowInput,
        0,
        null,
      ),
    );
  }

  render();
  return render;
}

export { renderLayerMenuRows };
