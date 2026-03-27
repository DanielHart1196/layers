(() => {
  function createGlobeRenderer(canvasElement) {
    const gl = canvasElement.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });

    if (!gl) {
      console.error("WebGL not available; Earth rendering will fall back to overlay only.");
      return {
        clear() {
          const fallbackContext = canvasElement.getContext("2d");
          fallbackContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        },
        render() {},
        resize() {},
        setTexture() {},
      };
    }

    const vertexSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;

      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;

      varying vec2 v_uv;

      uniform sampler2D u_texture;
      uniform vec3 u_rotation;
      uniform vec3 u_lightDirection;
      uniform float u_cropRatio;
      uniform float u_projectionType;
      uniform vec2 u_sceneSize;
      uniform float u_mercatorScale;

      const float PI = 3.14159265358979323846264;

      vec3 applyColorGrade(vec3 color) {
        return color;
      }

      void main() {
        vec2 p = v_uv * 2.0 - 1.0;
        float roll = u_rotation.z;
        float rollCos = cos(roll);
        float rollSin = sin(roll);
        p = vec2(
          p.x * rollCos - p.y * rollSin,
          p.x * rollSin + p.y * rollCos
        );
        float visibleR = length(p);
        if (u_projectionType < 1.5 && visibleR > 1.0) {
          discard;
        }

        vec2 sphereP = u_projectionType > 1.5
          ? p
          : p * u_cropRatio;
        float r = length(sphereP);

        if (u_projectionType < 1.5 && r > 1.0) {
          discard;
        }

        vec2 dir = r > 0.0 ? sphereP / r : vec2(0.0);
        float nx = dir.x * r;
        float ny = dir.y * r;

        float lat0 = u_rotation.y;
        float lon0 = u_rotation.x;
        float lat;
        float lon;
        float c;
        float sinC;
        float cosC;

        if (u_projectionType > 1.5) {
          float xOffset = (v_uv.x - 0.5) * u_sceneSize.x;
          float yOffset = (v_uv.y - 0.5) * u_sceneSize.y;
          lon = lon0 + xOffset / u_mercatorScale;
          float mercatorCenterY = log(tan(PI * 0.25 + lat0 * 0.5));
          float mercatorY = mercatorCenterY + yOffset / u_mercatorScale;
          lat = 2.0 * atan(exp(mercatorY)) - PI * 0.5;
          c = acos(clamp(
            sin(lat0) * sin(lat) + cos(lat0) * cos(lat) * cos(lon - lon0),
            -1.0,
            1.0
          ));
          sinC = sin(c);
          cosC = cos(c);
        } else {
          c = u_projectionType < 0.5 ? asin(r) : r * PI * 0.5;
          sinC = sin(c);
          cosC = cos(c);
          float sinLat0 = sin(lat0);
          float cosLat0 = cos(lat0);
          float safeR = max(r, 0.000001);

          lat = asin(cosC * sinLat0 + (ny * sinC * cosLat0) / safeR);
          lon = lon0 + atan(nx * sinC, safeR * cosLat0 * cosC - ny * sinLat0 * sinC);
        }

        float tx = fract((lon + PI) / (2.0 * PI));
        float ty = clamp((PI * 0.5 - lat) / PI, 0.0, 1.0);
        vec3 tex = texture2D(u_texture, vec2(tx, ty)).rgb;

        float radialOnSphere = sinC;
        vec3 normal = normalize(vec3(dir.x * radialOnSphere, -dir.y * radialOnSphere, cosC));
        float illumination = 0.96 + max(dot(normal, u_lightDirection), 0.0) * 0.04;
        vec3 graded = applyColorGrade(tex);
        vec3 color = graded * illumination;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const program = createProgram(gl, vertexSource, fragmentSource);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const rotationLocation = gl.getUniformLocation(program, "u_rotation");
    const lightLocation = gl.getUniformLocation(program, "u_lightDirection");
    const cropRatioLocation = gl.getUniformLocation(program, "u_cropRatio");
    const projectionTypeLocation = gl.getUniformLocation(program, "u_projectionType");
    const sceneSizeLocation = gl.getUniformLocation(program, "u_sceneSize");
    const mercatorScaleLocation = gl.getUniformLocation(program, "u_mercatorScale");
    const textureLocation = gl.getUniformLocation(program, "u_texture");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    );

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(textureLocation, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.SCISSOR_TEST);

    function setTexture(image) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (!image) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0, 0]),
        );
        return;
      }

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    }

    function clear() {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.SCISSOR_TEST);
    }

    function render({ scenes, pixelRatio, lightDirection }) {
      clear();
      gl.useProgram(program);
      gl.uniform3fv(lightLocation, lightDirection);

      scenes.forEach((scene) => {
        const sceneWidth = scene.projectionKind === "mercator" && scene.width
          ? scene.width
          : scene.radius * 2;
        const sceneHeight = scene.projectionKind === "mercator" && scene.height
          ? scene.height
          : scene.radius * 2;
        const left = Math.round((scene.center[0] - sceneWidth / 2) * pixelRatio);
        const viewHeight = gl.drawingBufferHeight / pixelRatio;
        const bottom = Math.round((viewHeight - (scene.center[1] + sceneHeight / 2)) * pixelRatio);
        const width = Math.round(sceneWidth * pixelRatio);
        const height = Math.round(sceneHeight * pixelRatio);

        gl.viewport(left, bottom, width, height);
        gl.scissor(left, bottom, width, height);
        gl.uniform3f(
          rotationLocation,
          window.AtlasCore.toRadians(-scene.rotate[0]),
          window.AtlasCore.toRadians(-scene.rotate[1]),
          window.AtlasCore.toRadians(-scene.rotate[2] ?? 0),
        );
        gl.uniform1f(
          cropRatioLocation,
          scene.projectionKind === "mercator"
            ? 1
            : scene.radius / ((scene.projectionScale ?? scene.radius) * (scene.zoomScale ?? 1))
        );
        gl.uniform2f(sceneSizeLocation, sceneWidth, sceneHeight);
        gl.uniform1f(
          mercatorScaleLocation,
          scene.projectionKind === "mercator"
            ? ((scene.projectionScale ?? scene.radius ?? 1) * (scene.zoomScale ?? 1))
            : 1,
        );
        gl.uniform1f(
          projectionTypeLocation,
          scene.projectionKind === "mercator"
            ? 2
            : scene.projectionKind === "azimuthal-equidistant"
              ? 1
              : 0
        );
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      });
    }

    return {
      clear,
      render,
      resize() {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      },
      setTexture,
    };
  }

  function createFlatMapRenderer() {
    try {
      const canvasElement = document.createElement("canvas");
      const gl = canvasElement.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
      });

      if (!gl) {
        console.error("WebGL not available; flat raster rendering will fall back to CPU overlay.");
        return {
          hasMesh() {
            return false;
          },
          prepare() {
            return null;
          },
          render() {
            return null;
          },
          resize() {},
          setTexture() {},
        };
      }

      const vertexSource = `
      attribute vec2 a_position;
      attribute vec2 a_uv;
      varying vec2 v_uv;
      uniform vec2 u_viewSize;
      uniform float u_zoomScale;
      uniform vec2 u_panOffset;

      void main() {
        vec2 centered = a_position - (u_viewSize * 0.5);
        vec2 scaled = centered * u_zoomScale;
        vec2 screen = scaled + (u_viewSize * 0.5) + u_panOffset;
        vec2 clip = vec2(
          (screen.x / u_viewSize.x) * 2.0 - 1.0,
          1.0 - (screen.y / u_viewSize.y) * 2.0
        );
        v_uv = a_uv;
        gl_Position = vec4(clip, 0.0, 1.0);
      }
      `;

      const fragmentSource = `
      precision mediump float;

      varying vec2 v_uv;
      uniform sampler2D u_texture;

      void main() {
        gl_FragColor = texture2D(u_texture, v_uv);
      }
      `;

      const program = createProgram(gl, vertexSource, fragmentSource);
      gl.useProgram(program);

      const positionLocation = gl.getAttribLocation(program, "a_position");
      const uvLocation = gl.getAttribLocation(program, "a_uv");
      const viewSizeLocation = gl.getUniformLocation(program, "u_viewSize");
      const textureLocation = gl.getUniformLocation(program, "u_texture");
      const zoomScaleLocation = gl.getUniformLocation(program, "u_zoomScale");
      const panOffsetLocation = gl.getUniformLocation(program, "u_panOffset");

      const positionBuffer = gl.createBuffer();
      const uvBuffer = gl.createBuffer();
      const texture = gl.createTexture();
      const meshCache = new Map();
      let currentTextureKey = null;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(textureLocation, 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      function setTexture(image) {
        const nextKey = image ? (image.currentSrc || image.src || "__image__") : null;
        if (nextKey === currentTextureKey) {
          return;
        }

        currentTextureKey = nextKey;
        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (!image) {
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0]),
          );
          return;
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      }

      function getMeshProfile(projectionKind, pixelRatio = 1) {
        const densityFactor = Math.min(Math.max(pixelRatio, 1), 2);

        if (projectionKind === "waterman") {
          return {
            lonStep: 2.25 / densityFactor,
            latStep: 2.25 / densityFactor,
            edgeLimit: 90,
            seamTolerance: 18,
          };
        }

        if (projectionKind === "goode-homolosine") {
          return {
            lonStep: 2.75 / densityFactor,
            latStep: 2.75 / densityFactor,
            edgeLimit: 110,
            seamTolerance: 20,
          };
        }

        return {
          lonStep: 3 / densityFactor,
          latStep: 3 / densityFactor,
          edgeLimit: 120,
          seamTolerance: 24,
        };
      }

      function buildMeshCacheKey(scene, pixelRatio) {
        return [
          scene.projectionKind,
          scene.width ?? scene.radius ?? 0,
          scene.height ?? scene.radius ?? 0,
          scene.center[0],
          scene.center[1],
          scene.projectionScale ?? scene.radius ?? 0,
          pixelRatio,
        ].join("|");
      }

      function hasMesh(scene, pixelRatio) {
        return meshCache.has(buildMeshCacheKey(scene, pixelRatio));
      }

      function pushTriangle(positionData, uvData, pointA, pointB, pointC) {
        positionData.push(
          pointA.position[0], pointA.position[1],
          pointB.position[0], pointB.position[1],
          pointC.position[0], pointC.position[1],
        );
        uvData.push(
          pointA.uv[0], pointA.uv[1],
          pointB.uv[0], pointB.uv[1],
          pointC.uv[0], pointC.uv[1],
        );
      }

      function edgeLength(pointA, pointB) {
        return Math.hypot(pointA.position[0] - pointB.position[0], pointA.position[1] - pointB.position[1]);
      }

      function uvDistance(pointA, pointB) {
        const uDelta = Math.abs(pointA.uv[0] - pointB.uv[0]);
        return Math.max(
          Math.min(uDelta, 1 - uDelta),
          Math.abs(pointA.uv[1] - pointB.uv[1]),
        );
      }

      function longitudeDelta(a, b) {
        const delta = Math.abs(a - b) % 360;
        return delta > 180 ? 360 - delta : delta;
      }

      function triangleExpectedCentroid(pointA, pointB, pointC) {
        return [
          ((pointA.geo[0] + pointB.geo[0] + pointC.geo[0]) / 3 + 540) % 360 - 180,
          (pointA.geo[1] + pointB.geo[1] + pointC.geo[1]) / 3,
        ];
      }

      function triangleProjectedCentroid(pointA, pointB, pointC, pixelRatio) {
        return [
          (pointA.position[0] + pointB.position[0] + pointC.position[0]) / (3 * pixelRatio),
          (pointA.position[1] + pointB.position[1] + pointC.position[1]) / (3 * pixelRatio),
        ];
      }

      function shouldSkipTriangle(projection, pointA, pointB, pointC, edgeLimit, seamTolerance, pixelRatio) {
        if (!pointA || !pointB || !pointC) {
          return true;
        }

        const edges = [
          edgeLength(pointA, pointB),
          edgeLength(pointB, pointC),
          edgeLength(pointC, pointA),
        ];

        const uvEdges = [
          uvDistance(pointA, pointB),
          uvDistance(pointB, pointC),
          uvDistance(pointC, pointA),
        ];

        if (
          edges.some((length) => !Number.isFinite(length) || length > edgeLimit)
          || uvEdges.some((distance) => !Number.isFinite(distance) || distance > 0.25)
        ) {
          return true;
        }

        const projectedCentroid = triangleProjectedCentroid(pointA, pointB, pointC, pixelRatio);
        const invertedCentroid = projection.invert(projectedCentroid);
        if (!invertedCentroid || !Number.isFinite(invertedCentroid[0]) || !Number.isFinite(invertedCentroid[1])) {
          return true;
        }

        const expectedCentroid = triangleExpectedCentroid(pointA, pointB, pointC);
        return longitudeDelta(invertedCentroid[0], expectedCentroid[0]) > seamTolerance
          || Math.abs(invertedCentroid[1] - expectedCentroid[1]) > seamTolerance;
      }

      function projectGridPoint(projection, longitude, latitude, pixelRatio) {
        const projected = projection([longitude, latitude]);
        if (!projected || !Number.isFinite(projected[0]) || !Number.isFinite(projected[1])) {
          return null;
        }

        return {
          position: [projected[0] * pixelRatio, projected[1] * pixelRatio],
          geo: [longitude, latitude],
          uv: [(longitude + 180) / 360, (90 - latitude) / 180],
        };
      }

      function buildProjectedMesh(scene, pixelRatio) {
        const cacheKey = buildMeshCacheKey(scene, pixelRatio);
        if (meshCache.has(cacheKey)) {
          return meshCache.get(cacheKey);
        }

        const baseScene = { ...scene, zoomScale: 1 };
        const projection = window.AtlasCore.createProjection(baseScene);
        const { lonStep, latStep, edgeLimit, seamTolerance } = getMeshProfile(
          scene.projectionKind,
          pixelRatio,
        );
        const positionData = [];
        const uvData = [];

        for (let latitude = -90; latitude < 90; latitude += latStep) {
          const nextLatitude = Math.min(latitude + latStep, 90);

          for (let longitude = -180; longitude < 180; longitude += lonStep) {
            const nextLongitude = Math.min(longitude + lonStep, 180);
            const topLeft = projectGridPoint(projection, longitude, latitude, pixelRatio);
            const topRight = projectGridPoint(projection, nextLongitude, latitude, pixelRatio);
            const bottomLeft = projectGridPoint(projection, longitude, nextLatitude, pixelRatio);
            const bottomRight = projectGridPoint(projection, nextLongitude, nextLatitude, pixelRatio);

            if (!shouldSkipTriangle(
              projection,
              topLeft,
              topRight,
              bottomRight,
              edgeLimit * pixelRatio,
              seamTolerance,
              pixelRatio,
            )) {
              pushTriangle(positionData, uvData, topLeft, topRight, bottomRight);
            }

            if (!shouldSkipTriangle(
              projection,
              topLeft,
              bottomRight,
              bottomLeft,
              edgeLimit * pixelRatio,
              seamTolerance,
              pixelRatio,
            )) {
              pushTriangle(positionData, uvData, topLeft, bottomRight, bottomLeft);
            }
          }
        }

        const mesh = {
          positions: new Float32Array(positionData),
          uvs: new Float32Array(uvData),
          vertexCount: positionData.length / 2,
        };
        meshCache.set(cacheKey, mesh);
        return mesh;
      }

      function resize(width, height) {
        if (canvasElement.width === width && canvasElement.height === height) {
          return;
        }

        canvasElement.width = width;
        canvasElement.height = height;
        gl.viewport(0, 0, width, height);
      }

      function prepare({ scene, image, pixelRatio }) {
        if (!image) {
          return null;
        }

        resize(
          Math.round((scene.width ?? window.AtlasCore.VIEW_WIDTH) * pixelRatio),
          Math.round((scene.height ?? window.AtlasCore.VIEW_HEIGHT) * pixelRatio),
        );
        setTexture(image);
        const mesh = buildProjectedMesh(scene, pixelRatio);
        if (!mesh.vertexCount) {
          return null;
        }

        return mesh;
      }

      function render({ scene, image, pixelRatio, allowSyncBuild = true }) {
        if (!image) {
          return null;
        }

        if (!allowSyncBuild && !hasMesh(scene, pixelRatio)) {
          return null;
        }

        const mesh = prepare({ scene, image, pixelRatio });
        if (!mesh) {
          return null;
        }

        gl.viewport(0, 0, canvasElement.width, canvasElement.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.uniform2f(viewSizeLocation, canvasElement.width, canvasElement.height);
        gl.uniform1f(zoomScaleLocation, scene.zoomScale ?? 1);
        gl.uniform2f(
          panOffsetLocation,
          (scene.panOffset?.x ?? 0) * pixelRatio,
          (scene.panOffset?.y ?? 0) * pixelRatio,
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(uvLocation);
        gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
        return canvasElement;
      }

      return {
        hasMesh,
        prepare,
        render,
        resize,
        setTexture,
      };
    } catch (error) {
      console.error("Flat WebGL renderer initialization failed; falling back to CPU overlay.", error);
      return {
        render() {
          return null;
        },
        resize() {},
        setTexture() {},
      };
    }
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Failed to link WebGL program.");
    }

    return program;
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Failed to compile shader.");
    }

    return shader;
  }

  window.AtlasEarth = {
    createFlatMapRenderer,
    createGlobeRenderer,
  };
})();
