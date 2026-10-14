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
      // Nếu không phải Linux hoặc không có Xvfb (chạy dev trên Windows)
      if (!this.isLinux) {
        return resolve(this.getFallbackFrame());
      }

      // Trên Linux container: dùng imagemagick import từ Xvfb DISPLAY :99
      exec(`DISPLAY=${this.display} import -window root -quality 60 ${this.tempPath}`, (err) => {
        if (err || !fs.existsSync(this.tempPath)) {
          return resolve(this.getFallbackFrame());
        }

        fs.readFile(this.tempPath, (readErr, data) => {
          if (readErr) return resolve(this.getFallbackFrame());
          resolve(data);
        });
      });
    });
  }

  getFallbackFrame() {
    // Trả về frame mẫu thông báo trạng thái
    const svg = `
      <svg width="240" height="320" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#111827"/>
        <text x="50%" y="45%" fill="#10B981" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">
          Java J2ME Screen
        </text>
        <text x="50%" y="55%" fill="#9CA3AF" font-family="sans-serif" font-size="11" text-anchor="middle">
          Đang chạy trên nền tảng: ${process.platform}
        </text>
        <text x="50%" y="65%" fill="#6B7280" font-family="sans-serif" font-size="10" text-anchor="middle">
          ${new Date().toLocaleTimeString()}
        </text>
      </svg>
    `;
    return Buffer.from(svg);
  }
}

module.exports = { ScreenCapture };
