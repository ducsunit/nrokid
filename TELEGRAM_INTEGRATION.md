# Tài liệu Tích hợp Telegram Bot vào Server NRO Kid

Việc tích hợp Telegram Bot giúp Admin quản lý server từ xa và tăng trải nghiệm tương tác cho người chơi.

---

## 1. Các tính năng chính (Key Features)

### A. Đối với Quản trị viên (Admin Tools)
- **Thông báo trạng thái (Alerts):** 
    - Nhắn tin khi Server khởi động thành công.
    - Cảnh báo khi Server bị Crash hoặc lỗi SQL nghiêm trọng.
    - Báo cáo số người Online (CCU) mỗi giờ.
- **Điều khiển từ xa (Commands):**
    - `/baotri [phút]`: Thực hiện đếm ngược bảo trì.
    - `/kick [tên]`: Đá người chơi khỏi game.
    - `/reload`: Load lại các script Lua hoặc cấu hình mà không cần restart.
- **Quản lý tài chính:** Thông báo ngay lập tức khi có người chơi nạp thẻ (loại thẻ, mệnh giá, trạng thái).

### B. Đối với Người chơi (Player Services)
- **Bảo mật 2 lớp (2FA):** Gửi mã OTP qua Telegram khi đăng nhập ở IP mới.
- **Tự phục vụ (Self-service):**
    - Đổi mật khẩu, mở khóa tài khoản.
    - Tra cứu chỉ số nhân vật, vật phẩm trong túi đồ.
- **Thông báo săn Boss:** Bot tự động nhắn vào nhóm khi có Boss (Broly, Fide, Super Broly) xuất hiện hoặc bị tiêu diệt.

---

## 2. Hướng dẫn thiết lập (Setup)

### Bước 1: Tạo Bot trên Telegram
1. Chat với `@BotFather` trên Telegram.
2. Dùng lệnh `/newbot` để tạo bot mới và lấy **API Token**.
3. Lấy **Chat ID** của bạn (hoặc nhóm Admin) thông qua `@userinfobot`.

### Bước 2: Cấu hình trong Server
Thêm các thông số sau vào file cấu hình (ví dụ `server.properties` hoặc file Lua config):
```properties
telegram.bot.token=YOUR_API_TOKEN
telegram.admin.chat_id=YOUR_CHAT_ID
telegram.enable=true
```

---

## 3. Kiến trúc triển khai (Technical Architecture)

### Lựa chọn 1: Sử dụng HTTP Request (Khuyên dùng - Nhẹ)
Sử dụng thư viện `HttpURLConnection` của Java để gửi tin nhắn thông qua API của Telegram:
`https://api.telegram.org/bot[TOKEN]/sendMessage?chat_id=[ID]&text=[CONTENT]`

### Lựa chọn 2: Sử dụng Thư viện (Đầy đủ tính năng)
Sử dụng thư viện `telegrambots` (Maven) để xử lý các lệnh chat (Commands) phức tạp hơn từ người chơi.

---

## 4. Lộ trình thực hiện (Roadmap)

1. **Giai đoạn 1 (Cơ bản):** Xây dựng lớp `TelegramService` để gửi thông báo từ Server lên Telegram (Start/Stop/Crash).
2. **Giai đoạn 2 (Admin):** Thực hiện các lệnh điều khiển server cơ bản qua Telegram.
3. **Giai đoạn 3 (Người chơi):** Tích hợp thông báo Boss và tra cứu thông tin nhân vật.
4. **Giai đoạn 4 (Bảo mật):** Triển khai hệ thống mã OTP và xác thực 2 lớp qua Telegram.

---

## 5. Ví dụ Code mẫu (Java)

```java
public void sendAdminAlert(String message) {
    String urlString = "https://api.telegram.org/bot%s/sendMessage?chat_id=%s&text=%s";
    urlString = String.format(urlString, TOKEN, ADMIN_CHAT_ID, URLEncoder.encode(message, "UTF-8"));
    
    URL url = new URL(urlString);
    URLConnection conn = url.openConnection();
    InputStream is = new BufferedInputStream(conn.getInputStream());
}
```
