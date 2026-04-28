# Kế Hoạch Chi Tiết: PHASE 1 (Nền Tảng & Kinh Tế Cơ Bản)

Giai đoạn 1 (Tháng đầu tiên) là giai đoạn quan trọng nhất để quyết định xem Server có "sập" sớm hay không. Mục tiêu là cân bằng chỉ số không để lạm phát và tạo tính năng cơ bản giữ chân người chơi.

Dưới đây là chi tiết kỹ thuật từng bước cần code:

---

## Task 1: Cân bằng Chỉ Số Server (Balance Server)
**Vấn đề:** Các chỉ số TNSM, HP, KI gốc quá ảo, người chơi nhanh chán.
**Cách làm:**
1. Mở Cơ sở dữ liệu (MySQL), vào bảng `attribute_server`.
2. Update toàn bộ cột `value` về `0` hoặc mức thấp `10-20` (Ví dụ: TNSM = 10, Vàng = 0, HP = 0).
3. **Mã nguồn liên quan:** `nro.server.ServerManager` (Hàm updateAttributeServer).
4. Khởi động lại Server để áp dụng chỉ số gốc.

---

## Task 2: Hệ Thống Điểm Danh Hàng Ngày (Daily Attendance)
**Mục tiêu:** Kéo người chơi online mỗi ngày. Có mốc nhận thưởng ngày thứ 7.
**Cách làm:**
1. **Database:** Thêm 2 cột `last_time_diemdanh` (BIGINT) và `count_diemdanh` (INT) vào bảng `player`.
2. **Models (`Player.java`):** Khai báo 2 biến `long lastTimeDiemDanh` và `int countDiemDanh`.
3. **DAOs (`PlayerDAO.java`):** 
   - Hàm `loadPlayer`: Đọc 2 cột trên gán vào biến.
   - Hàm `updatePlayer`: Lưu 2 biến này xuống DB.
4. **NPC Logic (`NpcFactory.java` hoặc `MenuDialog.java`):**
   - Thêm nút "Điểm danh" cho NPC Bò Mộng (Quy lão).
   - Hàm xử lý: Dùng `System.currentTimeMillis()` so sánh khác ngày với `lastTimeDiemDanh`.
   - Quà tặng: `ItemService.gI().createNewItem()` hoặc cộng thẳng Ngọc xanh (`player.inventory.gem += 100`).
   - Nếu `countDiemDanh == 7` -> Tặng quà to (Cải trang VIP) và reset về 0.

---

## Task 3: Vòng Quay May Mắn Có Bảo Hiểm (Lucky Wheel with Pity)
**Mục tiêu:** Hút Ruby/Ngọc của người chơi nhưng không làm họ bực tức vì đen đủi.
**Cách làm:**
1. **Cơ chế Bảo Hiểm (Pity):** Thêm cột `lucky_spin_count` (INT) vào DB.
2. **Logic Quay (`LuckyRoundService.java` hoặc tương tự):**
   - Mỗi lần người chơi tốn 10 Ngọc để quay, `lucky_spin_count++`.
   - Random rớt đồ rác, bùa, vàng...
   - **ĐIỂM NHẤN:** Nếu `lucky_spin_count == 50` (Đã quay 50 lần mà không trúng đồ VIP) -> Bắt buộc nhét 1 món Đồ Vĩnh Viễn vào rương và reset `lucky_spin_count = 0`. Thông báo: *"Chúc mừng bạn đã nhận được Quà Bảo Hiểm vòng quay!"*.
3. **Mã nguồn liên quan:** Thư mục `nro.services.func.LuckyRound` (Tìm lệnh `cmd = -127` trong Controller).

---

## Task 4: Sàn Ký Gửi / Chợ Đen (Auction House)
**Mục tiêu:** Tạo thị trường giao dịch cho dân cày kiếm lời từ đại gia.
**Cách làm:**
1. **Kiểm tra tính năng gốc:** Hầu hết mã nguồn NRO đều có sẵn file `ConsignManager.java` (Quản lý Ký gửi) hoặc `ShopKyGuiService.java`.
2. **Sửa đổi Tiền tệ:** 
   - Đảm bảo trong mã nguồn cho phép mua bán bằng **Thỏi Vàng** hoặc **Hồng Ngọc** thay vì chỉ dùng Vàng (Vì Vàng rất dễ lạm phát).
3. **Bảo mật (Anti-Dupe):**
   - Khi treo đồ lên chợ: Phải trừ Item trong hành trang trước -> Lưu `PlayerDAO.updatePlayer()` -> Mới đưa Item vào danh sách Chợ (`ConsignManager`).
   - Hàm `close()` trong `ServerManager` (Dòng 533) phải gọi `ConsignManager.getInstance().close()` để trả đồ về cho người chơi nếu tắt server đột ngột.

---

## Lộ Trình Code Gợi Ý (Timeline)
- **Ngày 1-2:** Fix Database và Cân bằng. Test thử quá trình cày level từ cấp 1 xem có bị nhanh quá không.
- **Ngày 3-4:** Viết xong hệ thống Điểm danh hàng ngày. Test chuyển ngày (thay đổi giờ trên máy tính) để xem có nhận được tiếp không.
- **Ngày 5-6:** Can thiệp vào Vòng quay may mắn, thêm biến Pity (Bảo hiểm) và thiết kế phần thưởng.
- **Ngày 7:** Rà soát lại Sàn Ký gửi, nhờ vài bạn bè vào test bug dupe đồ (treo đồ xong rút mạng đột ngột xem có bị đúp lên 2 món không).

> **Lời khuyên:** Phase 1 là nền móng. Tuyệt đối không bán các Cải Trang cộng quá nhiều % Sức đánh trong giai đoạn này, hãy để dành chúng cho Sổ Sứ Mệnh ở Phase 2.
