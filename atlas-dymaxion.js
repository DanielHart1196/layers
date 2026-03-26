(() => {
  const SQRT_3 = Math.sqrt(3);
  const SQRT_5 = Math.sqrt(5);
  const SQRT_8 = Math.sqrt(8);
  const SQRT_10 = Math.sqrt(10);
  const SQRT_15 = Math.sqrt(15);

  const VERTICES = [
    null,
    [0.420152426708710003, 0.078145249402782959, 0.904082550615019298],
    [0.995009439436241649, -0.091347795276427931, 0.040147175877166645],
    [0.518836730327364437, 0.83542038037823585, 0.181331837557262454],
    [-0.414682225320335218, 0.655962405434800777, 0.630675807891475371],
    [-0.515455959944041808, -0.381716898287133011, 0.767200992517747538],
    [0.355781402532944713, -0.843580002466178147, 0.402234226602925571],
    [0.414682225320335218, -0.655962405434800777, -0.630675807891475371],
    [0.515455959944041808, 0.381716898287133011, -0.767200992517747538],
    [-0.355781402532944713, 0.843580002466178147, -0.402234226602925571],
    [-0.995009439436241649, 0.091347795276427931, -0.040147175877166645],
    [-0.518836730327364437, -0.83542038037823585, -0.181331837557262454],
    [-0.420152426708710003, -0.078145249402782959, -0.904082550615019298],
  ];

  const FACES = [
    null,
    [1, 3, 2],
    [1, 4, 3],
    [1, 5, 4],
    [1, 6, 5],
    [1, 2, 6],
    [2, 3, 8],
    [3, 9, 8],
    [3, 4, 9],
    [4, 10, 9],
    [4, 5, 10],
    [5, 11, 10],
    [5, 6, 11],
    [6, 7, 11],
    [2, 7, 6],
    [2, 8, 7],
    [8, 9, 12],
    [9, 10, 12],
    [10, 11, 12],
    [11, 7, 12],
    [8, 12, 7],
  ];

  const FACE_LAYOUTS = {
    1: { angle: 240, offset: [2.0, 7.0 / (2.0 * SQRT_3)] },
    2: { angle: 300, offset: [2.0, 5.0 / (2.0 * SQRT_3)] },
    3: { angle: 0, offset: [2.5, 2.0 / SQRT_3] },
    4: { angle: 60, offset: [3.0, 5.0 / (2.0 * SQRT_3)] },
    5: { angle: 180, offset: [2.5, 4.0 * SQRT_3 / 3.0] },
    6: { angle: 300, offset: [1.5, 4.0 * SQRT_3 / 3.0] },
    7: { angle: 300, offset: [1.0, 5.0 / (2.0 * SQRT_3)] },
    8: { angle: 0, offset: [1.5, 2.0 / SQRT_3] },
    9: {
      variants: [
        { when: (lcd) => lcd > 2, angle: 300, offset: [1.5, 1.0 / SQRT_3] },
        { when: () => true, angle: 0, offset: [2.0, 1.0 / (2.0 * SQRT_3)] },
      ],
    },
    10: { angle: 60, offset: [2.5, 1.0 / SQRT_3] },
    11: { angle: 60, offset: [3.5, 1.0 / SQRT_3] },
    12: { angle: 120, offset: [3.5, 2.0 / SQRT_3] },
    13: { angle: 60, offset: [4.0, 5.0 / (2.0 * SQRT_3)] },
    14: { angle: 0, offset: [4.0, 7.0 / (2.0 * SQRT_3)] },
    15: { angle: 0, offset: [5.0, 7.0 / (2.0 * SQRT_3)] },
    16: {
      variants: [
        { when: (lcd) => lcd < 4, angle: 60, offset: [0.5, 1.0 / SQRT_3] },
        { when: () => true, angle: 0, offset: [5.5, 2.0 / SQRT_3] },
      ],
    },
    17: { angle: 0, offset: [1.0, 1.0 / (2.0 * SQRT_3)] },
    18: { angle: 120, offset: [4.0, 1.0 / (2.0 * SQRT_3)] },
    19: { angle: 120, offset: [4.5, 2.0 / SQRT_3] },
    20: { angle: 300, offset: [5.0, 5.0 / (2.0 * SQRT_3)] },
  };

  const TEMPLATE_EDGE_ARC = 2.0 * Math.asin(Math.sqrt(5 - SQRT_5) / SQRT_10);
  const HALF_TEMPLATE_ARC = TEMPLATE_EDGE_ARC / 2.0;
  const DYMAX_VERTEX_FACTOR = Math.sqrt(3 + SQRT_5) / Math.sqrt(5 + SQRT_5);
  const EDGE_LENGTH = SQRT_8 / Math.sqrt(5 + SQRT_5);

  const FACE_CENTERS = FACES.map((face) => {
    if (!face) {
      return null;
    }

    const [ax, ay, az] = VERTICES[face[0]];
    const [bx, by, bz] = VERTICES[face[1]];
    const [cx, cy, cz] = VERTICES[face[2]];

    return normalize([
      (ax + bx + cx) / 3,
      (ay + by + cy) / 3,
      (az + bz + cz) / 3,
    ]);
  });

  const RAW_BOUNDS = computeRawBounds();
  const RAW_CENTER = {
    x: (RAW_BOUNDS.minX + RAW_BOUNDS.maxX) / 2,
    y: (RAW_BOUNDS.minY + RAW_BOUNDS.maxY) / 2,
    width: RAW_BOUNDS.maxX - RAW_BOUNDS.minX,
    height: RAW_BOUNDS.maxY - RAW_BOUNDS.minY,
  };

  function computeRawBounds() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let latitude = -90; latitude <= 90; latitude += 1) {
      for (let longitude = -180; longitude <= 180; longitude += 1) {
        const rawPoint = projectRaw(longitude, latitude);
        minX = Math.min(minX, rawPoint.x);
        maxX = Math.max(maxX, rawPoint.x);
        minY = Math.min(minY, rawPoint.y);
        maxY = Math.max(maxY, rawPoint.y);
      }
    }

    return { minX, minY, maxX, maxY };
  }

  function createProjection(scene) {
    const projector = createProjector(scene);

    return {
      point(coordinates) {
        const projected = projector(coordinates[0], coordinates[1]);
        return [projected.x, projected.y];
      },
    };
  }

  function createProjector(scene) {
    const padding = 0.975;
    const scale = Math.min(scene.width / RAW_CENTER.width, scene.height / RAW_CENTER.height) * padding;

    return (longitude, latitude) => {
      const rawPoint = projectRaw(longitude, latitude);
      return {
        x: scene.center[0] + (rawPoint.x - RAW_CENTER.x) * scale,
        y: scene.center[1] - (rawPoint.y - RAW_CENTER.y) * scale,
        face: rawPoint.face,
        lcd: rawPoint.lcd,
      };
    };
  }

  function createFacePolygons(scene) {
    const projector = createProjector(scene);

    return FACES.map((face, faceIndex) => {
      if (!face || faceIndex === 0) {
        return null;
      }

      const points = face.map((vertexIndex) => {
        const spherical = cartesianToSpherical(VERTICES[vertexIndex]);
        const longitude = (spherical.lambda * 180) / Math.PI;
        const latitude = 90 - (spherical.polar * 180) / Math.PI;
        const projected = projector(longitude, latitude);

        return { x: projected.x, y: projected.y };
      });

      return {
        face: faceIndex,
        points,
      };
    });
  }

  function projectRaw(longitude, latitude) {
    const cartesian = sphericalToCartesian(toRadians(longitude), toRadians(latitude));
    const faceIndex = findFace(cartesian);
    const lcd = findLcd(faceIndex, cartesian);
    const aligned = alignToTemplate(faceIndex, cartesian);
    const planePoint = templateToPlane(aligned);
    const laidOut = placeFace(faceIndex, lcd, planePoint);

    return {
      x: laidOut.x,
      y: laidOut.y,
      face: faceIndex,
      lcd,
    };
  }

  function densifyLine(coordinates, maxStepDegrees = 2) {
    const densified = [];

    for (let index = 0; index < coordinates.length - 1; index += 1) {
      const start = coordinates[index];
      const end = coordinates[index + 1];
      const deltaLongitude = shortestLongitudeDelta(start[0], end[0]);
      const deltaLatitude = end[1] - start[1];
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(deltaLongitude), Math.abs(deltaLatitude)) / maxStepDegrees));

      if (index === 0) {
        densified.push([normalizeLongitude(start[0]), start[1]]);
      }

      for (let step = 1; step <= steps; step += 1) {
        densified.push([
          normalizeLongitude(start[0] + (deltaLongitude * step) / steps),
          start[1] + (deltaLatitude * step) / steps,
        ]);
      }
    }

    return densified;
  }

  function midpointCoordinates(start, end) {
    const deltaLongitude = shortestLongitudeDelta(start[0], end[0]);
    return [
      normalizeLongitude(start[0] + deltaLongitude / 2),
      (start[1] + end[1]) / 2,
    ];
  }

  function projectCoordinate(projector, coordinate) {
    const projected = projector(coordinate[0], coordinate[1]);
    return {
      coordinate,
      x: projected.x,
      y: projected.y,
      face: projected.face,
      lcd: projected.lcd,
    };
  }

  function refineProjectedSegment(projector, start, end, depthRemaining, minimumStepDegrees) {
    const startPoint = projectCoordinate(projector, start);
    const endPoint = projectCoordinate(projector, end);

    if (
      depthRemaining <= 0 ||
      startPoint.face === endPoint.face
    ) {
      return [startPoint, endPoint];
    }

    const deltaLongitude = Math.abs(shortestLongitudeDelta(start[0], end[0]));
    const deltaLatitude = Math.abs(end[1] - start[1]);

    if (Math.max(deltaLongitude, deltaLatitude) <= minimumStepDegrees) {
      return [startPoint, endPoint];
    }

    const midpoint = midpointCoordinates(start, end);
    const left = refineProjectedSegment(projector, start, midpoint, depthRemaining - 1, minimumStepDegrees);
    const right = refineProjectedSegment(projector, midpoint, end, depthRemaining - 1, minimumStepDegrees);

    return [...left.slice(0, -1), ...right];
  }

  function projectCoordinates(projector, coordinates, options = {}) {
    const {
      maxStepDegrees = 2,
      splitDepth = 8,
      minimumStepDegrees = 0.2,
    } = options;
    const densified = densifyLine(coordinates, maxStepDegrees);
    const projected = [];

    for (let index = 0; index < densified.length - 1; index += 1) {
      const refinedSegment = refineProjectedSegment(
        projector,
        densified[index],
        densified[index + 1],
        splitDepth,
        minimumStepDegrees,
      );

      if (index === 0) {
        projected.push(...refinedSegment);
      } else {
        projected.push(...refinedSegment.slice(1));
      }
    }

    return projected;
  }

  function traceCoordinates(context, projector, coordinates, options = {}) {
    const {
      closePath = false,
      maxStepDegrees = 2,
      breakDistance = 42,
      closeSegments = false,
      closeDistance = 18,
    } = options;
    const projectedPoints = projectCoordinates(projector, coordinates, {
      maxStepDegrees,
      splitDepth: options.splitDepth ?? 8,
      minimumStepDegrees: options.minimumStepDegrees ?? 0.2,
    });
    let previousPoint = null;
    let open = false;
    let segmentPointCount = 0;
    let segmentStartPoint = null;

    function maybeCloseCurrentSegment() {
      if (!open || !closePath || !closeSegments || segmentPointCount <= 2 || !segmentStartPoint || !previousPoint) {
        return;
      }

      if (distance(segmentStartPoint, previousPoint) <= closeDistance) {
        context.closePath();
      }
    }

    for (const point of projectedPoints) {
      const shouldBreak =
        previousPoint &&
        (
          distance(previousPoint, point) > breakDistance ||
          Math.abs(previousPoint.face - point.face) > 5
        );

      if (!open || shouldBreak) {
        maybeCloseCurrentSegment();
        context.moveTo(point.x, point.y);
        open = true;
        segmentPointCount = 1;
        segmentStartPoint = point;
      } else {
        context.lineTo(point.x, point.y);
        segmentPointCount += 1;
      }

      previousPoint = point;
    }

    if (closePath && previousPoint && (!closeSegments || distance(segmentStartPoint, previousPoint) <= closeDistance)) {
      context.closePath();
    }
  }

  function traceGeometry(context, projector, geometry, options = {}) {
    if (!geometry) {
      return;
    }

    switch (geometry.type) {
      case "FeatureCollection":
        geometry.features.forEach((feature) => traceGeometry(context, projector, feature, options));
        break;
      case "Feature":
        traceGeometry(context, projector, geometry.geometry, options);
        break;
      case "GeometryCollection":
        geometry.geometries.forEach((child) => traceGeometry(context, projector, child, options));
        break;
      case "Polygon":
        geometry.coordinates.forEach((ring) => traceCoordinates(context, projector, ring, { ...options, closePath: true }));
        break;
      case "MultiPolygon":
        geometry.coordinates.forEach((polygon) => {
          polygon.forEach((ring) => traceCoordinates(context, projector, ring, { ...options, closePath: true }));
        });
        break;
      case "LineString":
        traceCoordinates(context, projector, geometry.coordinates, options);
        break;
      case "MultiLineString":
        geometry.coordinates.forEach((line) => traceCoordinates(context, projector, line, options));
        break;
      default:
        break;
    }
  }

  function normalizeBorderPoint(point) {
    if (!point) {
      return null;
    }

    if (Array.isArray(point)) {
      return {
        lng: Number(point[0]),
        lat: Number(point[1]),
      };
    }

    if (typeof point === "object" && Number.isFinite(point.lng) && Number.isFinite(point.lat)) {
      return {
        lng: Number(point.lng),
        lat: Number(point.lat),
      };
    }

    return null;
  }

  function normalizeBorderRing(ring) {
    if (!Array.isArray(ring) || ring.length < 3) {
      return null;
    }

    const normalized = ring
      .map(normalizeBorderPoint)
      .filter(Boolean)
      .map((point) => [point.lng, point.lat]);

    if (normalized.length < 3) {
      return null;
    }

    const first = normalized[0];
    const last = normalized[normalized.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      normalized.push([first[0], first[1]]);
    }

    return normalized;
  }

  function createLayerData(countryBorders) {
    if (!Array.isArray(countryBorders) || countryBorders.length === 0) {
      return null;
    }

    const normalizedCountries = countryBorders
      .map((country) => {
        const borders = Array.isArray(country?.borders)
          ? country.borders.map(normalizeBorderRing).filter(Boolean)
          : [];

        if (borders.length === 0) {
          return null;
        }

        return {
          code: country.code ?? null,
          name: country.name ?? null,
          borders,
        };
      })
      .filter(Boolean);

    if (normalizedCountries.length === 0) {
      return null;
    }

    return {
      isPreSplit: true,
      countries: normalizedCountries,
      land: {
        type: "FeatureCollection",
        features: normalizedCountries.map((country) => ({
          type: "Feature",
          properties: {
            code: country.code,
            name: country.name,
          },
          geometry: {
            type: country.borders.length === 1 ? "Polygon" : "MultiPolygon",
            coordinates:
              country.borders.length === 1
                ? [country.borders[0]]
                : country.borders.map((ring) => [ring]),
          },
        })),
      },
      borders: {
        type: "FeatureCollection",
        features: normalizedCountries.flatMap((country) =>
          country.borders.map((ring) => ({
            type: "Feature",
            properties: {
              code: country.code,
              name: country.name,
            },
            geometry: {
              type: "LineString",
              coordinates: ring,
            },
          })),
        ),
      },
    };
  }

  let cachedSource = null;
  let cachedLayerData = null;

  function getLayerData(countryBorders) {
    if (countryBorders === cachedSource) {
      return cachedLayerData;
    }

    cachedSource = countryBorders;
    cachedLayerData = createLayerData(countryBorders);
    return cachedLayerData;
  }

  function sphericalToCartesian(lambda, phi) {
    const cosPhi = Math.cos(phi);
    return [
      cosPhi * Math.cos(lambda),
      cosPhi * Math.sin(lambda),
      Math.sin(phi),
    ];
  }

  function findFace(point) {
    let bestFace = 1;
    let bestDistance = Infinity;

    for (let index = 1; index < FACE_CENTERS.length; index += 1) {
      const center = FACE_CENTERS[index];
      const candidateDistance = magnitude(subtract(center, point));

      if (candidateDistance < bestDistance) {
        bestDistance = candidateDistance;
        bestFace = index;
      }
    }

    return bestFace;
  }

  function findLcd(faceIndex, point) {
    const [va, vb, vc] = FACES[faceIndex];
    const distances = [
      { vertex: va, distance: magnitude(subtract(point, VERTICES[va])) },
      { vertex: vb, distance: magnitude(subtract(point, VERTICES[vb])) },
      { vertex: vc, distance: magnitude(subtract(point, VERTICES[vc])) },
    ].sort((left, right) => left.distance - right.distance);

    const order = `${distances[0].vertex}-${distances[1].vertex}-${distances[2].vertex}`;
    const faceOrder = `${va}-${vb}-${vc}`;

    const lcdMap = new Map([
      [faceOrder, 1],
      [`${va}-${vc}-${vb}`, 6],
      [`${vb}-${va}-${vc}`, 2],
      [`${vb}-${vc}-${va}`, 3],
      [`${vc}-${va}-${vb}`, 5],
      [`${vc}-${vb}-${va}`, 4],
    ]);

    return lcdMap.get(order) ?? 1;
  }

  function alignToTemplate(faceIndex, point) {
    const anchorVertexIndex = FACES[faceIndex][0];
    let alignedPoint = [...point];
    let alignedVertex = [...VERTICES[anchorVertexIndex]];

    const faceSpherical = cartesianToSpherical(FACE_CENTERS[faceIndex]);
    alignedPoint = rotateAroundZ(alignedPoint, faceSpherical.lambda);
    alignedVertex = rotateAroundZ(alignedVertex, faceSpherical.lambda);

    alignedPoint = rotateAroundY(alignedPoint, faceSpherical.polar);
    alignedVertex = rotateAroundY(alignedVertex, faceSpherical.polar);

    const anchorSpherical = cartesianToSpherical(alignedVertex);
    alignedPoint = rotateAroundZ(alignedPoint, anchorSpherical.lambda - Math.PI / 2);

    return alignedPoint;
  }

  function templateToPlane(point) {
    const z = Math.sqrt(Math.max(0, 1 - point[0] * point[0] - point[1] * point[1]));
    const scale = Math.sqrt(5 + 2 * SQRT_5) / (z * SQRT_15);
    const px = point[0] * scale;
    const py = point[1] * scale;

    const a1Prime = (2 * py) / SQRT_3 + EDGE_LENGTH / 3;
    const a2Prime = px - py / SQRT_3 + EDGE_LENGTH / 3;
    const a3Prime = EDGE_LENGTH / 3 - px - py / SQRT_3;

    const a1 = HALF_TEMPLATE_ARC + Math.atan((a1Prime - 0.5 * EDGE_LENGTH) / DYMAX_VERTEX_FACTOR);
    const a2 = HALF_TEMPLATE_ARC + Math.atan((a2Prime - 0.5 * EDGE_LENGTH) / DYMAX_VERTEX_FACTOR);
    const a3 = HALF_TEMPLATE_ARC + Math.atan((a3Prime - 0.5 * EDGE_LENGTH) / DYMAX_VERTEX_FACTOR);

    return [
      (0.5 * (a2 - a3)) / TEMPLATE_EDGE_ARC,
      ((2 * a1 - a2 - a3) / (2 * SQRT_3)) / TEMPLATE_EDGE_ARC,
    ];
  }

  function placeFace(faceIndex, lcd, point) {
    const layoutConfig = FACE_LAYOUTS[faceIndex];
    const layout = layoutConfig.variants
      ? layoutConfig.variants.find((variant) => variant.when(lcd))
      : layoutConfig;

    const rotated = rotate2d(point, toRadians(layout.angle));
    return {
      x: rotated[0] + layout.offset[0],
      y: rotated[1] + layout.offset[1],
    };
  }

  function cartesianToSpherical([x, y, z]) {
    return {
      polar: Math.acos(clamp(z, -1, 1)),
      lambda: Math.atan2(y, x),
    };
  }

  function rotateAroundZ([x, y, z], angle) {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    return [
      x * cosAngle + y * sinAngle,
      y * cosAngle - x * sinAngle,
      z,
    ];
  }

  function rotateAroundY([x, y, z], angle) {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    return [
      x * cosAngle - z * sinAngle,
      y,
      x * sinAngle + z * cosAngle,
    ];
  }

  function rotate2d([x, y], angle) {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    return [
      x * cosAngle - y * sinAngle,
      x * sinAngle + y * cosAngle,
    ];
  }

  function shortestLongitudeDelta(start, end) {
    let delta = end - start;

    while (delta > 180) {
      delta -= 360;
    }

    while (delta < -180) {
      delta += 360;
    }

    return delta;
  }

  function normalizeLongitude(longitude) {
    let normalized = longitude;

    while (normalized > 180) {
      normalized -= 360;
    }

    while (normalized < -180) {
      normalized += 360;
    }

    return normalized;
  }

  function distance(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
  }

  function normalize(vector) {
    const length = magnitude(vector) || 1;
    return vector.map((value) => value / length);
  }

  function subtract(left, right) {
    return [
      left[0] - right[0],
      left[1] - right[1],
      left[2] - right[2],
    ];
  }

  function magnitude([x, y, z]) {
    return Math.hypot(x, y, z);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  function polygonArea(points) {
    let area = 0;

    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      area += current.x * next.y - next.x * current.y;
    }

    return area / 2;
  }

  function clipRingToPolygon(ringPoints, clipPolygonPoints) {
    const subject = ringPoints.slice(0, -1).map((point) => ({ x: point.x, y: point.y }));
    if (subject.length < 3) {
      return [];
    }

    const clipArea = polygonArea(clipPolygonPoints);
    const insideSign = clipArea >= 0 ? 1 : -1;
    let output = subject;

    for (let edgeIndex = 0; edgeIndex < clipPolygonPoints.length; edgeIndex += 1) {
      const clipStart = clipPolygonPoints[edgeIndex];
      const clipEnd = clipPolygonPoints[(edgeIndex + 1) % clipPolygonPoints.length];
      const input = output;
      output = [];

      if (input.length === 0) {
        break;
      }

      let previous = input[input.length - 1];

      for (const current of input) {
        const currentInside = isInsideClipEdge(current, clipStart, clipEnd, insideSign);
        const previousInside = isInsideClipEdge(previous, clipStart, clipEnd, insideSign);

        if (currentInside) {
          if (!previousInside) {
            output.push(intersectClipEdge(previous, current, clipStart, clipEnd));
          }
          output.push(current);
        } else if (previousInside) {
          output.push(intersectClipEdge(previous, current, clipStart, clipEnd));
        }

        previous = current;
      }
    }

    if (output.length < 3) {
      return [];
    }

    output.push({ ...output[0] });
    return output;
  }

  function isInsideClipEdge(point, edgeStart, edgeEnd, insideSign) {
    const cross =
      (edgeEnd.x - edgeStart.x) * (point.y - edgeStart.y) -
      (edgeEnd.y - edgeStart.y) * (point.x - edgeStart.x);

    return insideSign * cross >= -1e-6;
  }

  function intersectClipEdge(start, end, clipStart, clipEnd) {
    const lineDx = end.x - start.x;
    const lineDy = end.y - start.y;
    const clipDx = clipEnd.x - clipStart.x;
    const clipDy = clipEnd.y - clipStart.y;
    const denominator = lineDx * clipDy - lineDy * clipDx;

    if (Math.abs(denominator) < 1e-9) {
      return { x: end.x, y: end.y };
    }

    const t =
      ((clipStart.x - start.x) * clipDy - (clipStart.y - start.y) * clipDx) /
      denominator;

    return {
      x: start.x + t * lineDx,
      y: start.y + t * lineDy,
    };
  }

  window.AtlasDymaxion = {
    clipRingToPolygon,
    createLayerData,
    createFacePolygons,
    createProjection,
    createProjector,
    getLayerData,
    projectCoordinates,
    traceGeometry,
  };
})();
