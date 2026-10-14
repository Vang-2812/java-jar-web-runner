import { useEffect } from 'react';
import { wsService } from '../services/ws';

const PC_KEY_MAP = {
  // Phím số
  '0': 'NUM0', '1': 'NUM1', '2': 'NUM2', '3': 'NUM3', '4': 'NUM4',
  '5': 'NUM5', '6': 'NUM6', '7': 'NUM7', '8': 'NUM8', '9': 'NUM9',
  'Numpad0': 'NUM0', 'Numpad1': 'NUM1', 'Numpad2': 'NUM2', 'Numpad3': 'NUM3',
  'Numpad4': 'NUM4', 'Numpad5': 'NUM5', 'Numpad6': 'NUM6', 'Numpad7': 'NUM7',
  'Numpad8': 'NUM8', 'Numpad9': 'NUM9',
  
  // Phím điều hướng
  'ArrowUp': 'UP', 'KeyW': 'UP',
  'ArrowDown': 'DOWN', 'KeyS': 'DOWN',
  'ArrowLeft': 'LEFT', 'KeyA': 'LEFT',
  'ArrowRight': 'RIGHT', 'KeyD': 'RIGHT',
  'Enter': 'OK', 'Space': 'OK', 'NumpadEnter': 'OK',

  // Phím mềm và phím đặc biệt
  'F1': 'SOFT_LEFT', 'KeyQ': 'SOFT_LEFT',
  'F2': 'SOFT_RIGHT', 'KeyE': 'SOFT_RIGHT',
  'KeyX': 'STAR', '*': 'STAR',
  'KeyC': 'POUND', '#': 'POUND'
};

export function useKeyboard(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const pressedKeys = new Set();

    const handleKeyDown = (e) => {
      // Bỏ qua nếu người dùng đang nhập vào ô input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const mappedKey = PC_KEY_MAP[e.code] || PC_KEY_MAP[e.key];
      if (mappedKey) {
        e.preventDefault();
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
        e.preventDefault();
        pressedKeys.delete(mappedKey);
        wsService.sendKey(mappedKey, 'KEY_UP');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);
}
