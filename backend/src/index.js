const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { ProcessManager } = require('./processManager');
const { setupWebSocket } = require('./wsGateway');
const { NsoBotManager } = require('./nsoBotManager');

const app = express();
const server = http.createServer(app);
const pm = new ProcessManager();
const nsoBot = new NsoBotManager();
const wsGateway = setupWebSocket(server, pm);

app.use(cors());
app.use(express.json());

const gamesDir = path.join(__dirname, '../games');
if (!fs.existsSync(gamesDir)) {
  fs.mkdirSync(gamesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, gamesDir);
  },
  filename: (req, file, cb) => {
    // Giữ tên file an toàn, tránh ghi đè
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${cleanName}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Tối đa 50MB cho 1 file .jar
});

// API Kiểm tra trạng thái server
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// API Chụp màn hình trực tiếp để kiểm tra hiển thị
app.get('/api/screenshot', async (req, res) => {
  try {
    const { ScreenCapture } = require('./screenCapture');
    const capturer = new ScreenCapture();
    const frame = await capturer.captureFrame();
    res.type('image/jpeg').send(frame);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API Upload file .jar
app.post('/api/upload', upload.single('game'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không tìm thấy file .jar tải lên' });
  }
  pm.log(`Đã tải lên game mới: ${req.file.filename} (${req.file.size} bytes)`);
  res.json({
    message: 'Tải file .jar thành công',
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size
  });
});

// API Lấy danh sách game có sẵn trên server
app.get('/api/games', (req, res) => {
  try {
    const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.jar'));
    const gameList = files.map(filename => {
      const fullPath = path.join(gamesDir, filename);
      const stat = fs.statSync(fullPath);
      return {
        filename,
        path: fullPath,
        size: stat.size,
        updatedAt: stat.mtime
      };
    });
    res.json(gameList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Bắt đầu phiên treo game thông thường (Interactive session)
app.post('/api/session/start', (req, res) => {
  const { jarPath, gameName } = req.body;
  let targetPath = jarPath;

  if (!targetPath && gameName) {
    targetPath = path.join(gamesDir, gameName);
  }

  if (!targetPath) {
    return res.status(400).json({ error: 'Vui lòng cung cấp jarPath hoặc gameName' });
  }

  try {
    const status = pm.start(targetPath);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Dừng phiên treo game thông thường
app.post('/api/session/stop', (req, res) => {
  const status = pm.stop();
  res.json(status);
});

// API Lấy trạng thái phiên treo hiện tại
app.get('/api/session/status', (req, res) => {
  res.json(pm.getStatus());
});

// ================= NSO BOT 24/7 SPECIALIZED ENDPOINTS =================
// API Bật NSO Bot Treo 24/7 (Headless 0.1% CPU)
app.post('/api/nso/start', (req, res) => {
  try {
    const status = nsoBot.start(req.body);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Dừng NSO Bot
app.post('/api/nso/stop', (req, res) => {
  const status = nsoBot.stop();
  res.json(status);
});

// API Lấy trạng thái NSO Bot
app.get('/api/nso/status', (req, res) => {
  res.json(nsoBot.getStatus());
});

// API Chụp ảnh màn hình theo yêu cầu (On-Demand Snapshot - không tốn CPU nền)
app.get('/api/nso/snapshot', async (req, res) => {
  try {
    const { ScreenCapture } = require('./screenCapture');
    const capturer = new ScreenCapture();
    const frame = await capturer.captureFrame();
    res.type('image/jpeg').send(frame);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 7860;

// Chỉ listen nếu file được chạy trực tiếp (không phải khi require trong test)
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    pm.log(`🚀 Java Runner Backend đang lắng nghe tại cổng ${PORT}`);
  });
}

module.exports = { app, server, pm, nsoBot };
