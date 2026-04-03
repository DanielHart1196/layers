function setLayerMenuOpen(wrapper, panel, button, isOpen) {
  wrapper?.classList.toggle("is-open", isOpen);
  panel?.classList.toggle("is-open", isOpen);
  button?.setAttribute("aria-expanded", String(isOpen));
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
}

export { enableLayerMenuControls };
