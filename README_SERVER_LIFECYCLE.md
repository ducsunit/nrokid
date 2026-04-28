# Tài Liệu: Luồng Quản Lý Vòng Đời Server (Server Manager Lifecycle)

Tài liệu này giải thích chi tiết chức năng của các đoạn mã quan trọng ở cuối file `ServerManager.java` (từ dòng 514 đến 550), cụ thể là quá trình **Đóng Server (Maintenance)** và **Chạy tác vụ nền (Auto Tasks)**.

## 1. Cơ chế đóng Server an toàn: `close(long delay)`
Hàm `close` được gọi khi Admin dùng lệnh bảo trì trên server hoặc ấn tắt server. Nhiệm vụ của nó là đảm bảo mọi dữ liệu của người chơi và bang hội đều được lưu lại an toàn vào Database trước khi tiến trình (process) thực sự bị tắt đi (tránh bị rollback).

**Quy trình lưu và đóng dữ liệu:**
1. **`dungeonManager.shutdown()`**: Tắt toàn bộ các phó bản (dungeon) đang chạy (Ví dụ: Doanh trại độc nhãn, Bản đồ kho báu...) và đưa người chơi ra ngoài.
2. **`Manager.gI().updateEventCount()`**: Lưu lại các mốc sự kiện (event) mà server đang ghi nhận vào CSDL.
3. **`Manager.gI().updateAttributeServer()`**: Lưu lại các chỉ số buff exp, vàng, HP, Sức đánh... của server (bảng `attribute_server`) để lần mở sau không bị mất buff.
4. **`Client.gI().close()`**: Đây là bước quan trọng nhất. Hàm này sẽ Kick toàn bộ người chơi (Session) đang online, ép buộc tiến trình lưu thông tin nhân vật (`PlayerDAO.updatePlayer()`) xuống MySQL ngay lập tức.
5. **`ClanService.gI().close()`**: Lưu lại dữ liệu Bang hội (Clan), tránh mất điểm cống hiến hoặc thành viên vừa vào bang.
6. **`ConsignManager.getInstance().close()`**: Đóng Ký gửi (Chợ), hoàn trả đồ hoặc lưu lại danh sách vật phẩm người chơi đang đăng bán để không bị mất đồ (Dupe item).
7. **`System.exit(0)`**: Tắt toàn bộ chương trình Java an toàn.

> **💡 Lưu ý cho Dev:** Nếu bạn tạo thêm một bảng dữ liệu mới (Ví dụ: Bảng Bầu cua, Xổ số lưu cache trên RAM), bạn **bắt buộc** phải thêm lệnh lưu dữ liệu của bạn vào hàm `close()` này. Nếu không, khi bảo trì server sẽ mất sạch dữ liệu của tính năng đó.

## 2. Hệ thống tác vụ tự động: `autoTask()`
Hàm `autoTask` sử dụng `ScheduledExecutorService` - một bộ đếm thời gian (Scheduler) được tích hợp sẵn của Java để chạy các công việc ngầm (Background Jobs) lặp đi lặp lại.

**Cơ chế hoạt động:**
* Thread Pool này chỉ được cấp 1 luồng (`Executors.newScheduledThreadPool(1)`), đảm bảo việc cập nhật dữ liệu không tranh chấp tài nguyên (race condition) và không làm lag luồng chính của game.
* **Tần suất chạy:** Cứ sau mỗi `300.000` mili-giây (Tức là **5 Phút** một lần).
* **Nhiệm vụ chính:** Gọi đến `TopManager` để tính toán lại và xếp hạng Bảng Xếp Hạng.
  * `TopManager.getInstance().load()`: Tải Top Sức mạnh.
  * `TopManager.getInstance().load1() / load2() / load3()`: Có thể là tải Top Nạp, Top Nhiệm vụ, Top Bang hội...

## 3. Khởi chạy Phó Bản (Dungeon Manager)
(Thuộc đoạn code dòng 521-523)
```java
dungeonManager = new DungeonManager();
dungeonManager.start();
new Thread(dungeonManager, "Dungeon Manager").start();
```
* Tạo một luồng (Thread) riêng chuyên biệt để chạy thời gian và logic cho Phó bản. Việc tách Thread này rất quan trọng vì nó giúp Server chính không bị lag khi trong game có hàng chục phó bản (đi doanh trại) đang mở cùng lúc.
