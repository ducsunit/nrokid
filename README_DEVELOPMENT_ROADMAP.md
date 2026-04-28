# Kế hoạch Triển khai Tính năng Server NRO Kid (Development Roadmap)

Để đảm bảo Server chạy ổn định, không bị "ngợp" tính năng và giữ nhiệt được cộng đồng lâu dài, quá trình phát triển (Dev) nên được chia thành 4 Giai đoạn (Phases) chính. 

---

## 🟢 PHASE 1: Nền Tảng & Kinh Tế Cơ Bản (Tuần 1 - Tuần 4)
*Mục tiêu: Đảm bảo game không có lỗi nghiêm trọng (bug dupe đồ, lỗi kẹt map), cân bằng các chỉ số sức mạnh, và tạo ra chu trình cày cuốc cơ bản cho dân cày.*

### Công việc kỹ thuật:
1. **Cân bằng Chỉ số Server:** (Đã làm) Đưa buff toàn máy chủ về 0% hoặc mức hợp lý để tránh "ảo" sức mạnh.
2. **Hệ thống Điểm danh hàng ngày (Daily Login):** 
   - Tặng quà nhỏ mỗi ngày (Ngọc xanh, Đậu thần).
   - Tặng quà lớn ở mốc 7 ngày (Thẻ đổi tên, Cải trang dùng 3 ngày).
3. **Vòng Quay May Mắn (Lucky Wheel):** 
   - Triển khai vòng quay có cơ chế "Bảo hiểm" (Pity system).
   - Vật phẩm rớt ra: Vàng, Ngọc, Bùa, Cải trang ngẫu nhiên.
4. **Sàn Giao Dịch / Ký Gửi (Auction House):**
   - Đảm bảo tính năng Ký gửi hoạt động trơn tru không lỗi (lưu DB an toàn).
   - Dân cày có thể bán đồ nhặt được lấy Ngọc / Thỏi vàng từ người nạp thẻ.

---

## 🟡 PHASE 2: Tạo Thói Quen & Khởi Động Doanh Thu (Tuần 5 - Tuần 8)
*Mục tiêu: Bắt đầu khai thác doanh thu (Monetization) nhưng vẫn mang lại giá trị lớn cho người chơi, buộc họ phải đăng nhập mỗi ngày.*

### Công việc kỹ thuật:
1. **Hệ thống Nhiệm Vụ Ngày/Tuần (Daily/Weekly Quests):**
   - Bảng nhiệm vụ làm mới lúc 0h00 mỗi ngày.
   - Các nhiệm vụ: Đánh 1000 quái, Hoàn thành 1 lần Doanh Trại, Tiêu 50 Ngọc.
2. **Sổ Sứ Mệnh (Battle Pass):**
   - Dành 1-2 tuần để code giao diện và logic Sổ Sứ Mệnh.
   - Luồng Free: Cày nhiệm vụ nhận Đậu, Vàng.
   - Luồng Premium (Mở bằng tiền thật/Thỏi vàng): Nhận Cải trang VIP vĩnh viễn, Đệ tử VIP.
3. **Aura (Hào quang) & Danh hiệu (Titles):**
   - Bổ sung các file ảnh hiệu ứng (Effects) lấp lánh.
   - Bán danh hiệu trong Shop hoặc làm phần thưởng cho Top Nạp / Top Sức mạnh cuối tháng.

---

## 🟠 PHASE 3: Gắn Kết Cộng Đồng & Cạnh Tranh (Tuần 9 - Tuần 12)
*Mục tiêu: Giải quyết vấn đề "Max cấp không biết làm gì". Tạo ra các cuộc thi đua giữa các Bang hội và cá nhân.*

### Công việc kỹ thuật:
1. **Boss Bang Hội (Clan Boss / Lãnh Địa):**
   - Code thêm NPC hoặc Menu cho Bang chủ gọi Boss (mỗi tuần 1 lần).
   - Boss rơi ra nguyên liệu hiếm để nâng cấp đồ.
2. **Đại Hội Võ Thuật / Cá Cược Thể Thao:**
   - Hoàn thiện map Đại hội võ thuật.
   - Cho phép người chơi ngồi xem đặt cược Vàng/Ngọc vào người thắng.
3. **Phó Bản Sinh Tồn (Battle Royale Mode - Tùy chọn):**
   - Map chỉ mở 1 giờ/ngày. Cào bằng mọi chỉ số người chơi. Đánh nhau nhặt đồ rơi trên đất. Ai sống cuối cùng nhận Quà Đặc Biệt.

---

## 🔴 PHASE 4: Mở Rộng Giới Hạn & Độc Quyền (Tháng 4 trở đi)
*Mục tiêu: Đẩy giới hạn sức mạnh lên một tầm cao mới, ra mắt các chức năng độc quyền chưa từng có ở NRO gốc.*

### Công việc kỹ thuật:
1. **Thức Tỉnh Kỹ Năng (Skill Awakening):**
   - Nâng cấp kỹ năng gốc. Thêm hiệu ứng Đốt cháy, Choáng, Rút máu.
2. **Hệ Thống Pet Đồng Hành:**
   - Ngoài đệ tử, người chơi có thể trang bị thêm 1 Pet bay lơ lửng trên đầu cộng chỉ số (như Rồng Nhỏ, Chó Shiba...).
3. **Sự kiện Theo Mùa (Seasonal Events):**
   - Làm Event Halloween, Noel, Tết Nguyên Đán với các bản đồ và boss riêng biệt để giữ game luôn mới mẻ.
