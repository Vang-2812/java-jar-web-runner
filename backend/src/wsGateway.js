const { WebSocketServer } = require('ws');
const { exec } = require('child_process');
const net = require('net');
const { packCmdFrame, packDefFrame } = require('./commandProtocol');
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
  'CALL': 'c', 'END': 'Escape',
  'BACKSPACE': 'BackSpace'
};

// Mã phím chuẩn MIDP của J2ME (khớp với Canvas.java / KeyMapper.java)
const MIDP_KEY_CODES = {
  'UP': -1,
  'DOWN': -2,
  'LEFT': -3,
  'RIGHT': -4,
  'OK': -5,
  'FIRE': -5,
  'SOFT_LEFT': -6,
  'SOFT_RIGHT': -7,
  'STAR': 42,
  'POUND': 35,
  'NUM0': 48,
  'NUM1': 49,
  'NUM2': 50,
  'NUM3': 51,
  'NUM4': 52,
  'NUM5': 53,
  'NUM6': 54,
  'NUM7': 55,
  'NUM8': 56,
  'NUM9': 57
};

function setupWebSocket(server, pm) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const capturer = new ScreenCapture();
  
  let javaSocket = null;
  const defCache = new Map(); // Lưu trữ hình ảnh sprite đã định nghĩa (DEF Type 5)
  let isStreaming = false;
  let fallbackTimer = null;
  let hasReceivedJavaFrames = false;

  // Khởi tạo TCP Server lắng nghe kết nối nội bộ từ tiến trình Java CanvasStreamDriver
  const tcpServer = net.createServer((socket) => {
    pm.log('🎯 [Java Driver] Tiến trình Java đã kết nối thành công tới CanvasStream TCP Bridge (Cổng 9091)!');
    javaSocket = socket;
    socket.setNoDelay(true);

    let buffer = Buffer.alloc(0);

    socket.on('data', (chunk) => {
      hasReceivedJavaFrames = true;
      buffer = Buffer.concat([buffer, chunk]);

      // Xử lý gói tin nhị phân từ Java
      while (buffer.length > 0) {
        const type = buffer[0];

        if (type === 5) { // DEF Type: Định nghĩa ảnh
          if (buffer.length < 13) break; // Cần ít nhất header DEF
          const id = buffer.readInt32BE(1);
          const w = buffer.readUInt16BE(5);
          const h = buffer.readUInt16BE(7);
          const pngLen = buffer.readUInt32BE(9);
          if (buffer.length < 13 + pngLen) break; // Chưa đủ dữ liệu ảnh PNG

          const pngBytes = buffer.subarray(13, 13 + pngLen);
          const defPacket = packDefFrame(id, w, h, pngBytes);
          defCache.set(id, defPacket);

          // Phát tới các client web đang xem
          broadcastBinary(defPacket);

          buffer = buffer.subarray(13 + pngLen);
        } else if (type === 3) { // CMD Type: Lệnh vẽ của frame
          if (buffer.length < 17) break;
          const w = buffer.readUInt16BE(1);
          const h = buffer.readUInt16BE(3);
          const clipX = buffer.readUInt16BE(5);
          const clipY = buffer.readUInt16BE(7);
          const clipW = buffer.readUInt16BE(9);
          const clipH = buffer.readUInt16BE(11);
          const cmdLen = buffer.readUInt32BE(13);
          if (buffer.length < 17 + cmdLen) break;

          const commandsBytes = buffer.subarray(17, 17 + cmdLen);
          
          // Chỉ nén và gửi nếu có client đang mở web xem (Tiết kiệm CPU = 0% khi tắt web)
          if (wss.clients.size > 0 && isStreaming) {
            broadcastCmdFrame(w, h, clipX, clipY, clipW, clipH, commandsBytes);
          }

          buffer = buffer.subarray(17 + cmdLen);
        } else {
          // Bỏ byte không hợp lệ để tránh deadlock
          buffer = buffer.subarray(1);
        }
      }
    });

    socket.on('close', () => {
      pm.log('[Java Driver] Ngắt kết nối socket từ Java.');
      if (javaSocket === socket) javaSocket = null;
    });

    socket.on('error', (err) => {
      pm.log(`[Java Driver] Lỗi socket: ${err.message}`);
    });
  });

  tcpServer.listen(9091, '127.0.0.1', () => {
    pm.log('🚀 CanvasStream TCP Server đang lắng nghe tại 127.0.0.1:9091');
  });
  tcpServer.unref();

  // Phát gói tin nhị phân tới tất cả WebSocket client
  const broadcastBinary = (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 = OPEN
        client.send(data);
      }
    });
  };

  // Nén và phát khung lệnh vẽ (Type 4)
  const broadcastCmdFrame = (w, h, clipX, clipY, clipW, clipH, commandsBytes) => {
    try {
      const packet = packCmdFrame(1, w, h, clipX, clipY, clipW, clipH, commandsBytes);
      broadcastBinary(packet);
    } catch (e) {
      // lỗi nén bỏ qua
    }
  };

  // Fallback định kỳ chụp ảnh nếu Java Driver chưa nạp (chế độ dự phòng an toàn)
  const fallbackLoop = async () => {
    if (!isStreaming || wss.clients.size === 0) return;
    if (!hasReceivedJavaFrames) {
      try {
        const frameBuffer = await capturer.captureFrame();
        if (frameBuffer && isStreaming && !hasReceivedJavaFrames) {
          broadcastBinary(frameBuffer);
        }
      } catch (err) {}
      if (!hasReceivedJavaFrames && isStreaming) {
        fallbackTimer = setTimeout(fallbackLoop, 200);
      }
    }
  };

  const startStream = () => {
    if (isStreaming) return;
    isStreaming = true;
    pm.log('Có client kết nối web - Bắt đầu phát luồng đồ họa Canvas 60 FPS.');
    if (!hasReceivedJavaFrames) {
      fallbackLoop();
    }
  };

  const stopStream = () => {
    if (isStreaming) {
      isStreaming = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      pm.log('Không còn client web nào - Tạm dừng stream đồ họa (Giữ CPU 0.1% để treo máy 24/7).');
    }
  };

  // Gửi sự kiện phím trực tiếp vào Java
  const sendKeyToJava = (code, pressed) => {
    if (javaSocket && !javaSocket.destroyed) {
      try {
        const buf = Buffer.alloc(6);
        buf[0] = 1; // KEY Type
        buf.writeInt32BE(code, 1);
        buf[5] = pressed ? 1 : 0;
        javaSocket.write(buf);
        return true;
      } catch (e) {}
    }
    return false;
  };

  wss.on('connection', (ws) => {
    startStream();

    // Gửi ngay trạng thái ban đầu cho client
    ws.send(JSON.stringify({
      type: 'INIT_STATUS',
      data: pm.getStatus()
    }));

    // Gửi toàn bộ cache hình ảnh sprite (DEF) đã có cho client vừa vào
    if (defCache.size > 0) {
      for (const defBuf of defCache.values()) {
        ws.send(defBuf);
      }
    }

    ws.on('message', (message, isBinary) => {
      if (isBinary) return;

      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          return;
        }

        // Bắt sự kiện phím chuẩn MIDP
        if (data.type === 'KEY') {
          const code = Number(data.code);
          const pressed = !!data.pressed;
          sendKeyToJava(code, pressed);
          return;
        }

        // Phím từ các component cũ (KEY_DOWN / KEY_UP theo tên nút)
        if (data.type === 'KEY_DOWN' || data.type === 'KEY_UP') {
          const isPressed = data.type === 'KEY_DOWN';
          const midpCode = MIDP_KEY_CODES[data.key];
          
          let handled = false;
          if (midpCode !== undefined) {
            handled = sendKeyToJava(midpCode, isPressed);
          }

          // Fallback qua xdotool nếu Java socket chưa kết nối
          if (!handled && process.platform === 'linux' && KEY_MAPPINGS[data.key]) {
            const xKey = KEY_MAPPINGS[data.key];
            const action = isPressed ? 'keydown' : 'keyup';
            exec(`DISPLAY=:99 xdotool ${action} ${xKey}`, { timeout: 200 }, () => {});
          }
        }
      } catch (err) {}
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

  return { wss, tcpServer, broadcastCmdFrame, broadcastBinary, startStream, stopStream };
}

module.exports = { setupWebSocket, KEY_MAPPINGS, MIDP_KEY_CODES };
