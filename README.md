# NSO Web Runner & J2ME 24/7 AFK Server

> Chạy và Treo Ninja School Online (`NST_X1.jar`) & game Java (.jar) trên Web deploy lên Vercel, sở hữu công nghệ **Canvas Command Streaming 60 FPS** (mô phỏng kiến trúc `upnso.com`), tiêu tốn CPU cực thấp (~0.1%), phản hồi phím 0ms và hỗ trợ cày 24/7 trên Render Cloud miễn phí không lag.

## 🚀 Tính năng nổi bật
- **Canvas Command Streaming 60 FPS (Zero Video Stream):** Mô phỏng trực tiếp công nghệ của `upnso.com`. Thay vì quay màn hình OS gây nghẽn CPU, Java chặn các lệnh đồ hoạ (`OP.FILL`, `OP.REGION`, `OP.IMAGE`) và nén qua luồng Deflate nhị phân siêu nhẹ (~1KB/s). Trình duyệt dùng GPU tự vẽ lên `<canvas>` đạt 60 FPS mượt mà.
- **Phản hồi phím tức thì 0ms (Direct Key Injection):** Bắt sự kiện phím PC và D-pad cảm ứng gửi mã phím chuẩn MIDP thẳng vào Game Loop của game (không qua X11 / xdotool).
- **NSO Bot Treo 24/7 (Headless 0.1% CPU):** Tự động lưu `acc.txt`, tự động đăng nhập và duy trì socket game liên tục trên Cloud. Đóng tab web hoặc tắt máy tính thì nhân vật vẫn tiếp tục cày level và yên.
- **On-Demand Snapshot:** Chụp ảnh màn hình tĩnh tức thì theo yêu cầu để kiểm tra nhân vật.
- **Deploy Frontend Vercel (Miễn phí):** Giao diện web Vite + React chuẩn Responsive, tải cực nhanh qua CDN toàn cầu.
- **Bàn phím ảo & Hỗ trợ phím PC:** Chơi trực tiếp bằng bàn phím máy tính hoặc cụm D-pad điều hướng cảm ứng trên điện thoại.

## 📁 Cấu trúc dự án
```
├── frontend/             # Giao diện web triển khai trên Vercel
│   ├── src/
│   │   ├── components/   # CanvasCommandRenderer (60 FPS), GameCanvas, VirtualKeypad, NsoStatusCard...
│   │   ├── hooks/        # useKeyboard (phím tắt PC & MIDP direct keys)
│   │   └── services/     # nsoApi, ws, api
│   ├── vercel.json       # Cấu hình deploy Vercel
│   └── package.json
│
├── backend/              # Docker backend chạy ngầm game Java J2ME
│   ├── Dockerfile        # OpenJDK 11 JDK + Node.js (Biên dịch canvasstream.jar)
│   ├── entrypoint.sh     # Khởi tạo môi trường
│   ├── games/            # Chứa file game NST_X1.jar
│   ├── src/
│   │   ├── java/         # CanvasStreamDriver & J2SEDisplayGraphics hook (AWT/MIDP)
│   │   ├── commandProtocol.js  # Bộ mã hoá/giải mã nhị phân VarInt Zigzag
│   │   ├── wsGateway.js  # TCP Command Bridge (Cổng 9091) & WebSocket Server
│   │   └── processManager.js
│   └── package.json
│
└── docs/
    ├── DEPLOYMENT_GUIDE.md  # Hướng dẫn chi tiết triển khai Vercel & Render
    └── superpowers/         # Tài liệu thiết kế (Spec) và kế hoạch (Plan)
```

## 📖 Hướng dẫn triển khai
Xem tài liệu hướng dẫn từng bước chi tiết tại:
👉 [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
