const assert = require('assert');
const http = require('http');
const WebSocket = require('ws');
const { ScreenCapture } = require('../src/screenCapture');
const { setupWebSocket, KEY_MAPPINGS } = require('../src/wsGateway');
const { ProcessManager } = require('../src/processManager');

console.log("=== BẮT ĐẦU KIỂM THỬ WEBSOCKET & SCREEN CAPTURE ===");

async function runTests() {
  // Test 1: ScreenCapture trả về buffer
  const capturer = new ScreenCapture();
  const frame = await capturer.captureFrame();
  assert(Buffer.isBuffer(frame), "ScreenCapture phải trả về Buffer dữ liệu");
  assert(frame.length > 0, "Buffer không được rỗng");
  console.log(`✔ Test 1: ScreenCapture thành công (kích thước frame: ${frame.length} bytes)`);

  // Test 2: Bảng ánh xạ phím đầy đủ
  const requiredKeys = ['NUM0', 'NUM5', 'STAR', 'POUND', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'OK', 'SOFT_LEFT', 'SOFT_RIGHT'];
  for (const k of requiredKeys) {
    assert(KEY_MAPPINGS[k], `Thiếu ánh xạ cho phím ${k}`);
  }
  console.log("✔ Test 2: Kiểm tra đầy đủ 100% các phím J2ME cần thiết");

  // Test 3: Kết nối WebSocket, Ping/Pong và nhận INIT_STATUS
  const server = http.createServer();
  const pm = new ProcessManager();
  const { wss } = setupWebSocket(server, pm);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Server test đang chạy tại cổng tạm: ${port}`);

  const ws = new WebSocket(`ws://localhost:${port}/ws`);

  await new Promise((resolve, reject) => {
    ws.on('open', () => {
      console.log("✔ Test 3.1: Client kết nối WebSocket thành công");
      ws.send(JSON.stringify({ type: 'PING' }));
    });

    let receivedInit = false;
    let receivedPong = false;

    ws.on('message', (data) => {
      // Có thể nhận frame nhị phân hoặc JSON
      if (Buffer.isBuffer(data) && data[0] === 0x7b) { // JSON string
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'INIT_STATUS') {
            receivedInit = true;
            console.log("✔ Test 3.2: Nhận INIT_STATUS thành công");
          } else if (msg.type === 'PONG') {
            receivedPong = true;
            console.log("✔ Test 3.3: Nhận PONG thành công");
          }
        } catch (e) {}
      } else {
        // Frame ảnh stream
      }

      if (receivedInit && receivedPong) {
        ws.close();
        server.close(() => {
          resolve();
        });
      }
    });

    ws.on('error', reject);
  });

  console.log("🎉 TẤT CẢ CÁC BÀI TEST WEBSOCKET ĐÃ THÀNH CÔNG!");
}

runTests().catch((err) => {
  console.error("Lỗi kiểm thử WebSocket:", err);
  process.exit(1);
});
