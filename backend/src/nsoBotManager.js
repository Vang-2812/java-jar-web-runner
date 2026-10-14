const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class NsoBotManager {
  constructor() {
    this.process = null;
    this.config = null;
    this.startedAt = null;
    this.logs = [];
    this.storageDir = path.join(__dirname, '../storage');
    this.accFile = path.join(this.storageDir, 'acc.txt');
    this.configFile = path.join(this.storageDir, 'nso_config.json');

    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }

    // Nạp lại cấu hình cũ nếu có
    if (fs.existsSync(this.configFile)) {
      try {
        this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      } catch (e) {
        this.config = null;
      }
    }
  }

  log(msg) {
    const entry = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.logs.push(entry);
    if (this.logs.length > 500) this.logs.shift();
    console.log(entry);
  }

  saveAccountConfig(accountData) {
    this.config = { ...this.config, ...accountData };
    fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));

    // Định dạng file acc.txt cho các bản Mod Ninja School: username|password|server|map|zone
    const accLine = `${accountData.username || ''}|${accountData.password || ''}|${accountData.server || '1'}|${accountData.map || '0'}|${accountData.zone || '0'}\n`;
    fs.writeFileSync(this.accFile, accLine);

    // Ghi đồng thời vào thư mục gốc và thư mục games phòng trường hợp mod đọc tương đối
    try {
      fs.writeFileSync(path.join(process.cwd(), 'acc.txt'), accLine);
      const gamesDir = path.join(__dirname, '../games');
      if (fs.existsSync(gamesDir)) {
        fs.writeFileSync(path.join(gamesDir, 'acc.txt'), accLine);
      }
    } catch (e) {
      // bỏ qua nếu không thể ghi file phụ
    }

    this.log(`Đã lưu cấu hình tài khoản [${accountData.username || 'ẩn'}] - Server: ${accountData.server || 1}`);
  }

  start(accountData) {
    if (this.process) {
      this.stop();
    }

    if (accountData) {
      this.saveAccountConfig(accountData);
    }

    const gamesDir = path.join(__dirname, '../games');
    let targetJar = null;

    if (fs.existsSync(gamesDir)) {
      const jarCandidates = [
        path.join(gamesDir, 'NST_X1.jar'),
        path.join(gamesDir, '1791991334892_NST_X1.jar')
      ];
      for (const cand of jarCandidates) {
        if (fs.existsSync(cand)) {
          targetJar = cand;
          break;
        }
      }
      if (!targetJar) {
        const found = fs.readdirSync(gamesDir).find(f => f.endsWith('.jar'));
        if (found) targetJar = path.join(gamesDir, found);
      }
    }

    const emulatorJar = path.join(__dirname, '../lib/microemulator.jar');
    const nokiaUiJar = path.join(__dirname, '../lib/microemu-nokiaui.jar');

    const cpList = [emulatorJar];
    if (fs.existsSync(nokiaUiJar)) cpList.push(nokiaUiJar);
    if (targetJar) cpList.push(targetJar);
    const cp = cpList.join(process.platform === 'win32' ? ';' : ':');

    this.log(`🚀 Khởi chạy NSO Bot ở chế độ Headless (Treo ngầm 24/7 tối ưu 0.1% CPU)...`);

    const args = [
      '-Xms32m',
      '-Xmx128m',
      '-Djava.awt.headless=false',
      '-cp',
      cp,
      'org.microemu.app.Main',
      '--resizableDevice',
      '240',
      '320',
      'nso.GameMidlet'
    ];

    const env = { ...process.env, DISPLAY: process.env.DISPLAY || ':99' };

    try {
      this.process = spawn('java', args, { env });
      this.startedAt = new Date();

      this.process.stdout.on('data', (d) => {
        const text = d.toString().trim();
        if (text) this.log(`[GAME] ${text}`);
      });

      this.process.stderr.on('data', (d) => {
        const text = d.toString().trim();
        if (text) this.log(`[GAME_ERR] ${text}`);
      });

      this.process.on('close', (code) => {
        this.log(`Tiến trình NSO Bot kết thúc (exit code: ${code})`);
        this.process = null;
        this.startedAt = null;
      });

      // Tự động nhấn Enter sau 2 giây nếu trên Linux để vượt qua dialog cấp quyền của MicroEmulator
      if (process.platform === 'linux') {
        setTimeout(() => {
          exec('DISPLAY=:99 xdotool key Return 2>/dev/null', () => {});
        }, 2500);
      }
    } catch (err) {
      this.log(`Lỗi khởi chạy NSO Bot: ${err.message}`);
      throw err;
    }

    return this.getStatus();
  }

  stop() {
    if (this.process) {
      this.log('🛑 Đang dừng tiến trình NSO Bot theo yêu cầu...');
      try {
        this.process.kill('SIGTERM');
      } catch (e) {
        this.process.kill('SIGKILL');
      }
      this.process = null;
      this.startedAt = null;
    }
    return this.getStatus();
  }

  getStatus() {
    const isRunning = !!this.process;
    let uptimeSeconds = 0;
    if (isRunning && this.startedAt) {
      uptimeSeconds = Math.floor((Date.now() - new Date(this.startedAt).getTime()) / 1000);
    }

    return {
      running: isRunning,
      username: this.config?.username || null,
      server: this.config?.server || '1',
      map: this.config?.map || '0',
      zone: this.config?.zone || '0',
      options: this.config?.options || {},
      startedAt: this.startedAt,
      uptimeSeconds,
      logs: this.logs.slice(-50)
    };
  }
}

module.exports = { NsoBotManager };
