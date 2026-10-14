const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class ProcessManager {
  constructor() {
    this.currentProcess = null;
    this.currentGame = null;
    this.startedAt = null;
    this.logs = [];
    this.configPath = path.join(__dirname, '../storage/session.json');
    this.loadPersistedSession();
  }

  log(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}`;
    this.logs.push(entry);
    if (this.logs.length > 500) this.logs.shift();
    console.log(entry);
  }

  loadPersistedSession() {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf8');
        const data = JSON.parse(raw);
        if (data.autoResume && data.lastJarPath && fs.existsSync(data.lastJarPath)) {
          this.log(`Tìm thấy phiên treo trước đó: ${data.lastJarPath}. Đang chuẩn bị phục hồi...`);
        }
      }
    } catch (err) {
      this.log(`Không thể đọc file lưu trạng thái: ${err.message}`);
    }
  }

  persistSession(jarPath, autoResume = true) {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.configPath, JSON.stringify({
        lastJarPath: jarPath,
        autoResume,
        updatedAt: new Date().toISOString()
      }, null, 2));
    } catch (err) {
      this.log(`Lỗi lưu trạng thái session: ${err.message}`);
    }
  }

  getMidletClass(jarPath) {
    try {
      let out = '';
      try {
        out = execSync(`tar -xf "${jarPath}" -O META-INF/MANIFEST.MF 2>/dev/null`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
      } catch (e) {
        try {
          out = execSync(`unzip -p "${jarPath}" META-INF/MANIFEST.MF 2>/dev/null`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
        } catch (e2) {}
      }

      if (out) {
        const match = out.match(/MIDlet-1:\s*[^,]+,[^,]*,\s*([^\r\n]+)/i);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    } catch (err) {}
    return null;
  }

  start(jarPath) {
    if (!jarPath || !fs.existsSync(jarPath)) {
      throw new Error(`File không tồn tại: ${jarPath}`);
    }

    if (this.currentProcess) {
      this.log('Tiến trình cũ đang chạy, tiến hành dừng trước khi nạp game mới.');
      this.stop();
    }

    this.log(`Bắt đầu chạy file game: ${path.basename(jarPath)}`);
    this.persistSession(jarPath, true);

    const emulatorJar = path.join(__dirname, '../lib/microemulator.jar');
    const nokiaUiJar = path.join(__dirname, '../lib/microemu-nokiaui.jar');
    let args;

    if (fs.existsSync(emulatorJar)) {
      // BẮT BUỘC đưa cả microemulator, nokiaui và file game .jar vào classpath!
      const cpList = [emulatorJar];
      if (fs.existsSync(nokiaUiJar)) cpList.push(nokiaUiJar);
      cpList.push(jarPath);

      const cp = cpList.join(process.platform === 'win32' ? ';' : ':');
      const midletClass = this.getMidletClass(jarPath);

      if (midletClass) {
        this.log(`🎯 Tự động chạy MIDlet: ${midletClass}`);
        args = [
          '-Xms32m',
          '-Xmx128m',
          '-Djava.awt.headless=false',
          '-cp',
          cp,
          'org.microemu.app.Main',
          '--resizableDevice',
          '240',
          '320',
          midletClass
        ];
      } else {
        this.log(`Không tìm thấy MIDlet class, chạy launcher: ${path.basename(jarPath)}`);
        args = [
          '-Xms32m',
          '-Xmx128m',
          '-Djava.awt.headless=false',
          '-cp',
          cp,
          'org.microemu.app.Main',
          '--resizableDevice',
          '240',
          '320',
          jarPath
        ];
      }
    } else {
      this.log(`Khởi chạy trực tiếp (Java SE): ${path.basename(jarPath)}`);
      args = [
        '-Xms32m',
        '-Xmx128m',
        '-Djava.awt.headless=false',
        '-jar',
        jarPath
      ];
    }

    const env = {
      ...process.env,
      DISPLAY: process.env.DISPLAY || ':99'
    };

    try {
      this.currentProcess = spawn('java', args, { env });
      this.currentGame = path.basename(jarPath);
      this.startedAt = new Date();

      this.currentProcess.stdout.on('data', (data) => {
        this.log(`[STDOUT] ${data.toString().trim()}`);
      });

      this.currentProcess.stderr.on('data', (data) => {
        this.log(`[STDERR] ${data.toString().trim()}`);
      });

      this.currentProcess.on('close', (code) => {
        this.log(`Tiến trình game [${this.currentGame}] kết thúc với mã: ${code}`);
        this.currentProcess = null;
        this.currentGame = null;
        this.startedAt = null;
      });

      this.currentProcess.on('error', (err) => {
        this.log(`Lỗi tiến trình Java: ${err.message}`);
        this.currentProcess = null;
      });

      // Tự động gửi phím Enter sau 1.5 giây để đảm bảo game vào ngay nếu có màn hình Start
      if (process.platform === 'linux') {
        setTimeout(() => {
          exec('DISPLAY=:99 xdotool key Return 2>/dev/null');
        }, 1500);
      }
    } catch (err) {
      this.log(`Không thể khởi chạy java process: ${err.message}`);
      throw err;
    }

    return this.getStatus();
  }

  stop() {
    if (this.currentProcess) {
      this.log(`Dừng phiên treo game: ${this.currentGame}`);
      try {
        this.currentProcess.kill('SIGTERM');
      } catch (e) {
        this.currentProcess.kill('SIGKILL');
      }
      this.currentProcess = null;
      this.currentGame = null;
      this.startedAt = null;
      this.persistSession('', false);
    }
    return this.getStatus();
  }

  getStatus() {
    const isRunning = !!this.currentProcess;
    let uptimeSeconds = 0;
    if (isRunning && this.startedAt) {
      uptimeSeconds = Math.floor((Date.now() - new Date(this.startedAt).getTime()) / 1000);
    }

    return {
      running: isRunning,
      game: this.currentGame,
      startedAt: this.startedAt,
      uptimeSeconds,
      logs: this.logs.slice(-50)
    };
  }
}

module.exports = { ProcessManager };
