function setLayerMenuOpen(wrapper, panel, button, isOpen) {
  wrapper?.classList.toggle("is-open", isOpen);
  panel?.classList.toggle("is-open", isOpen);
  button?.setAttribute("aria-expanded", String(isOpen));
}

function syncLayerMenuMaxHeight(wrapper, panel, button) {
  if (!wrapper || !panel || !button) {
    return;
  }

  const buttonRect = button.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();
  const panelTop = wrapperRect.top + buttonRect.height + 10;
  const availableHeight = Math.max(120, window.innerHeight - panelTop - 12);
  panel.style.maxHeight = `${availableHeight}px`;
}

function enableLayerMenuControls({
  wrapper,
  button,
  panel,
}) {
  if (!wrapper || !button || !panel) {
    return;
  }

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  wrapper.addEventListener("pointerdown", stopPropagation);
  wrapper.addEventListener("click", stopPropagation);
  panel.addEventListener("pointerdown", stopPropagation);
  panel.addEventListener("click", stopPropagation);

  button.addEventListener("click", () => {
    syncLayerMenuMaxHeight(wrapper, panel, button);
    setLayerMenuOpen(wrapper, panel, button, !panel.classList.contains("is-open"));
  });

  document.addEventListener("click", (event) => {
    if (!panel.classList.contains("is-open")) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (wrapper.contains(target)) {
      return;
    }

    setLayerMenuOpen(wrapper, panel, button, false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      setLayerMenuOpen(wrapper, panel, button, false);
    }
  });

  window.addEventListener("resize", () => {
    if (!panel.classList.contains("is-open")) {
      return;
    }

    syncLayerMenuMaxHeight(wrapper, panel, button);
  });
}

export { enableLayerMenuControls };
