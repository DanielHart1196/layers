(() => {
  const VIEW_WIDTH = 1200;
  const VIEW_HEIGHT = 860;
  const EARTH_TEXTURE_FALLBACKS = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/2048px-Blue_Marble_2002.png",
  ];
  const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const AVAILABLE_TOPOBATHY_MONTHS = new Set(MONTHS);
  const AZIMUTHAL_EQD_SCALE_FACTOR = 2 / Math.PI;
  const MERCATOR_DEFAULT_ZOOM = 1.08;
  const MERCATOR_SCREEN_FIT_SCALE = VIEW_HEIGHT / (2 * Math.PI);
  const NATURAL_EARTH_FIT_PADDING = 8;
  const GOODE_FIT_PADDING = 8;
  const ORTHOGRAPHIC_VIEWPORT_PADDING = 44;
  const WATERMAN_ROTATE = [20, 0, 0];
  const WATERMAN_FIT_PADDING = 8;

  const atlasSceneDefinitions = [
    {
      kind: "main",
      baseRotate: [108, -4, 0],
      center: [310, 430],
      radius: 290,
      projectionScale: 290,
    },
    {
      kind: "main",
      baseRotate: [-70, -4, 0],
      center: [890, 430],
      radius: 290,
      projectionScale: 290,
    },
    {
      kind: "pole",
      baseRotate: [0, -90, 0],
      center: [600, 140],
      radius: 120,
      projectionScale: 220,
    },
    {
      kind: "pole",
      baseRotate: [0, 90, 0],
      center: [600, 720],
      radius: 120,
      projectionScale: 220,
    },
  ];
  const mercatorSceneDefinition = {
    kind: "mercator-main",
    center: [600, 430],
    width: 1200,
    height: 860,
    projectionScale: MERCATOR_SCREEN_FIT_SCALE * MERCATOR_DEFAULT_ZOOM,
    baseRotate: [0, 0, 0],
  };
  const dymaxionSceneDefinition = {
    kind: "dymaxion-main",
    center: [600, 430],
    width: 1060,
    height: 680,
    baseRotate: [0, 0, 0],
  };
  const orthographicSceneDefinition = {
    kind: "orthographic-main",
    center: [600, 430],
    radius: 360,
    projectionScale: 360,
    baseRotate: [20, -10, 0],
  };

  function getViewDimensions(projectionKind = "azimuthal-equidistant") {
    if (
      (
        projectionKind === "mercator" ||
        projectionKind === "orthographic" ||
        projectionKind === "natural-earth-ii" ||
        projectionKind === "goode-homolosine" ||
        projectionKind === "waterman"
      ) &&
      typeof window !== "undefined"
    ) {
      return {
        width: Math.max(1, Math.round(window.innerWidth || VIEW_WIDTH)),
        height: Math.max(1, Math.round(window.innerHeight || VIEW_HEIGHT)),
      };
    }

    return {
      width: VIEW_WIDTH,
      height: VIEW_HEIGHT,
    };
  }

  function createMercatorSceneDefinition(viewDimensions) {
    const { width, height } = viewDimensions;

    return {
      kind: "mercator-main",
      center: [width / 2, height / 2],
      width,
      height,
      projectionScale: (height / (2 * Math.PI)) * MERCATOR_DEFAULT_ZOOM,
      baseRotate: [0, 0, 0],
    };
  }

  function createOrthographicSceneDefinition(viewDimensions) {
    const { width, height } = viewDimensions;
    const radius = Math.max(120, Math.min(width, height) / 2 - ORTHOGRAPHIC_VIEWPORT_PADDING);

    return {
      kind: "orthographic-main",
      center: [width / 2, height / 2],
      radius,
      projectionScale: radius,
      baseRotate: orthographicSceneDefinition.baseRotate,
    };
  }

  function createViewportFlatSceneDefinition(viewDimensions) {
    const { width, height } = viewDimensions;
    return {
      kind: "mercator-main",
      center: [width / 2, height / 2],
      width,
      height,
      projectionScale: mercatorSceneDefinition.projectionScale,
      baseRotate: [0, 0, 0],
    };
  }

  const graticule = d3.geoGraticule10();
  const equator = {
    type: "LineString",
    coordinates: d3.range(-180, 181, 1).map((longitude) => [longitude, 0]),
  };
  const dragSensitivity = 0.35;
  const lightDirection = normalizeVector([-0.35, 0.4, 0.85]);

  function getDefaultMonth() {
    try {
      const formatter = new Intl.DateTimeFormat(undefined, { month: "2-digit" });
      const month = formatter.format(new Date());
      if (MONTHS.includes(month)) {
        return month;
      }
    } catch (error) {
      console.warn("Falling back to UTC month.", error);
    }

    return String(new Date().getUTCMonth() + 1).padStart(2, "0");
  }

  function getResolvedScenes(sceneDefinitions, projectionState, rotationOffset, zoomScale = 1, panOffset = { x: 0, y: 0 }) {
    const mercatorScene = createMercatorSceneDefinition(getViewDimensions("mercator"));
    const orthographicScene = createOrthographicSceneDefinition(getViewDimensions("orthographic"));
    const naturalEarthScene = createViewportFlatSceneDefinition(getViewDimensions("natural-earth-ii"));
    const goodeScene = createViewportFlatSceneDefinition(getViewDimensions("goode-homolosine"));
    const watermanScene = createViewportFlatSceneDefinition(getViewDimensions("waterman"));
    const activeSceneDefinitions = projectionState.selectedProjection === "orthographic"
      ? [orthographicScene]
      : projectionState.selectedProjection === "mercator"
      ? [mercatorScene]
      : projectionState.selectedProjection === "natural-earth-ii"
      ? [naturalEarthScene]
      : projectionState.selectedProjection === "goode-homolosine"
      ? [goodeScene]
      : projectionState.selectedProjection === "waterman"
      ? [watermanScene]
      : projectionState.selectedProjection === "dymaxion"
        ? [dymaxionSceneDefinition]
        : sceneDefinitions;

    return activeSceneDefinitions.map((sceneDefinition) =>
      resolveScene(sceneDefinition, projectionState, rotationOffset, zoomScale, panOffset),
    );
  }

  function resolveScene(sceneDefinition, projectionState, rotationOffset, zoomScale = 1, panOffset = { x: 0, y: 0 }) {
    const resolvedRadius = (
      sceneDefinition.kind === "orthographic-main" &&
      sceneDefinition.radius
    )
      ? sceneDefinition.radius * zoomScale
      : sceneDefinition.radius;

    return {
      ...sceneDefinition,
      radius: resolvedRadius,
      zoomScale,
      panOffset,
      rotate: getSceneRotate(sceneDefinition, rotationOffset),
      projectionKind: getSceneProjectionKind(sceneDefinition, projectionState),
    };
  }

  function getSceneBounds(scene) {
    if (
      (scene.projectionKind === "mercator" ||
        scene.projectionKind === "natural-earth-ii" ||
        scene.projectionKind === "goode-homolosine" ||
        scene.projectionKind === "waterman" ||
        scene.projectionKind === "dymaxion") &&
      scene.width &&
      scene.height
    ) {
      return {
        left: scene.center[0] - scene.width / 2,
        top: scene.center[1] - scene.height / 2,
        width: scene.width,
        height: scene.height,
        cornerRadius: scene.projectionKind === "mercator" ? 0 : 26,
      };
    }

    return {
      left: scene.center[0] - scene.radius,
      top: scene.center[1] - scene.radius,
      width: scene.radius * 2,
      height: scene.radius * 2,
      cornerRadius: scene.radius,
    };
  }

  function traceSceneShape(context, scene) {
    const bounds = getSceneBounds(scene);

    context.beginPath();
    if (
      scene.projectionKind === "natural-earth-ii" ||
      scene.projectionKind === "goode-homolosine" ||
      scene.projectionKind === "waterman"
    ) {
      const path = d3.geoPath(createProjection(scene), context);
      path({ type: "Sphere" });
      return;
    }

    if (
      (scene.projectionKind === "mercator" ||
        scene.projectionKind === "natural-earth-ii" ||
        scene.projectionKind === "goode-homolosine" ||
        scene.projectionKind === "waterman" ||
        scene.projectionKind === "dymaxion") &&
      scene.width &&
      scene.height
    ) {
      context.roundRect(bounds.left, bounds.top, bounds.width, bounds.height, bounds.cornerRadius);
      return;
    }

    context.arc(scene.center[0], scene.center[1], scene.radius, 0, Math.PI * 2);
  }

  function createProjection(scene, options = {}) {
    if (scene.projectionKind === "dymaxion") {
      return window.AtlasDymaxion.createProjection(scene);
    }

    const projection = scene.projectionKind === "azimuthal-equidistant"
      ? d3.geoAzimuthalEquidistant()
      : scene.projectionKind === "natural-earth-ii"
        ? d3.geoNaturalEarth2()
        : scene.projectionKind === "goode-homolosine"
          ? d3.geoInterruptedHomolosine()
        : scene.projectionKind === "waterman"
          ? d3.geoPolyhedralWaterman()
        : scene.projectionKind === "mercator"
        ? d3.geoMercator()
        : d3.geoOrthographic();
    const scaleFactor = scene.projectionKind === "azimuthal-equidistant"
      ? AZIMUTHAL_EQD_SCALE_FACTOR
      : 1;
    const usesViewportCameraTransform =
      scene.projectionKind === "natural-earth-ii" ||
      scene.projectionKind === "goode-homolosine" ||
      scene.projectionKind === "waterman";

    projection
      .translate(scene.center)
      .scale(
        (scene.projectionScale ?? scene.radius)
        * scaleFactor
        * (usesViewportCameraTransform ? 1 : (scene.zoomScale ?? 1)),
      );

    if (scene.projectionKind === "mercator") {
      projection
        .center([-scene.rotate[0], -scene.rotate[1]]);
    } else if (scene.projectionKind === "waterman") {
      projection
        .rotate(WATERMAN_ROTATE);
    } else if (
      scene.projectionKind === "natural-earth-ii" ||
      scene.projectionKind === "goode-homolosine"
    ) {
      if (typeof projection.center === "function") {
        projection.center([0, 0]);
      }
    } else {
      projection
        .rotate(scene.rotate)
        .clipAngle(90);
    }

    if (
      (
        scene.projectionKind === "natural-earth-ii" ||
        scene.projectionKind === "goode-homolosine" ||
        scene.projectionKind === "waterman"
      )
      && scene.width
      && scene.height
    ) {
      projection.fitExtent(
        [
          [
            scene.center[0] - scene.width / 2 + (
              scene.projectionKind === "waterman"
                ? WATERMAN_FIT_PADDING
                : scene.projectionKind === "goode-homolosine"
                  ? GOODE_FIT_PADDING
                  : NATURAL_EARTH_FIT_PADDING
            ),
            scene.center[1] - scene.height / 2 + (
              scene.projectionKind === "waterman"
                ? WATERMAN_FIT_PADDING
                : scene.projectionKind === "goode-homolosine"
                  ? GOODE_FIT_PADDING
                  : NATURAL_EARTH_FIT_PADDING
            ),
          ],
          [
            scene.center[0] + scene.width / 2 - (
              scene.projectionKind === "waterman"
                ? WATERMAN_FIT_PADDING
                : scene.projectionKind === "goode-homolosine"
                  ? GOODE_FIT_PADDING
                  : NATURAL_EARTH_FIT_PADDING
            ),
            scene.center[1] + scene.height / 2 - (
              scene.projectionKind === "waterman"
                ? WATERMAN_FIT_PADDING
                : scene.projectionKind === "goode-homolosine"
                  ? GOODE_FIT_PADDING
                  : NATURAL_EARTH_FIT_PADDING
            ),
          ],
        ],
        { type: "Sphere" },
      );

      projection
        .scale(projection.scale() * (usesViewportCameraTransform ? 1 : (scene.zoomScale ?? 1)))
        .translate(scene.center);
    }

    if (
      (
        scene.projectionKind === "mercator" ||
        scene.projectionKind === "natural-earth-ii"
      ) &&
      scene.width &&
      scene.height &&
      !options.disableClipExtent
    ) {
      projection.clipExtent([
        [scene.center[0] - scene.width / 2, scene.center[1] - scene.height / 2],
        [scene.center[0] + scene.width / 2, scene.center[1] + scene.height / 2],
      ]);
    }

    return projection;
  }

  function getSceneProjectionKind(sceneDefinition, projectionState) {
    if (
      sceneDefinition.kind === "mercator-main" &&
      (
        projectionState.selectedProjection === "mercator" ||
        projectionState.selectedProjection === "natural-earth-ii" ||
        projectionState.selectedProjection === "goode-homolosine" ||
        projectionState.selectedProjection === "waterman"
      )
    ) {
      return projectionState.selectedProjection;
    }

    if (
      sceneDefinition.kind === "dymaxion-main" &&
      projectionState.selectedProjection === "dymaxion"
    ) {
      return "dymaxion";
    }

    if (
      sceneDefinition.kind === "orthographic-main" &&
      projectionState.selectedProjection === "orthographic"
    ) {
      return "orthographic";
    }

    if (
      sceneDefinition.kind === "main" &&
      (
        projectionState.selectedProjection === "azimuthal-equidistant" ||
        projectionState.selectedProjection === "mercator" ||
        projectionState.selectedProjection === "natural-earth-ii" ||
        projectionState.selectedProjection === "goode-homolosine" ||
        projectionState.selectedProjection === "waterman"
      )
    ) {
      return projectionState.selectedProjection;
    }

    return "orthographic";
  }

  function getSceneRotate(sceneDefinition, rotationOffset) {
    if (sceneDefinition.kind === "mercator-main") {
      return [
        sceneDefinition.baseRotate[0] + rotationOffset.lambda,
        clamp(sceneDefinition.baseRotate[1] + rotationOffset.phi, -80, 80),
        sceneDefinition.baseRotate[2] ?? 0,
      ];
    }

    if (sceneDefinition.kind === "dymaxion-main") {
      return [...sceneDefinition.baseRotate];
    }

    if (sceneDefinition.kind === "pole") {
      const poleSpin = sceneDefinition.baseRotate[1] < 0
        ? rotationOffset.lambda
        : -rotationOffset.lambda;

      return [
        sceneDefinition.baseRotate[0],
        sceneDefinition.baseRotate[1],
        (sceneDefinition.baseRotate[2] ?? 0) + poleSpin,
      ];
    }

    return [
      sceneDefinition.baseRotate[0] + rotationOffset.lambda,
      clamp(sceneDefinition.baseRotate[1] + rotationOffset.phi, -89.999, 89.999),
      sceneDefinition.baseRotate[2] ?? 0,
    ];
  }

  function normalizeVector([x, y, z]) {
    const magnitude = Math.hypot(x, y, z) || 1;
    return new Float32Array([x / magnitude, y / magnitude, z / magnitude]);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  window.AtlasCore = {
    AVAILABLE_TOPOBATHY_MONTHS,
    EARTH_TEXTURE_FALLBACKS,
    MONTHS,
    VIEW_HEIGHT,
    VIEW_WIDTH,
    atlasSceneDefinitions,
    clamp,
    createProjection,
    createOrthographicSceneDefinition,
    dragSensitivity,
    equator,
    getDefaultMonth,
    getViewDimensions,
    getResolvedScenes,
    getSceneBounds,
    graticule,
    lightDirection,
    mercatorSceneDefinition,
    orthographicSceneDefinition,
    dymaxionSceneDefinition,
    traceSceneShape,
    toRadians,
  };
})();
