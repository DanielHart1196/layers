import { getExpandableLayerDefinitions, getLayerRows } from "./layers-registry.js";

function getRowKey(row) {
  if (row.type === "layer") {
    return row.layerId;
  }
  return row.controlId ?? row.type;
}

function createSpacer(kind) {
  const spacer = document.createElement("div");
  spacer.className = "layer-body-spacer";
  spacer.dataset.layerBodySpacer = kind;
  return spacer;
}

function applySliderRowDefinition(rowElement, row) {
  if (row.type !== "slider") {
    return;
  }

  const labelText = rowElement.querySelector(".layer-label-text, strong");
  if (labelText) {
    labelText.textContent = row.label;
  }

  if (row.inputId) {
    rowElement.setAttribute("for", row.inputId);
  }

  const inputElement = rowElement.querySelector("input[type='range']");
  if (inputElement instanceof HTMLInputElement) {
    inputElement.id = row.inputId;
    inputElement.min = String(row.min);
    inputElement.max = String(row.max);
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

const AtlasLayerBodyComposer = {
  composeLayerBodies,
};

export { composeLayerBodies };

export default AtlasLayerBodyComposer;

window.AtlasLayerBodyComposer = AtlasLayerBodyComposer;
