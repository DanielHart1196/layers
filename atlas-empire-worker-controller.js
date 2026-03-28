(() => {
  function createEmpireWorkerController() {
    const worker = typeof Worker !== "undefined"
      ? new Worker("./atlas-empire-worker.js")
      : null;
    let requestId = 0;
    let latestSceneKey = null;
    let latestPreparedSceneKey = null;
    let latestPreparedPayload = null;
    const preparedSceneMap = new Map();
    let isReady = false;

    worker?.addEventListener("message", (event) => {
      const { type, payload } = event.data ?? {};
      if (type === "pong") {
        isReady = true;
        return;
      }

      if (type === "empire-scene-prepared") {
        if (payload?.sceneKey === latestSceneKey) {
          latestPreparedSceneKey = payload.sceneKey;
          latestPreparedPayload = payload;
        }
        if (payload?.sceneKey) {
          preparedSceneMap.set(payload.sceneKey, payload);
        }
      }
    });

    worker?.postMessage({ type: "ping" });

    function requestPrepare(sceneKey, empireEntries, sceneSnapshot, quality = "interactive") {
      latestSceneKey = sceneKey;
      if (!worker) {
        return;
      }

      requestId += 1;
      worker.postMessage({
        type: "prepare-empire-scene",
        payload: {
          requestId,
          sceneKey,
          empireEntries,
          sceneSnapshot,
          quality,
        },
      });
    }

    function dispose() {
      worker?.terminate();
    }

    return {
      dispose,
      isReady: () => isReady,
      getPreparedScene: (sceneKey) => preparedSceneMap.get(sceneKey) ?? null,
      latestPreparedSceneKey: () => latestPreparedSceneKey,
      latestPreparedPayload: () => latestPreparedPayload,
      requestPrepare,
    };
  }

  window.AtlasEmpireWorkerController = {
    createEmpireWorkerController,
  };
})();
