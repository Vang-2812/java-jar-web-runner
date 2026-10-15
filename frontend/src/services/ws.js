import { getBackendUrl } from './api';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.onFrameCallback = null;
    this.onBinaryCommandCallback = null;
    this.onStatusCallback = null;
    this.onConnectionChange = null;
    this.isConnected = false;
  }

  connect(onFrame, onStatus, onConn, onBinaryCommand) {
    this.onFrameCallback = onFrame;
    this.onStatusCallback = onStatus;
    this.onConnectionChange = onConn;
    this.onBinaryCommandCallback = onBinaryCommand;

    const httpUrl = getBackendUrl();
    const wsUrl = httpUrl.replace(/^http/, 'ws') + '/ws';

    try {
      if (this.ws) {
        this.ws.close();
      }

      this.ws = new WebSocket(wsUrl);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.onConnectionChange) this.onConnectionChange(true);
      };

      this.ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          try {
            const json = JSON.parse(event.data);
            if (this.onStatusCallback) this.onStatusCallback(json);
          } catch (e) {}
        } else if (event.data instanceof ArrayBuffer) {
          const u8 = new Uint8Array(event.data);
          const type = u8[0];

          // Type 4 (Compressed CMD Frame), Type 5 (DEF Image Sprite), Type 3 (Raw CMD)
          if ((type === 4 || type === 5 || type === 3) && this.onBinaryCommandCallback) {
            this.onBinaryCommandCallback(event.data);
          } else {
            // Chế độ fallback: frame JPEG thông thường
            const blob = new Blob([event.data], { type: 'image/jpeg' });
            if (this.onFrameCallback) this.onFrameCallback(blob);
          }
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.onConnectionChange) this.onConnectionChange(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        if (this.onConnectionChange) this.onConnectionChange(false);
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.onFrameCallback, this.onStatusCallback, this.onConnectionChange, this.onBinaryCommandCallback);
    }, 3000);
  }

  // Gửi mã phím chuẩn MIDP trực tiếp vào Game Loop
  sendMidpKey(code, pressed) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'KEY',
        code: Number(code),
        pressed: !!pressed,
        timestamp: Date.now()
      }));
    }
  }

  sendKey(keyName, action = 'KEY_DOWN') {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: action,
        key: keyName,
        timestamp: Date.now()
      }));
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const wsService = new WebSocketService();
