#!/bin/bash
set -e

echo "[STARTUP] Khởi tạo màn hình ảo Xvfb trên DISPLAY :99..."
Xvfb :99 -screen 0 800x600x24 -nolisten tcp &
XVFB_PID=$!
sleep 1

echo "[STARTUP] Khởi động Node.js API & WebSocket Server..."
exec npm start
