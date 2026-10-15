import { useEffect } from 'react';
import { wsService } from '../services/ws';

const PC_MIDP_MAP = {
  // Phím điều hướng D-pad (Mũi tên & WASD) -> MIDP UP(-1), DOWN(-2), LEFT(-3), RIGHT(-4)
  'ArrowUp': -1, 'KeyW': -1,
  'ArrowDown': -2, 'KeyS': -2,
  'ArrowLeft': -3, 'KeyA': -3,
  'ArrowRight': -4, 'KeyD': -4,

  // Phím chọn / Tấn công / OK (Enter, Space, J) -> MIDP FIRE(-5)
  'Enter': -5, 'Space': -5, 'NumpadEnter': -5, 'KeyJ': -5,

  // Phím mềm Menu (Trái: F1, Q, U) & Trở về (Phải: F2, E, I, Esc) -> SOFT_L(-6), SOFT_R(-7)
  'F1': -6, 'KeyQ': -6, 'KeyU': -6,
  'F2': -7, 'KeyE': -7, 'KeyI': -7, 'Escape': -7,

  // Hàng số & Numpad 0-9 -> ASCII 48-57
  'Digit0': 48, 'Digit1': 49, 'Digit2': 50, 'Digit3': 51, 'Digit4': 52,
  'Digit5': 53, 'Digit6': 54, 'Digit7': 55, 'Digit8': 56, 'Digit9': 57,
  'Numpad0': 48, 'Numpad1': 49, 'Numpad2': 50, 'Numpad3': 51, 'Numpad4': 52,
  'Numpad5': 53, 'Numpad6': 54, 'Numpad7': 55, 'Numpad8': 56, 'Numpad9': 57,
  '0': 48, '1': 49, '2': 50, '3': 51, '4': 52, '5': 53, '6': 54, '7': 55, '8': 56, '9': 57,

  // Ký tự sao (*) và thăng (#)
  'KeyX': 42, '*': 42,
  'KeyC': 35, '#': 35,
};

const PC_KEY_MAP = {
  'Digit0': 'NUM0', 'Digit1': 'NUM1', 'Digit2': 'NUM2', 'Digit3': 'NUM3', 'Digit4': 'NUM4',
  'Digit5': 'NUM5', 'Digit6': 'NUM6', 'Digit7': 'NUM7', 'Digit8': 'NUM8', 'Digit9': 'NUM9',
  'Numpad0': 'NUM0', 'Numpad1': 'NUM1', 'Numpad2': 'NUM2', 'Numpad3': 'NUM3', 'Numpad4': 'NUM4',
  'Numpad5': 'NUM5', 'Numpad6': 'NUM6', 'Numpad7': 'NUM7', 'Numpad8': 'NUM8', 'Numpad9': 'NUM9',
  'ArrowUp': 'UP', 'KeyW': 'UP',
  'ArrowDown': 'DOWN', 'KeyS': 'DOWN',
  'ArrowLeft': 'LEFT', 'KeyA': 'LEFT',
  'ArrowRight': 'RIGHT', 'KeyD': 'RIGHT',
  'Enter': 'OK', 'Space': 'OK', 'NumpadEnter': 'OK', 'KeyJ': 'OK',
  'F1': 'SOFT_LEFT', 'KeyQ': 'SOFT_LEFT', 'KeyU': 'SOFT_LEFT',
  'F2': 'SOFT_RIGHT', 'KeyE': 'SOFT_RIGHT', 'KeyI': 'SOFT_RIGHT', 'Escape': 'SOFT_RIGHT',
  'Backspace': 'BACKSPACE',
  'KeyX': 'STAR', '*': 'STAR',
  'KeyC': 'POUND', '#': 'POUND'
};

export function useKeyboard(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const pressedKeys = new Set();

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const mappedKey = PC_KEY_MAP[e.code] || PC_KEY_MAP[e.key];
      const midpCode = PC_MIDP_MAP[e.code] ?? PC_MIDP_MAP[e.key];

      if (mappedKey || midpCode !== undefined) {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }

        const keyId = mappedKey || String(midpCode);
        if (!pressedKeys.has(keyId)) {
          pressedKeys.add(keyId);
          if (midpCode !== undefined) wsService.sendMidpKey(midpCode, true);
          if (mappedKey) wsService.sendKey(mappedKey, 'KEY_DOWN');
        }
      }
    };

    const handleKeyUp = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const mappedKey = PC_KEY_MAP[e.code] || PC_KEY_MAP[e.key];
      const midpCode = PC_MIDP_MAP[e.code] ?? PC_MIDP_MAP[e.key];

      if (mappedKey || midpCode !== undefined) {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }

        const keyId = mappedKey || String(midpCode);
        pressedKeys.delete(keyId);
        if (midpCode !== undefined) wsService.sendMidpKey(midpCode, false);
        if (mappedKey) wsService.sendKey(mappedKey, 'KEY_UP');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);
}
