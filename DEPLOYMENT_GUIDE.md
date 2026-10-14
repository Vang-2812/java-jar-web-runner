# Hướng Dẫn Chi Tiết Triển Khai Hệ Thống Treo Game Java J2ME 24/7 (Vercel + Hugging Face)

Hệ thống được thiết kế theo mô hình tách biệt (Decoupled Architecture) giúp bạn vận hành **100% Miễn Phí** mà vẫn treo được game online liên tục 24/7 kể cả khi tắt máy hoặc đóng trình duyệt web.

---

## 🌟 Tổng quan mô hình triển khai

- **Frontend:** Chạy trên **Vercel** (Miễn phí vĩnh viễn, tốc độ CDN cực nhanh, giao diện Web responsive cho cả Điện thoại & Máy tính).
- **Backend Runner:** Chạy trên **Hugging Face Spaces** dạng Docker Container (Miễn phí **16GB RAM**, 2 vCPU, không cần thẻ ngân hàng, chạy liên tục 24/7).

---

## BƯỚC 1: Triển khai Backend lên Hugging Face Spaces (Miễn phí 16GB RAM)

1. Truy cập [huggingface.co](https://huggingface.co) và đăng ký tài khoản (nếu chưa có).
2. Nhấp vào ảnh đại diện góc phải trên cùng ➔ Chọn **New Space**.
3. Điền thông tin tạo Space:
   - **Space name:** Đặt tên bất kỳ (ví dụ: `my-j2me-runner`).
   - **License:** Chọn `mit` hoặc `apache-2.0`.
   - **Select the Space SDK:** Chọn mục **Docker** ➔ Chọn template **Blank**.
   - **Space hardware:** Chọn mặc định **Free (2 vCPU - 16 GB RAM)**.
   - Nhấp nút **Create Space**.
4. Tải mã nguồn `backend` lên Space:
   - Bạn có thể dùng Git clone Space về máy và copy các file trong thư mục `backend/` vào, hoặc dùng nút **Files ➔ Upload files** trên giao diện web Hugging Face:
     - `Dockerfile`
     - `entrypoint.sh`
     - `package.json`
     - Thư mục `src/` (chứa `index.js`, `processManager.js`, `wsGateway.js`, `screenCapture.js`)
5. Sau khi upload, Hugging Face sẽ tự động kích hoạt tiến trình Build Docker.
6. Khi hoàn tất (Status chuyển sang màu xanh `Running`), bạn lấy đường dẫn công khai của Space:
   - Nhấp vào biểu tượng ba chấm `...` ở góc phải trên cùng của Space ➔ Chọn **Embed this Space** ➔ Copy mục **Direct URL**.
   - Đường dẫn có dạng: `https://<ten-tai-khoan>-<ten-space>.hf.space` (Ví dụ: `https://vangk-my-j2me-runner.hf.space`).

---

## BƯỚC 2: Triển khai Frontend lên Vercel

1. Đẩy toàn bộ source code dự án lên kho lưu trữ **GitHub** của bạn.
2. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
3. Bấm nút **Add New... ➔ Project**.
4. Chọn kho lưu trữ GitHub của bạn.
5. Cấu hình triển khai:
   - **Root Directory:** Bấm nút **Edit** và chọn thư mục `frontend`.
   - **Framework Preset:** Vercel sẽ tự nhận diện là **Vite**.
   - Mở rộng mục **Environment Variables** (Biến môi trường) và thêm:
     - **Key:** `VITE_BACKEND_URL`
     - **Value:** Điền link Backend Hugging Face ở Bước 1 (Ví dụ: `https://vangk-my-j2me-runner.hf.space`).
6. Nhấp nút **Deploy**.
7. Chờ khoảng 30-45 giây, Vercel sẽ hoàn tất và cung cấp cho bạn tên miền miễn phí dạng: `https://your-project.vercel.app`.

---

## BƯỚC 3: Sử dụng và Treo Game 24/7

1. Mở trang web Vercel trên điện thoại hoặc máy tính.
2. Nhìn vào góc trên bên phải, nếu biểu tượng hiện `🟢 Server Online` tức là Web đã kết nối thành công tới Backend.
3. Tại mục **Kho Game & Tải File .JAR**:
   - Bấm chọn hoặc kéo thả file game `.jar` của bạn (Ninja School, Avatar, Ngọc Rồng, v.v.).
   - File sẽ tự động tải lên Backend và tiến trình game bắt đầu khởi động.
4. Màn hình game J2ME sẽ hiển thị trực tiếp trên web:
   - **Trên Điện thoại:** Sử dụng cụm bàn phím ảo Nokia (D-pad, phím 1-9, phím *, #, Softkeys) với hiệu ứng rung nhẹ.
   - **Trên Máy tính:** Sử dụng cụm phím số Numpad và các phím mũi tên để di chuyển và bấm chiêu.
5. Đăng nhập vào nick game, bật các tính năng auto cày quái / làm nhiệm vụ có sẵn trong game.
6. **Bật chế độ Treo 24/7:**
   - Bạn có thể **đóng trình duyệt web, tắt máy tính hoặc tắt nguồn điện thoại**.
   - Nhân vật của bạn **vẫn online 100%** trên máy chủ game thông qua container Hugging Face.
   - Bất cứ khi nào muốn kiểm tra lại, chỉ cần mở lại đường link Vercel để xem màn hình trực tiếp và nhật ký hoạt động (Logs).

---

## 🛠️ Khắc phục sự cố thường gặp (Troubleshooting)

- **Trạng thái báo "Mất kết nối":** 
  - Hãy bấm vào biểu tượng bánh răng **Cài đặt** trên góc web Vercel, kiểm tra xem đường link Backend URL đã nhập đúng chưa và bấm **Kiểm tra kết nối**.
- **Game bị văng khi mất mạng:**
  - Hệ thống Backend có tích hợp cơ chế tự động ghi nhớ session và restart an toàn. Bạn có thể mở web và bấm nút **"Làm mới"** hoặc **"Khởi động treo"** để game nạp lại.
