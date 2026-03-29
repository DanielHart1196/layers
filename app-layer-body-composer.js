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

  function composeLayerBodies({ getBodyElement, getRowElement }) {
    getExpandableLayerDefinitions().forEach((definition) => {
      const bodyElement = getBodyElement(definition.id, definition.bodySectionId);
      if (!bodyElement) {
        return;
      }

      bodyElement.classList.add("layer-body");
      bodyElement.dataset.layerBodyFor = definition.id;
      bodyElement.querySelectorAll(".layer-body-spacer").forEach((element) => element.remove());

      const rows = getLayerRows(definition.id);
      rows.forEach((row, index) => {
        const rowElement = getRowElement(definition.id, row);
        if (!rowElement) {
          return;
        }

        rowElement.classList.add("layer-body-row", `layer-body-row-${row.type}`);
        rowElement.dataset.layerRowType = row.type;
        rowElement.dataset.layerRowKey = getRowKey(row);
        bodyElement.appendChild(rowElement);

        const isLastRow = index === rows.length - 1;
        bodyElement.appendChild(createSpacer(isLastRow ? "end" : "between"));
      });
    });
  }

  window.AtlasLayerBodyComposer = {
    composeLayerBodies,
  };
})();
