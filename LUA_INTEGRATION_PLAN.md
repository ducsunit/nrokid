# Lộ trình Nâng cấp & Tối ưu hóa Server NRO Kid

Bản kế hoạch này chia việc tối ưu hóa server thành 5 giai đoạn chính. Bạn nên thực hiện theo thứ tự để đảm bảo tính ổn định của hệ thống.

---

## Giai đoạn 1: Củng cố Nền tảng & Độ ổn định (Stability Foundation)
*Mục tiêu: Loại bỏ tình trạng giật lag (stutter) và nghẽn I/O cơ bản.*

1. **Triển khai Async Player Saving:**
    - Xây dựng `AsyncPlayerDAO` sử dụng `ExecutorService`.
    - Chuyển toàn bộ lệnh `UPDATE player` sang luồng phụ.
2. **Tối ưu hóa Logging:**
    - Cấu hình Log4j với **Async Appender**.
    - Loại bỏ các lệnh `System.out.println` dư thừa trong vòng lặp.
3. **Cấu hình hóa dữ liệu (External Config):**
    - Chuyển các hằng số (Rate rơi đồ, HP/KI khởi tạo) ra file `.yaml` hoặc `.lua`.

---

## Giai đoạn 2: Tích hợp Lua Scripting Cơ bản (Lua Engine)
*Mục tiêu: Giảm sự phụ thuộc vào Java cho các logic thường xuyên thay đổi.*

1. **Thiết lập môi trường Lua:**
    - Thêm thư viện `luaj` vào dự án.
    - Xây dựng lớp `LuaManager.java` để quản lý việc load và thực thi script.
2. **Script hóa hệ thống NPC & Hội thoại:**
    - Chuyển logic `openMenu` và `confirmMenu` từ Java sang Lua.
    - Cho phép cập nhật hội thoại sự kiện (ví dụ: `SummerEvent`) mà không cần restart.
3. **Cơ chế Hot-reload:**
    - Viết lệnh admin để reload toàn bộ script Lua ngay trong game.

---

## Giai đoạn 3: Tối ưu hóa Kiến trúc Đa luồng (Concurrency)
*Mục tiêu: Tăng khả năng xử lý đồng thời cho các Khu vực (Zone).*

1. **Refactor Zone Synchronization:**
    - Thay thế `synchronized` blocks bằng `ConcurrentHashMap` và `CopyOnWriteArrayList`.
    - Tối ưu hóa vòng lặp `update()` trong `Zone.java` (Sử dụng index thay vì tạo bản sao List).
2. **Tra cứu Thực thể O(1):**
    - Sử dụng Map để tìm nhanh Player/Item theo ID thay vì dùng vòng lặp `for`.
3. **Hệ thống Event-Bus:**
    - Xây dựng cơ chế phát sự kiện (Event Emitter) để tách rời logic xử lý Nhiệm vụ/Thành tích khỏi logic Map chính.

---

## Giai đoạn 4: Hiệu năng Cao với Redis Lua (High Load)
*Mục tiêu: Đạt mức chịu tải >1000 CCU và chống Dupe đồ tuyệt đối.*

1. **Tích hợp Redis:**
    - Sử dụng Redis làm lớp đệm dữ liệu (Caching layer) cho các thông số thay đổi liên tục.
2. **Atomic Operations với Lua Script:**
    - Viết Lua script chạy trong Redis cho: **Nhặt đồ**, **Giao dịch (Trade)**, **Vòng quay**.
3. **Bảng xếp hạng (TopManager):**
    - Sử dụng Redis Sorted Sets để tính toán hạng người chơi thời gian thực.

---

## Giai đoạn 5: Nâng cao & AI (Advanced Logic)
*Mục tiêu: Đưa toàn bộ trí tuệ nhân tạo và logic phức tạp ra script.*

1. **AI Boss Scripting:**
    - Toàn bộ hành vi của Boss (Fide, Cadic, Broly) được viết bằng Lua.
    - Cho phép tùy biến skill Boss theo từng map/sự kiện dễ dàng.
2. **Hệ thống Anti-cheat Động:**
    - Các quy tắc kiểm tra Speed/Dame được viết bằng Lua để cập nhật liên tục khi có bản hack mới.
3. **Object Pooling:**
    - Triển khai tái sử dụng các Object `Message` và `ItemMap` để tối ưu bộ nhớ.

---

## Lời khuyên triển khai
- **Ưu tiên Giai đoạn 1 & 2 trước:** Đây là những phần ít rủi ro nhất nhưng mang lại trải nghiệm người dùng tốt hơn ngay lập tức (hết lag khi lưu, cập nhật sự kiện nhanh).
- **Giai đoạn 3 & 4 cần test kỹ:** Vì nó can thiệp sâu vào cấu trúc dữ liệu và network của server.
