(() => {
  function createMapGestureController() {
    const activeGesturePointers = new Map();
    let isPinchZooming = false;
    let pinchDistance = null;
    let lastTapTimestamp = 0;
    let lastTapPosition = null;
    let doubleTapHoldState = null;

    function getPointerDistance(pointerA, pointerB) {
      return Math.hypot(pointerA.clientX - pointerB.clientX, pointerA.clientY - pointerB.clientY);
    }

    function handleDoubleTapPointerStart(event, { mobileLayerMenuMediaQuery, canZoomCurrentProjection, getZoomScale }) {
      if (!mobileLayerMenuMediaQuery.matches || !canZoomCurrentProjection()) {
        return false;
      }

      const now = Date.now();
      const tapPosition = { x: event.clientX, y: event.clientY };
      const isDoubleTap = now - lastTapTimestamp < 280
        && lastTapPosition
        && Math.hypot(tapPosition.x - lastTapPosition.x, tapPosition.y - lastTapPosition.y) < 32;

      lastTapTimestamp = now;
      lastTapPosition = tapPosition;

      if (!isDoubleTap) {
        doubleTapHoldState = null;
        return false;
      }

      event.preventDefault();
      doubleTapHoldState = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startScale: getZoomScale(),
        activated: false,
      };
      return true;
    }

    function handleDoubleTapPointerMove(event, { setZoomScale }) {
      if (!doubleTapHoldState || doubleTapHoldState.pointerId !== event.pointerId) {
        return false;
      }

      const deltaY = event.clientY - doubleTapHoldState.startY;
      if (!doubleTapHoldState.activated && Math.abs(deltaY) < 8) {
        return true;
      }

      event.preventDefault();
      doubleTapHoldState.activated = true;
      setZoomScale(doubleTapHoldState.startScale * Math.exp(deltaY * 0.0075));
      return true;
    }

    function handleDoubleTapPointerEnd(pointerId, { adjustZoomBy }) {
      if (!doubleTapHoldState || doubleTapHoldState.pointerId !== pointerId) {
        return;
      }

      const wasActivated = doubleTapHoldState.activated;
      doubleTapHoldState = null;

      if (!wasActivated) {
        adjustZoomBy(1.6);
      }
    }

    function enableDragging({
      stage,
      d3,
      isWithinMonthControls,
      getSelectedProjection,
      usesFlatProjectionPan,
      getZoomScale,
      onFlatPan,
      onRotate,
    }) {
      d3.select(stage).call(
        d3
          .drag()
          .filter((event) => {
            const sourceEvent = event.sourceEvent;
            if (isPinchZooming || doubleTapHoldState) {
              return false;
            }

            if (isWithinMonthControls(sourceEvent?.target)) {
              return false;
            }

            if (sourceEvent?.touches && sourceEvent.touches.length > 1) {
              return false;
            }

            return true;
          })
          .on("drag", (event) => {
            if (isPinchZooming || doubleTapHoldState) {
              return;
            }

            if (
              getSelectedProjection() === "dymaxion" ||
              (usesFlatProjectionPan() && getZoomScale() <= 1.01)
            ) {
              return;
            }

            if (usesFlatProjectionPan()) {
              onFlatPan(event);
              return;
            }

            onRotate(event);
          }),
      );
    }

    function enableZoomControls({
      documentTarget,
      mobileLayerMenuMediaQuery,
      canZoomCurrentProjection,
      isWithinInteractiveUi,
      getZoomScale,
      setZoomScale,
      adjustZoomBy,
    }) {
      documentTarget.addEventListener(
        "wheel",
        (event) => {
          if (!canZoomCurrentProjection()) {
            return;
          }

          if (isWithinInteractiveUi(event.target)) {
            return;
          }

          event.preventDefault();
          const delta = Math.exp(-event.deltaY * 0.0015);
          adjustZoomBy(delta);
        },
        { passive: false },
      );

      const syncPinchState = () => {
        if (activeGesturePointers.size < 2) {
          isPinchZooming = false;
          pinchDistance = null;
          return;
        }

        const [pointerA, pointerB] = Array.from(activeGesturePointers.values());
        const nextDistance = getPointerDistance(pointerA, pointerB);
        if (!Number.isFinite(nextDistance) || nextDistance <= 0) {
          return;
        }

        if (!isPinchZooming || !pinchDistance) {
          isPinchZooming = true;
          pinchDistance = nextDistance;
          return;
        }

        setZoomScale(getZoomScale() * (nextDistance / pinchDistance));
        pinchDistance = nextDistance;
      };

      documentTarget.addEventListener("pointerdown", (event) => {
        if (!canZoomCurrentProjection()) {
          return;
        }

        if (event.pointerType !== "touch" && event.pointerType !== "pen") {
          return;
        }

        if (isWithinInteractiveUi(event.target)) {
          return;
        }

        activeGesturePointers.set(event.pointerId, {
          pointerId: event.pointerId,
          clientX: event.clientX,
          clientY: event.clientY,
        });

        if (activeGesturePointers.size === 1) {
          handleDoubleTapPointerStart(event, {
            mobileLayerMenuMediaQuery,
            canZoomCurrentProjection,
            getZoomScale,
          });
          return;
        }

        doubleTapHoldState = null;
        event.preventDefault();
        syncPinchState();
      }, { passive: false });

      documentTarget.addEventListener("pointermove", (event) => {
        if (!activeGesturePointers.has(event.pointerId)) {
          return;
        }

        activeGesturePointers.set(event.pointerId, {
          pointerId: event.pointerId,
          clientX: event.clientX,
          clientY: event.clientY,
        });

        if (handleDoubleTapPointerMove(event, { setZoomScale })) {
          return;
        }

        if (activeGesturePointers.size < 2) {
          return;
        }

        event.preventDefault();
        syncPinchState();
      }, { passive: false });

      const releasePointer = (event) => {
        handleDoubleTapPointerEnd(event.pointerId, { adjustZoomBy });
        activeGesturePointers.delete(event.pointerId);

        if (activeGesturePointers.size < 2) {
          isPinchZooming = false;
          pinchDistance = null;
        } else {
          syncPinchState();
        }
      };

      documentTarget.addEventListener("pointerup", releasePointer, { passive: true });
      documentTarget.addEventListener("pointercancel", (event) => {
        doubleTapHoldState = null;
        activeGesturePointers.delete(event.pointerId);
        if (activeGesturePointers.size < 2) {
          isPinchZooming = false;
          pinchDistance = null;
        }
      }, { passive: true });
    }

    return {
      enableDragging,
      enableZoomControls,
    };
  }

  function createProjectionSwitcherController() {
    let projectionSwipeStartX = null;
    let projectionSwipeStartTime = 0;
    let projectionSwipePointerId = null;
    let projectionSwipeDeltaX = 0;
    let projectionSwipeAnimating = false;
    let projectionSwipeSettleTimer = null;
    let suppressNextClick = false;
    let suppressNextClickResetTimer = null;

    function bind({
      projectionSwitcher,
      projectionSwitcherTrack,
      renderProjectionSwitcher,
      getProjectionSlotWidth,
      cycleProjection,
      debugLog,
      setDebugMode,
      getDebugTargetLabel,
    }) {
      if (!projectionSwitcher || !projectionSwitcherTrack) {
        return;
      }

      const useTouchProjectionSwipe = !window.PointerEvent || /firefox/i.test(navigator.userAgent);
      setDebugMode?.(useTouchProjectionSwipe ? "touch" : "pointer");

      const startProjectionSwipe = (clientX, pointerId = null) => {
        if (projectionSwipeAnimating) {
          debugLog?.("start blocked animating");
          return false;
        }

        projectionSwipePointerId = pointerId;
        projectionSwipeStartX = clientX;
        projectionSwipeStartTime = performance.now();
        projectionSwipeDeltaX = 0;
        projectionSwitcher.classList.add("is-dragging");
        renderProjectionSwitcher(0);
        debugLog?.(`start x=${Math.round(clientX)} pointer=${pointerId ?? "touch"}`);
        return true;
      };

      const moveProjectionSwipe = (clientX, pointerId = null) => {
        if (projectionSwipeStartX === null) {
          debugLog?.("move ignored no-start");
          return false;
        }

        if (projectionSwipePointerId !== null && projectionSwipePointerId !== pointerId) {
          debugLog?.(`move ignored pointer=${pointerId}`);
          return false;
        }

        projectionSwipeDeltaX = clientX - projectionSwipeStartX;
        renderProjectionSwitcher(projectionSwipeDeltaX);
        debugLog?.(`move dx=${Math.round(projectionSwipeDeltaX)}`);
        return true;
      };

      const endProjectionSwipe = () => {
        if (projectionSwipeStartX === null) {
          debugLog?.("end ignored no-start");
          return false;
        }

        projectionSwipeStartX = null;
        projectionSwipePointerId = null;
        projectionSwitcher.classList.remove("is-dragging");
        const slotWidth = getProjectionSlotWidth();
        const elapsedMs = Math.max(1, performance.now() - projectionSwipeStartTime);
        const velocityX = projectionSwipeDeltaX / elapsedMs;
        const flickDirection = Math.abs(velocityX) > 0.3
          ? (velocityX > 0 ? 1 : -1)
          : 0;
        const steps = flickDirection !== 0
          ? flickDirection
          : Math.round(projectionSwipeDeltaX / slotWidth);

        if (Math.abs(projectionSwipeDeltaX) < 32 || steps === 0) {
          renderProjectionSwitcher(0);
          projectionSwipeDeltaX = 0;
          projectionSwipeStartTime = 0;
          debugLog?.("end tap");
          return true;
        }

        projectionSwipeAnimating = true;
        suppressNextClick = true;
        debugLog?.("suppress=true");
        if (suppressNextClickResetTimer !== null) {
          window.clearTimeout(suppressNextClickResetTimer);
        }
        suppressNextClickResetTimer = window.setTimeout(() => {
          suppressNextClick = false;
          suppressNextClickResetTimer = null;
          debugLog?.("suppress timeout reset");
        }, 220);
        projectionSwitcher.classList.add("is-settling");
        renderProjectionSwitcher(steps * slotWidth);
        debugLog?.(`end swipe steps=${steps}`);
        if (projectionSwipeSettleTimer !== null) {
          window.clearTimeout(projectionSwipeSettleTimer);
        }
        projectionSwipeSettleTimer = window.setTimeout(() => {
          projectionSwipeSettleTimer = null;
          projectionSwitcher.classList.remove("is-settling");
          cycleProjection(-steps);
          projectionSwipeAnimating = false;
        }, 140);
        projectionSwipeDeltaX = 0;
        projectionSwipeStartTime = 0;
        return true;
      };

      const cancelProjectionSwipe = () => {
        if (projectionSwipeSettleTimer !== null) {
          window.clearTimeout(projectionSwipeSettleTimer);
          projectionSwipeSettleTimer = null;
        }
        if (suppressNextClickResetTimer !== null) {
          window.clearTimeout(suppressNextClickResetTimer);
          suppressNextClickResetTimer = null;
        }
        debugLog?.("cancel resets suppress");

        projectionSwipeAnimating = false;
        projectionSwipeStartX = null;
        projectionSwipeStartTime = 0;
        projectionSwipePointerId = null;
        projectionSwipeDeltaX = 0;
        projectionSwitcher.classList.remove("is-dragging");
        projectionSwitcher.classList.remove("is-settling");
        renderProjectionSwitcher(0);
        debugLog?.("cancel");
      };

      projectionSwitcher.addEventListener("pointerdown", (event) => {
        if (useTouchProjectionSwipe) {
          debugLog?.("pointerdown ignored touch-mode");
          return;
        }

        debugLog?.(`pointerdown type=${event.pointerType} id=${event.pointerId} target=${getDebugTargetLabel?.(event.target) ?? "unknown"}`);
        if (!startProjectionSwipe(event.clientX, event.pointerId)) {
          return;
        }

        projectionSwitcher.setPointerCapture(event.pointerId);
      });

      projectionSwitcher.addEventListener("pointermove", (event) => {
        if (useTouchProjectionSwipe) {
          debugLog?.("pointermove ignored touch-mode");
          return;
        }

        moveProjectionSwipe(event.clientX, event.pointerId);
      });

      projectionSwitcher.addEventListener("pointerup", (event) => {
        if (useTouchProjectionSwipe) {
          debugLog?.("pointerup ignored touch-mode");
          return;
        }

        if (projectionSwipePointerId !== event.pointerId) {
          debugLog?.(`pointerup mismatched id=${event.pointerId}`);
          return;
        }

        debugLog?.(`pointerup id=${event.pointerId} target=${getDebugTargetLabel?.(event.target) ?? "unknown"}`);
        endProjectionSwipe();

        if (projectionSwitcher.hasPointerCapture?.(event.pointerId)) {
          projectionSwitcher.releasePointerCapture(event.pointerId);
        }
      });

      projectionSwitcher.addEventListener("pointercancel", cancelProjectionSwipe);

      projectionSwitcher.addEventListener("lostpointercapture", () => {
        if (projectionSwipeStartX !== null && !projectionSwipeAnimating) {
          cancelProjectionSwipe();
        }
      });

      projectionSwitcher.addEventListener("touchstart", (event) => {
        if (!useTouchProjectionSwipe) {
          debugLog?.("touchstart ignored pointer-mode");
          return;
        }

        if (event.touches.length !== 1) {
          debugLog?.(`touchstart ignored touches=${event.touches.length}`);
          return;
        }

        debugLog?.(`touchstart target=${getDebugTargetLabel?.(event.target) ?? "unknown"}`);
        if (!startProjectionSwipe(event.touches[0].clientX)) {
          return;
        }

        event.preventDefault();
      }, { passive: false });

      projectionSwitcher.addEventListener("touchmove", (event) => {
        if (!useTouchProjectionSwipe) {
          debugLog?.("touchmove ignored pointer-mode");
          return;
        }

        if (event.touches.length !== 1) {
          debugLog?.(`touchmove ignored touches=${event.touches.length}`);
          return;
        }

        if (!moveProjectionSwipe(event.touches[0].clientX)) {
          return;
        }

        event.preventDefault();
      }, { passive: false });

      projectionSwitcher.addEventListener("touchend", () => {
        if (!useTouchProjectionSwipe) {
          debugLog?.("touchend ignored pointer-mode");
          return;
        }

        debugLog?.("touchend");
        endProjectionSwipe();
      }, { passive: true });

      projectionSwitcher.addEventListener("touchcancel", () => {
        if (!useTouchProjectionSwipe) {
          return;
        }

        if (!projectionSwipeAnimating) {
          cancelProjectionSwipe();
        }
      }, { passive: true });

      projectionSwitcher.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          debugLog?.(`keydown ${event.key}`);
        }
      });

      projectionSwitcher.addEventListener("click", (event) => {
        debugLog?.(`click gesture suppress=${suppressNextClick} animating=${projectionSwipeAnimating}`);
        if (suppressNextClick) {
          suppressNextClick = false;
          if (suppressNextClickResetTimer !== null) {
            window.clearTimeout(suppressNextClickResetTimer);
            suppressNextClickResetTimer = null;
          }
          debugLog?.("click consumed by suppress");
          return;
        }
      });
    }

    return {
      bind,
    };
  }

  window.AtlasGestures = {
    createMapGestureController,
    createProjectionSwitcherController,
  };
})();
