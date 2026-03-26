self.importScripts(
  "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js",
  "https://cdn.jsdelivr.net/npm/d3-geo-projection@4/dist/d3-geo-projection.min.js",
);

const WATERMAN_ROTATE = [20, 0, 0];
const WATERMAN_FIT_PADDING = 8;
let cachedSource = null;

function createWatermanProjection(scene) {
  const projection = d3.geoPolyhedralWaterman()
    .translate(scene.center)
    .scale(scene.projectionScale);

  projection.rotate(WATERMAN_ROTATE);

  if (scene.width && scene.height) {
    projection.fitExtent(
      [
        [
          scene.center[0] - scene.width / 2 + WATERMAN_FIT_PADDING,
          scene.center[1] - scene.height / 2 + WATERMAN_FIT_PADDING,
        ],
        [
          scene.center[0] + scene.width / 2 - WATERMAN_FIT_PADDING,
          scene.center[1] + scene.height / 2 - WATERMAN_FIT_PADDING,
        ],
      ],
      { type: "Sphere" },
    );
  }

  return projection;
}

function sampleEquirectangular(source, longitude, latitude) {
  const x = ((longitude + 180) / 360) * (source.width - 1);
  const y = ((90 - latitude) / 180) * (source.height - 1);
  const sampleX = Math.max(0, Math.min(source.width - 1, Math.round(x)));
  const sampleY = Math.max(0, Math.min(source.height - 1, Math.round(y)));
  const offset = (sampleY * source.width + sampleX) * 4;

  return [
    source.pixels[offset],
    source.pixels[offset + 1],
    source.pixels[offset + 2],
    source.pixels[offset + 3],
  ];
}

self.onmessage = (event) => {
  const { type } = event.data ?? {};

  if (type === "set-source") {
    const { source } = event.data ?? {};
    if (!source?.width || !source?.height || !source?.pixels) {
      return;
    }

    cachedSource = {
      width: source.width,
      height: source.height,
      pixels: new Uint8ClampedArray(source.pixels),
    };
    return;
  }

  const { cacheKey, scene, internalScale } = event.data ?? {};
  if (!cacheKey || !scene || !internalScale || !cachedSource) {
    return;
  }

  const projection = createWatermanProjection(scene);
  const bounds = {
    left: scene.center[0] - scene.width / 2,
    top: scene.center[1] - scene.height / 2,
    width: scene.width,
    height: scene.height,
  };
  const width = Math.max(1, Math.round(bounds.width * internalScale));
  const height = Math.max(1, Math.round(bounds.height * internalScale));
  const destination = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const worldPoint = projection.invert([
        bounds.left + (x + 0.5) / internalScale,
        bounds.top + (y + 0.5) / internalScale,
      ]);
      const offset = (y * width + x) * 4;

      if (!worldPoint || !Number.isFinite(worldPoint[0]) || !Number.isFinite(worldPoint[1])) {
        destination[offset + 3] = 0;
        continue;
      }

      const [red, green, blue, alpha] = sampleEquirectangular(
        cachedSource,
        worldPoint[0],
        worldPoint[1],
      );
      destination[offset] = red;
      destination[offset + 1] = green;
      destination[offset + 2] = blue;
      destination[offset + 3] = alpha;
    }
  }

  self.postMessage(
    {
      cacheKey,
      width,
      height,
      pixels: destination.buffer,
    },
    [destination.buffer],
  );
};
