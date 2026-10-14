# Java JAR 24/7 Runner Backend

Docker container chạy ngầm game Java J2ME (.jar) trên môi trường Linux ảo (Xvfb + OpenJDK 11) kết hợp Node.js API và WebSocket streaming.

## Tính năng chính
- Màn hình ảo `Xvfb` siêu nhẹ (~10MB RAM) chạy ngầm không cần GPU.
- Hỗ trợ socket mạng TCP trực tiếp tới Game Server (không bị hạn chế như browser).
- Giới hạn bộ nhớ an toàn (`-Xmx128m`) chống tràn RAM (OOM).
- WebSocket Gateway nạp sự kiện phím ảo (Numpad, Softkeys, D-pad qua `xdotool`) và stream frame màn hình WebP.
- Cổng mặc định `7860` (tương thích 100% với Hugging Face Spaces Free 16GB RAM).

## Deploy lên Hugging Face Spaces (Miễn phí 16GB RAM)
1. Đăng ký/Đăng nhập tại [Hugging Face](https://huggingface.co).
2. Bấm **New Space** -> Đặt tên (ví dụ: `my-java-runner`).
3. Chọn Space SDK là **Docker** -> **Blank**.
4. Upload toàn bộ các file trong thư mục `backend/` lên Space (hoặc push qua git).
5. Space sẽ tự động build và cung cấp link công khai dạng `https://<username>-<spacename>.hf.space`.
