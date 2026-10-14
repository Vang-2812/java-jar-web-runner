const { WebSocketServer } = require('ws');
const { exec } = require('child_process');
const { ScreenCapture } = require('./screenCapture');

const KEY_MAPPINGS = {
  // Bàn phím số J2ME
  'NUM0': '0', 'NUM1': '1', 'NUM2': '2', 'NUM3': '3', 'NUM4': '4',
  'NUM5': '5', 'NUM6': '6', 'NUM7': '7', 'NUM8': '8', 'NUM9': '9',
  'STAR': 'asterisk', 'POUND': 'numbersign',
  
  // Phím điều hướng D-pad
  'UP': 'Up', 'DOWN': 'Down', 'LEFT': 'Left', 'RIGHT': 'Right', 'OK': 'Return',
  
  // Phím mềm Nokia
  'SOFT_LEFT': 'F1', 'SOFT_RIGHT': 'F2',
  'CALL': 'c', 'END': 'Escape'
};

function setupWebSocket(server, pm) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const capturer = new ScreenCapture();
  let streamInterval = null;

  const startStream = () => {
    if (streamInterval) return;
    pm.log('Có client kết nối web - Bắt đầu stream màn hình game.');

    streamInterval = setInterval(async () => {
      if (wss.clients.size === 0) {
        stopStream();
        return;
      }

      // Chỉ chụp màn hình khi đang có game chạy hoặc để hiển thị trạng thái
      const frameBuffer = await capturer.captureFrame();
      if (frameBuffer) {
        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // 1 = OPEN
            client.send(frameBuffer);
          }
        });
      }
    }, 150); // ~6.6 FPS: Vừa đủ mượt để quan sát vừa tiết kiệm băng thông và CPU
  };

  const stopStream = () => {
    if (streamInterval) {
      clearInterval(streamInterval);
      streamInterval = null;
      pm.log('Không còn client web nào - Tạm dừng stream màn hình (Treo game ngầm tối ưu 100% CPU).');
    }
  };

  wss.on('connection', (ws) => {
    startStream();

    // Gửi ngay trạng thái ban đầu cho client vừa vào
    ws.send(JSON.stringify({
      type: 'INIT_STATUS',
      data: pm.getStatus()
    }));

    ws.on('message', (message) => {
      try {
        const text = message.toString();
        const data = JSON.parse(text);

        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          return;
        }

        if (data.type === 'KEY_DOWN' && KEY_MAPPINGS[data.key]) {
          const xKey = KEY_MAPPINGS[data.key];
          if (process.platform === 'linux') {
            exec(`DISPLAY=:99 xdotool keydown ${xKey}`);
          }
        } else if (data.type === 'KEY_UP' && KEY_MAPPINGS[data.key]) {
          const xKey = KEY_MAPPINGS[data.key];
          if (process.platform === 'linux') {
            exec(`DISPLAY=:99 xdotool keyup ${xKey}`);
          }
        }
      } catch (err) {
        // Bỏ qua frame không hợp lệ
      }
    });

    ws.on('close', () => {
      if (wss.clients.size === 0) {
        stopStream();
      }
    });

    ws.on('error', (err) => {
      console.error('Lỗi kết nối WebSocket client:', err.message);
    });
  });

  return { wss, startStream, stopStream };
}

module.exports = { setupWebSocket, KEY_MAPPINGS };
