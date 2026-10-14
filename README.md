# NSO Web Runner & J2ME 24/7 AFK Server

> Chạy và Treo Ninja School Online (`NST_X1.jar`) & game Java (.jar) trên Web deploy lên Vercel, hỗ trợ chế độ Headless tiết kiệm CPU (0.1%) cày 24/7 trên Render Cloud miễn phí không lag, kèm tính năng chụp ảnh On-Demand snapshot và bàn phím ảo đầy đủ.

## 🚀 Tính năng nổi bật
- **NSO Bot Treo 24/7 (Headless 0.1% CPU):** Chế độ tối ưu chuyên biệt cho Ninja School Online, tự động lưu `acc.txt`, tự động đăng nhập và duy trì socket game liên tục trên Cloud mà không ngốn tài nguyên CPU.
- **On-Demand Snapshot:** Chụp ảnh màn hình game kiểm tra nhân vật tức thì theo yêu cầu, loại bỏ hoàn toàn hiện tượng lag/nhấp nháy do stream video liên tục gây ra.
- **Deploy Frontend Vercel (Miễn phí):** Giao diện web Vite + React chuẩn Responsive, tải cực nhanh qua CDN toàn cầu.
- **Treo Game 24/7 khi tắt web:** Tiến trình game Java chạy ngầm trên Docker container (Render / Hugging Face Spaces / Koyeb miễn phí), không bị ngắt kết nối khi đóng trình duyệt hay tắt máy tính.
- **Bàn phím ảo & Hỗ trợ phím PC:** Chơi trực tiếp bằng bàn phím máy tính hoặc cụm D-pad điều hướng cảm ứng trên điện thoại.
- **Nạp game linh hoạt:** Tải lên bất kỳ file `.jar` nào từ điện thoại hoặc máy tính để chạy ngay lập tức.

## 📁 Cấu trúc dự án
```
├── frontend/             # Giao diện web triển khai trên Vercel
│   ├── src/
│   │   ├── components/   # NsoConfigForm, NsoStatusCard, NsoSnapshotModal, GameCanvas, VirtualKeypad...
│   │   ├── hooks/        # useKeyboard (phím tắt PC)
│   │   └── services/     # nsoApi, ws, api
│   ├── vercel.json       # Cấu hình deploy Vercel
│   └── package.json
│
├── backend/              # Docker backend chạy ngầm game Java J2ME
│   ├── Dockerfile        # Môi trường OpenJDK 11 + Xvfb + xdotool + Node.js
│   ├── entrypoint.sh     # Khởi tạo màn hình ảo Xvfb :99
│   ├── games/            # Chứa file game NST_X1.jar
│   ├── src/              # nsoBotManager, processManager, wsGateway, screenCapture
│   └── package.json
│
└── docs/
    ├── DEPLOYMENT_GUIDE.md  # Hướng dẫn chi tiết triển khai Vercel & Render
    └── superpowers/         # Tài liệu thiết kế (Spec) và kế hoạch (Plan)
```

## 📖 Hướng dẫn triển khai
Xem tài liệu hướng dẫn từng bước chi tiết tại:
👉 [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
