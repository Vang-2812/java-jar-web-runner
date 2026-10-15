const assert = require('assert');
const net = require('net');
const http = require('http');
const { WebSocket, WebSocketServer } = require('ws');
const { setupWebSocket } = require('../src/wsGateway');
const { packCmdFrame, packDefFrame, OP } = require('../src/commandProtocol');

// Mock ProcessManager
const mockPm = {
  log: () => {},
  getStatus: () => ({ running: true })
};

const server = http.createServer();
const { wss, tcpServer, broadcastCmdFrame } = setupWebSocket(server, mockPm);

server.listen(0, async () => {
  const port = server.address().port;
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
  ws.binaryType = 'arraybuffer';

  let receivedInit = false;
  let receivedFrame = false;

  ws.on('open', () => {
    // Send a test ping
    ws.send(JSON.stringify({ type: 'PING' }));
  });

  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      const bytes = new Uint8Array(data);
      if (bytes[0] === 4) {
        receivedFrame = true;
        ws.close();
        server.close();
        if (tcpServer) tcpServer.close();
        console.log('✔ WebSocket binary command stream test passed!');
      }
    } else {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'INIT_STATUS') {
        receivedInit = true;
        // Broadcast a test frame
        const dummyCmds = Buffer.from([OP.COLOR, 0x00, OP.FILL_RECT, 0, 0, 240, 320]);
        broadcastCmdFrame(240, 320, 0, 0, 240, 320, dummyCmds);
      }
    }
  });
});
