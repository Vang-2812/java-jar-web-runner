#!/bin/bash
set -e

echo "[STARTUP] Khởi tạo màn hình ảo Xvfb trên DISPLAY :99 (242x350x24 - Chuẩn kích thước MicroEmulator)..."
Xvfb :99 -screen 0 242x350x24 -nolisten tcp &
sleep 1

echo "[STARTUP] Khởi động Openbox Window Manager để render cửa sổ game..."
DISPLAY=:99 openbox &
sleep 1

echo "[STARTUP] Khởi động Node.js API & WebSocket Server..."
exec npm start
