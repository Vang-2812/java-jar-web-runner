# J2ME Web Runner & 24/7 AFK Server

> Chạy và Treo game Java (.jar) trên Web deploy lên Vercel, hỗ trợ bàn phím ảo Nokia và kết nối trực tiếp với backend container miễn phí để duy trì treo game online 24/7 khi tắt web.

## 🚀 Tính năng nổi bật
- **Deploy Frontend Vercel (Miễn phí):** Giao diện web Vite + React chuẩn Responsive, tải cực nhanh qua CDN toàn cầu.
- **Treo Game 24/7 khi tắt web:** Tiến trình game Java chạy ngầm trên Docker container (Hugging Face Spaces 16GB RAM / Koyeb miễn phí), không bị ngắt kết nối khi đóng trình duyệt.
- **Bàn phím ảo Nokia đầy đủ:** Cụm D-pad điều hướng, phím mềm Softkeys (Menu, Trở về), cụm phím số 0-9, *, # có rung phản hồi (Haptic feedback) cho điện thoại cảm ứng.
- **Hỗ trợ phím PC:** Chơi mượt mà bằng cụm phím Numpad và mũi tên trên máy tính.
- **Nạp game linh hoạt:** Tải lên bất kỳ file `.jar` nào từ điện thoại hoặc máy tính để chạy ngay lập tức.
- **Theo dõi thời gian thực:** Stream màn hình game và nhật ký hoạt động (Logs) qua WebSocket.

## 📁 Cấu trúc dự án
```
├── frontend/             # Giao diện web triển khai trên Vercel
│   ├── src/
│   │   ├── components/   # GameCanvas, VirtualKeypad, AfkPanel, GameUploader
│   │   ├── hooks/        # useKeyboard (phím tắt PC)
│   │   └── services/     # Kết nối REST API & WebSocket
│   ├── vercel.json       # Cấu hình deploy Vercel
│   └── package.json
│
├── backend/              # Docker backend chạy ngầm game Java J2ME
│   ├── Dockerfile        # Môi trường OpenJDK 11 + Xvfb + xdotool + Node.js
│   ├── entrypoint.sh     # Khởi tạo màn hình ảo Xvfb :99
│   ├── src/              # ProcessManager, WebSocket Gateway, ScreenCapture
│   └── package.json
│
└── docs/
    ├── DEPLOYMENT_GUIDE.md  # Hướng dẫn chi tiết triển khai Vercel & Hugging Face
    └── superpowers/         # Tài liệu thiết kế (Spec) và kế hoạch (Plan)
```

## 📖 Hướng dẫn triển khai
Xem tài liệu hướng dẫn từng bước chi tiết tại:
👉 [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
