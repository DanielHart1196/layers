(() => {
  function saveCustomColors(controlId, hooks) {
    const { getConfig, storage, getCustomColorList } = hooks;
    const config = getConfig(controlId);
    try {
      storage?.setItem(config.storageKey, JSON.stringify(getCustomColorList(controlId)));
    } catch (error) {
      // Ignore persistence failures and keep the runtime state.
    }
  }

  function clearColorRemovePressTimer(controlId, hooks) {
    const runtime = hooks.getRuntime(controlId);
    if (runtime.removePressTimer !== null) {
      window.clearTimeout(runtime.removePressTimer);
      runtime.removePressTimer = null;
    }
  }

  function hideCustomColorRemoveButton(controlId, hooks) {
    const runtime = hooks.getRuntime(controlId);
    runtime.removeTarget?.classList.remove("is-remove-visible");
    runtime.removeTarget = null;
  }

  function getColorDatasetSelector(config) {
    return config.datasetKey.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  }

  function setColorControlFromField(controlId, clientX, clientY, hooks) {
    const config = hooks.getConfig(controlId);
    const style = hooks.getStyle(controlId);
    if (!config?.field || !style) {
      return;
    }
    const rect = config.field.getBoundingClientRect();
    style.saturation = hooks.clamp((clientX - rect.left) / rect.width, 0, 1);
    style.value = 1 - hooks.clamp((clientY - rect.top) / rect.height, 0, 1);
    style.color = hooks.hsvToHex(style.hue, style.saturation, style.value);
  }

  function setColorControlFromHueSlider(controlId, clientX, hooks) {
    const config = hooks.getConfig(controlId);
    const style = hooks.getStyle(controlId);
    if (!config?.hueSlider || !style) {
      return;
    }
    const rect = config.hueSlider.getBoundingClientRect();
    style.hue = hooks.clamp((clientX - rect.left) / rect.width, 0, 1) * 360;
    style.color = hooks.hsvToHex(style.hue, style.saturation, style.value);
  }

  function createCustomColorButton(controlId, color, hooks) {
    const config = hooks.getConfig(controlId);
    const runtime = hooks.getRuntime(controlId);
    const wrapper = document.createElement("div");
    wrapper.className = "layer-inline-color-custom";

    const button = document.createElement("button");
    button.className = "layer-inline-color-button layer-inline-color-choice";
    button.type = "button";
    button.dataset[config.datasetKey] = color;
    button.setAttribute("aria-label", `Custom color ${color}`);
    wrapper.appendChild(button);

    const dot = document.createElement("span");
    dot.className = "layer-inline-color-dot";
    dot.style.setProperty("--layer-active-color", color);
    dot.setAttribute("aria-hidden", "true");
    button.appendChild(dot);

    const removeButton = document.createElement("button");
    removeButton.className = "layer-inline-color-remove";
    removeButton.type = "button";
    removeButton.textContent = "−";
    removeButton.setAttribute("aria-label", `Remove custom color ${color}`);
    wrapper.appendChild(removeButton);

    button.addEventListener("click", () => {
      if (runtime.longPressTriggered) {
        runtime.longPressTriggered = false;
        return;
      }
      if (!hooks.setColorControlValue(controlId, color)) {
        return;
      }
      hooks.syncColorControlUi(controlId);
      hooks.drawForColorControl(controlId);
    });

    const startLongPress = () => {
      clearColorRemovePressTimer(controlId, hooks);
      runtime.longPressTriggered = false;
      runtime.removePressTimer = window.setTimeout(() => {
        if (runtime.removeTarget && runtime.removeTarget !== wrapper) {
          runtime.removeTarget.classList.remove("is-remove-visible");
        }
        runtime.removeTarget = wrapper;
        runtime.removeTarget.classList.add("is-remove-visible");
        runtime.longPressTriggered = true;
        runtime.removePressTimer = null;
      }, 300);
    };

    const cancelLongPress = () => {
      clearColorRemovePressTimer(controlId, hooks);
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

    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      hooks.setCustomColorList(controlId, hooks.getCustomColorList(controlId).filter((entry) => entry !== color));
      saveCustomColors(controlId, hooks);
      hideCustomColorRemoveButton(controlId, hooks);
      hooks.renderCustomColors(controlId);
      hooks.syncColorControlUi(controlId);
    });

    return wrapper;
  }

  function renderCustomColors(controlId, hooks) {
    const config = hooks.getConfig(controlId);
    if (!config?.customs) {
      return;
    }
    config.customs.replaceChildren(
      ...hooks.getCustomColorList(controlId).map((color) => hooks.createCustomColorButton(controlId, color)),
    );
  }

  function revealCustomColor(controlId, color, hooks) {
    const config = hooks.getConfig(controlId);
    const matchingButton = config?.customs?.querySelector(
      `.layer-inline-color-choice[data-${getColorDatasetSelector(config)}="${color}"]`,
    );
    if (!(matchingButton instanceof HTMLElement)) {
      return null;
    }
    matchingButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    return matchingButton;
  }

  function revealPresetColor(controlId, color, hooks) {
    const config = hooks.getConfig(controlId);
    const matchingButton = config?.presetButtons?.find(
      (button) => button.dataset[config.datasetKey]?.toUpperCase() === color.toUpperCase(),
    );
    if (!(matchingButton instanceof HTMLElement)) {
      return null;
    }
    matchingButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    return matchingButton;
  }

  function flashColorFeedback(controlId, button, hooks) {
    if (!button) {
      return;
    }
    const runtime = hooks.getRuntime(controlId);
    if (runtime.duplicateFlashTimer !== null) {
      window.clearTimeout(runtime.duplicateFlashTimer);
    }
    runtime.duplicateFlashButton?.classList.remove("is-duplicate-flash");
    runtime.duplicateFlashButton = button;
    runtime.duplicateFlashButton.classList.add("is-duplicate-flash");
    runtime.duplicateFlashTimer = window.setTimeout(() => {
      runtime.duplicateFlashButton?.classList.remove("is-duplicate-flash");
      runtime.duplicateFlashButton = null;
      runtime.duplicateFlashTimer = null;
    }, 820);
  }

  window.AtlasColorModel = {
    clearColorRemovePressTimer,
    createCustomColorButton,
    flashColorFeedback,
    getColorDatasetSelector,
    hideCustomColorRemoveButton,
    renderCustomColors,
    revealCustomColor,
    revealPresetColor,
    saveCustomColors,
    setColorControlFromField,
    setColorControlFromHueSlider,
  };
})();
