(() => {
  const { getExpandableLayerDefinitions, getLayerRows } = window.AtlasLayersRegistry;

  function getRowKey(row) {
    if (row.controlId) {
      return row.controlId;
    }

    if (row.layerId) {
      return row.layerId;
    }

    return row.type;
  }

  function createSpacer(position) {
    const spacerElement = document.createElement("div");
    spacerElement.className = "layer-body-spacer";
    spacerElement.dataset.layerSpacer = position;
    spacerElement.setAttribute("aria-hidden", "true");
    return spacerElement;
  }

  function applySliderRowDefinition(rowElement, row) {
    if (row.type !== "slider") {
      return;
    }

    const labelElement = rowElement.querySelector(".layer-control-copy strong");
    if (labelElement && row.label) {
      labelElement.textContent = row.label;
    }

    const valueElement = row.valueElementId
      ? rowElement.querySelector(`#${row.valueElementId}`)
      : rowElement.querySelector(".layer-control-copy small");
    if (valueElement && row.valueElementId) {
      valueElement.id = row.valueElementId;
    }

    const inputElement = rowElement.querySelector("input");
    if (!(inputElement instanceof HTMLInputElement)) {
      return;
    }

    if (row.inputId) {
      inputElement.id = row.inputId;
      rowElement.setAttribute("for", row.inputId);
    }
    if (typeof row.min !== "undefined") {
      inputElement.min = String(row.min);
    }
    if (typeof row.max !== "undefined") {
      inputElement.max = String(row.max);
    }
    if (typeof row.step !== "undefined") {
      inputElement.step = String(row.step);
    }
  }

  function composeLayerBodies({ getBodyElement, getRowElement }) {
    getExpandableLayerDefinitions().forEach((definition) => {
      const bodyElement = getBodyElement(definition.id, definition.bodySectionId);
      if (!bodyElement) {
        return;
      }

      bodyElement.classList.add("layer-body");
      bodyElement.dataset.layerBodyFor = definition.id;

      const rows = getLayerRows(definition.id);
      const orderedChildren = [];
      rows.forEach((row, index) => {
        const rowElement = getRowElement(definition.id, row);
        if (!rowElement) {
          return;
        }

        applySliderRowDefinition(rowElement, row);
        rowElement.classList.add("layer-body-row", `layer-body-row-${row.type}`);
        rowElement.dataset.layerRowType = row.type;
        rowElement.dataset.layerRowKey = getRowKey(row);
        orderedChildren.push(rowElement);

        const isLastRow = index === rows.length - 1;
        orderedChildren.push(createSpacer(isLastRow ? "end" : "between"));
      });

      bodyElement.replaceChildren(...orderedChildren);
    });
  }

  window.AtlasLayerBodyComposer = {
    composeLayerBodies,
  };
})();
