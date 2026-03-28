/**
 * Input Module
 * Handles keyboard, touch, and mobile controls
 */

class InputManager {
  constructor() {
    this.keys = {};
    this.mobileControlsEnabled = false;
    this.touchKeyPressCount = {
      ArrowLeft: 0,
      ArrowRight: 0,
      Space: 0,
    };
    this.activeTouchPointers = new Map();
    this.onPrimaryAction = null;
    this.onPauseToggle = null;
  }

  detectMobileBrowser() {
    return (
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    );
  }

  setKeyState(code, pressed) {
    this.keys[code] = pressed;
  }

  applyTouchKeyState(code) {
    this.setKeyState(code, this.touchKeyPressCount[code] > 0);
  }

  pressTouchKey(code, pointerId) {
    if (!this.touchKeyPressCount.hasOwnProperty(code)) return;
    if (this.activeTouchPointers.has(pointerId))
      this.releasePointerTouch(pointerId);
    this.activeTouchPointers.set(pointerId, code);
    this.touchKeyPressCount[code]++;
    this.applyTouchKeyState(code);
  }

  releasePointerTouch(pointerId) {
    const code = this.activeTouchPointers.get(pointerId);
    if (!code) return;
    this.activeTouchPointers.delete(pointerId);
    this.touchKeyPressCount[code] = Math.max(0, this.touchKeyPressCount[code] - 1);
    this.applyTouchKeyState(code);
  }

  releaseMobileKeys() {
    this.activeTouchPointers.clear();
    Object.keys(this.touchKeyPressCount).forEach((code) => {
      this.touchKeyPressCount[code] = 0;
      this.setKeyState(code, false);
    });
  }

  bindTouchControlButton(btn) {
    const key = btn.dataset.touchKey;

    const press = (e) => {
      if (e.cancelable) e.preventDefault();
      if (key === "Space" && this.onPrimaryAction) {
        this.onPrimaryAction();
      }
      if (typeof e.pointerId === "number") {
        this.pressTouchKey(key, e.pointerId);
      } else {
        this.pressTouchKey(key, e.touches?.[0]?.identifier || 0);
      }
    };

    const release = (e) => {
      if (e.cancelable) e.preventDefault();
      if (typeof e.pointerId === "number") {
        this.releasePointerTouch(e.pointerId);
      } else {
        this.releasePointerTouch(e.touches?.[0]?.identifier || 0);
      }
    };

    btn.addEventListener("pointerdown", press);
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointercancel", release);
    btn.addEventListener("pointerleave", release);
    btn.addEventListener("touchstart", press, { passive: false });
    btn.addEventListener("touchend", release, { passive: false });
    btn.addEventListener("touchcancel", release, { passive: false });
  }

  init(onPrimaryAction, onPauseToggle) {
    this.onPrimaryAction = onPrimaryAction;
    this.onPauseToggle = onPauseToggle;

    const controls = document.getElementById("mobile-controls");
    if (controls) {
      this.mobileControlsEnabled = this.detectMobileBrowser();
      const touchButtons = controls.querySelectorAll(".touch-btn");
      touchButtons.forEach((btn) => this.bindTouchControlButton(btn));

      if (this.mobileControlsEnabled)
        document.body.classList.add("mobile-controls-enabled");

      window.addEventListener(
        "touchstart",
        () => {
          this.mobileControlsEnabled = true;
          document.body.classList.add("mobile-controls-enabled");
        },
        { once: true, passive: true }
      );

      window.addEventListener("blur", () => this.releaseMobileKeys());
    }

    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      if (
        ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          e.code
        )
      ) {
        e.preventDefault();
      }
      if ((e.code === "KeyP" || e.code === "Escape") && this.onPauseToggle) {
        this.onPauseToggle();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener("pointerdown", () => {
      if (this.mobileControlsEnabled && this.onPrimaryAction) {
        this.onPrimaryAction();
      }
    });

    window.addEventListener(
      "touchstart",
      () => {
        if (this.onPrimaryAction) {
          this.onPrimaryAction();
        }
      },
      { passive: true }
    );
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = InputManager;
}
