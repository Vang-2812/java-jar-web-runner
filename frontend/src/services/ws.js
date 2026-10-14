import { getBackendUrl } from './api';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.onFrameCallback = null;
    this.onStatusCallback = null;
    this.onConnectionChange = null;
    this.isConnected = false;
  }

  connect(onFrame, onStatus, onConn) {
    this.onFrameCallback = onFrame;
    this.onStatusCallback = onStatus;
    this.onConnectionChange = onConn;

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
          // Frame hình ảnh nhị phân từ backend
          const blob = new Blob([event.data], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          if (this.onFrameCallback) this.onFrameCallback(url);
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
      this.connect(this.onFrameCallback, this.onStatusCallback, this.onConnectionChange);
    }, 3000);
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
