const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class ScreenCapture {
  constructor(display = ':99') {
    this.display = display;
    this.tempPath = path.join(os.tmpdir(), 'j2me_screen.jpg');
    this.isLinux = process.platform === 'linux';
  }

  captureFrame() {
    return new Promise((resolve) => {
      // Nếu không phải Linux (chạy dev trên Windows)
      if (!this.isLinux) {
        return resolve(this.getFallbackFrame());
      }

      // Tìm cửa sổ của Java / MicroEmulator để chụp đúng cửa sổ game thay vì cả màn hình đen
      exec(`DISPLAY=${this.display} xdotool search --onlyvisible --class java 2>/dev/null | tail -1`, (findErr, stdout) => {
        const windowId = stdout && stdout.trim();
        const target = (windowId && windowId.length > 0) ? windowId : 'root';

        exec(`DISPLAY=${this.display} import -window ${target} -quality 70 ${this.tempPath} 2>/dev/null`, (err) => {
          if (err || !fs.existsSync(this.tempPath)) {
            // Nếu chụp theo windowId lỗi thì fallback sang chụp root
            exec(`DISPLAY=${this.display} import -window root -quality 70 ${this.tempPath} 2>/dev/null`, (rootErr) => {
              if (rootErr || !fs.existsSync(this.tempPath)) {
                return resolve(this.getFallbackFrame());
              }
              this.readAndReturn(resolve);
            });
            return;
          }

          this.readAndReturn(resolve);
        });
      });
    });
  }

  readAndReturn(resolve) {
    fs.readFile(this.tempPath, (readErr, data) => {
      if (readErr) return resolve(this.getFallbackFrame());
      resolve(data);
    });
  }

  getFallbackFrame() {
    const svg = `
      <svg width="240" height="320" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0f172a"/>
        <text x="50%" y="45%" fill="#10B981" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">
          J2ME Game Runner
        </text>
        <text x="50%" y="55%" fill="#94A3B8" font-family="sans-serif" font-size="12" text-anchor="middle">
          Dang khoi dong game...
        </text>
        <text x="50%" y="65%" fill="#64748B" font-family="sans-serif" font-size="10" text-anchor="middle">
          ${new Date().toLocaleTimeString()}
        </text>
      </svg>
    `;
    return Buffer.from(svg);
  }
}

module.exports = { ScreenCapture };
