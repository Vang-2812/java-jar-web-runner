import { useEffect } from 'react';
import { wsService } from '../services/ws';

const PC_KEY_MAP = {
  // Hàng số trên bàn phím chính (Digits)
  'Digit0': 'NUM0', 'Digit1': 'NUM1', 'Digit2': 'NUM2', 'Digit3': 'NUM3', 'Digit4': 'NUM4',
  'Digit5': 'NUM5', 'Digit6': 'NUM6', 'Digit7': 'NUM7', 'Digit8': 'NUM8', 'Digit9': 'NUM9',
  '0': 'NUM0', '1': 'NUM1', '2': 'NUM2', '3': 'NUM3', '4': 'NUM4',
  '5': 'NUM5', '6': 'NUM6', '7': 'NUM7', '8': 'NUM8', '9': 'NUM9',

  // Bàn phím số bên phải (Numpad)
  'Numpad0': 'NUM0', 'Numpad1': 'NUM1', 'Numpad2': 'NUM2', 'Numpad3': 'NUM3', 'Numpad4': 'NUM4',
  'Numpad5': 'NUM5', 'Numpad6': 'NUM6', 'Numpad7': 'NUM7', 'Numpad8': 'NUM8', 'Numpad9': 'NUM9',

  // Phím điều hướng D-pad (Mũi tên & WASD)
  'ArrowUp': 'UP', 'KeyW': 'UP',
  'ArrowDown': 'DOWN', 'KeyS': 'DOWN',
  'ArrowLeft': 'LEFT', 'KeyA': 'LEFT',
  'ArrowRight': 'RIGHT', 'KeyD': 'RIGHT',

  // Phím chọn / Tấn công / OK (Enter, Space, phím J)
  'Enter': 'OK', 'Space': 'OK', 'NumpadEnter': 'OK', 'KeyJ': 'OK',

  // Phím chức năng Menu (Trái) & Trở về (Phải)
  'F1': 'SOFT_LEFT', 'KeyQ': 'SOFT_LEFT', 'KeyU': 'SOFT_LEFT',
  'F2': 'SOFT_RIGHT', 'KeyE': 'SOFT_RIGHT', 'KeyI': 'SOFT_RIGHT', 'Escape': 'SOFT_RIGHT',

  // Phím xóa / lùi
  'Backspace': 'BACKSPACE',

  // Ký tự sao (*) và thăng (#)
  'KeyX': 'STAR', '*': 'STAR',
  'KeyC': 'POUND', '#': 'POUND'
};

export function useKeyboard(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const pressedKeys = new Set();

    const handleKeyDown = (e) => {
      // Bỏ qua nếu người dùng đang nhập vào ô input/textarea trên trang web
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const mappedKey = PC_KEY_MAP[e.code] || PC_KEY_MAP[e.key];
      if (mappedKey) {
        // Ngăn chặn cuộn trang đối với phím mũi tên và Space
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }

        if (!pressedKeys.has(mappedKey)) {
          pressedKeys.add(mappedKey);
          wsService.sendKey(mappedKey, 'KEY_DOWN');
        }
      }
    };

    const handleKeyUp = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const mappedKey = PC_KEY_MAP[e.code] || PC_KEY_MAP[e.key];
      if (mappedKey) {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }

        pressedKeys.delete(mappedKey);
        wsService.sendKey(mappedKey, 'KEY_UP');
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
