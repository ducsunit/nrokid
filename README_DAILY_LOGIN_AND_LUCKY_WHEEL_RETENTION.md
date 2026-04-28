# README: Cơ chế điểm danh hằng ngày và vòng quay may mắn giữ chân user

Tài liệu này mô tả thiết kế đầy đủ cho 2 cơ chế retention:
- Điểm danh hằng ngày (Daily Login)
- Vòng quay may mắn (Lucky Wheel)

Mục tiêu: tăng tỉ lệ quay lại mỗi ngày, tăng độ gắn bó tuần/tháng, nhưng không phá cân bằng game.

---

## 1) Mục tiêu sản phẩm

## 1.1 Mục tiêu retention
- Tăng D1/D7/D30.
- Tạo thói quen vào game mỗi ngày.
- Cho người chơi cảm giác luôn có "tiến bộ nhỏ" kể cả chơi ngắn.

## 1.2 Mục tiêu kinh tế
- Phần thưởng có giá trị nhưng không làm lạm phát.
- Vật phẩm hiếm vẫn hiếm.
- Không biến tính năng thành pay-to-win mạnh.

---

## 2) Cơ chế điểm danh hằng ngày

## 2.1 Thiết kế cơ bản

- Chu kỳ: 28 ngày (tháng chuẩn).
- Mỗi ngày nhận 1 mốc thưởng.
- Có mốc thưởng lớn ở ngày 7, 14, 21, 28.
- Khi đủ 28 ngày:
  - reset vòng mới,
  - nhận thêm thưởng hoàn thành tháng.

## 2.2 Chính sách chuỗi ngày

Khuyến nghị:
- Không reset chuỗi ngay khi nghỉ 1 ngày.
- Cho phép "miss protection":
  - nghỉ 1 ngày: vẫn giữ streak, chỉ không nhận mốc đó.
  - nghỉ 2 ngày liên tiếp: giảm streak -1.
  - nghỉ >3 ngày: reset streak.

Lý do:
- Giảm áp lực và giảm churn do lỡ 1 ngày.

## 2.3 Loại phần thưởng điểm danh

Nên chia 4 nhóm:
- Tài nguyên cơ bản (vàng, nguyên liệu nâng cấp nhẹ).
- Tiện ích (vé quay, stamina, vật phẩm hỗ trợ).
- Token đổi quà (shop điểm danh riêng).
- Mốc lớn (ngày 7/14/21/28): rương hoặc vật phẩm hiếm giới hạn.

Nguyên tắc:
- 70% reward là giá trị ổn định, dễ dùng.
- 25% reward là giá trị trung bình.
- 5% reward là "wow moment" theo mốc lớn.

---

## 3) Cơ chế vòng quay may mắn

## 3.1 Nguồn vé quay

- Miễn phí:
  - 1 vé/ngày từ điểm danh hoặc nhiệm vụ ngắn.
  - thêm vé từ hoạt động tuần/sự kiện.
- Trả phí:
  - mua vé bằng token/ngọc.
  - gói tháng có thể tặng 1 vé/ngày.

## 3.2 Loại vòng quay

Nên có 2 vòng:
- Vòng thường:
  - reward an toàn, phục vụ số đông.
- Vòng season/event:
  - reward giới hạn mùa, cosmetic/token hiếm.

## 3.3 Tỉ lệ đề xuất (vòng thường)

| Nhóm thưởng | Tỉ lệ |
|---|---:|
| Tài nguyên cơ bản | 45% |
| Tài nguyên trung bình | 30% |
| Vé/quà utility | 15% |
| Item hiếm | 8% |
| Item rất hiếm | 2% |

Lưu ý:
- Không để item rất hiếm >2-3% nếu có tác động sức mạnh.

## 3.4 Pity system (chống đen)

Khuyến nghị bắt buộc:
- Nếu 20 lượt chưa ra item hiếm -> lượt 21 tăng tỉ lệ hiếm x2.
- Nếu 40 lượt chưa ra item hiếm -> đảm bảo ra 1 item hiếm.

Mục tiêu:
- Giảm cảm giác "quay vô vọng".
- Tăng trải nghiệm công bằng dài hạn.

---

## 4) Chống abuse và gian lận

## 4.1 Ràng buộc tài khoản
- Điểm danh theo `account_id`, không chỉ theo character.
- Cùng account không nhận nhiều lần/ngày.

## 4.2 Ràng buộc thiết bị/IP (mềm)
- Đánh dấu hành vi bất thường:
  - nhiều account nhận cùng thời điểm/cùng IP.
- Không khóa ngay; đưa vào danh sách kiểm tra rủi ro.

## 4.3 Ràng buộc vòng quay
- Mọi kết quả quay phải roll phía server.
- Client chỉ hiển thị kết quả server trả về.
- Log đầy đủ:
  - thời điểm quay,
  - bảng tỉ lệ lúc quay,
  - kết quả nhận.

---

## 5) Thiết kế dữ liệu đề xuất

## 5.1 Bảng điểm danh

`player_daily_login`
- `player_id`
- `last_claim_date`
- `streak_day`
- `month_cycle`
- `total_claimed_in_cycle`
- `updated_at`

## 5.2 Bảng vòng quay

`player_lucky_wheel`
- `player_id`
- `free_spin_date`
- `ticket_count`
- `pity_counter`
- `last_spin_at`
- `updated_at`

## 5.3 Bảng log quay

`lucky_wheel_logs`
- `id`
- `player_id`
- `wheel_type`
- `spin_type` (free/ticket/paid)
- `reward_id`
- `reward_qty`
- `pity_before`
- `pity_after`
- `created_at`

---

## 6) Quy tắc cân bằng reward để không phá game

- Reward combat trực tiếp trong vòng quay chỉ nên ở mức vừa.
- Item mạnh nên:
  - giới hạn số lượng theo tuần/tháng,
  - hoặc đổi bằng token tích lũy.
- Reward nên ưu tiên:
  - nguyên liệu,
  - tiện ích,
  - cosmetic.

Trần khuyến nghị:
- Giá trị reward quay/ngày <= 1.2x giá trị farm 20-30 phút.

---

## 7) UX flow đề xuất

## 7.1 Điểm danh
- Khi login:
  - popup nhỏ "Bạn có quà điểm danh hôm nay".
- Nhận quà 1 chạm.
- Hiển thị lịch 28 ngày với mốc lớn nổi bật.

## 7.2 Vòng quay
- Sau khi nhận điểm danh:
  - gợi ý quay miễn phí (nếu có).
- Hiển thị pity progress rõ:
  - "Còn X lượt để chắc chắn quà hiếm".

---

## 8) KPI theo dõi hiệu quả giữ chân

Theo dõi theo tuần:
- Tỉ lệ user nhận điểm danh/ngày.
- Tỉ lệ user quay miễn phí/ngày.
- Số phiên trung bình sau khi nhận điểm danh.
- D1/D7/D30 trước và sau khi triển khai.
- Tỉ lệ user nghỉ 7 ngày.

Ngưỡng tham chiếu tốt:
- Daily claim rate >= 55% DAU.
- Free spin participation >= 40% DAU.
- D7 tăng >= 8-15% sau 2-4 tuần.

---

## 9) Roadmap triển khai

## Giai đoạn 1 (1 tuần) - MVP
- Điểm danh 7 ngày.
- Vòng quay thường + vé miễn phí/ngày.
- Log cơ bản.

## Giai đoạn 2 (1-2 tuần)
- Nâng lên lịch 28 ngày.
- Thêm pity system.
- Thêm shop token đổi quà.

## Giai đoạn 3 (2 tuần)
- Vòng quay season/event.
- Dashboard KPI retention.
- A/B test tỉ lệ và reward.

---

## 10) Checklist nghiệm thu

- [ ] Chỉ nhận điểm danh 1 lần/ngày/account.
- [ ] Lịch ngày và streak hoạt động đúng.
- [ ] Vòng quay trả kết quả đúng tỉ lệ server.
- [ ] Pity system hoạt động đúng mốc.
- [ ] Log quay đầy đủ để audit.
- [ ] Reward không vượt trần cân bằng kinh tế.
- [ ] KPI retention có dashboard theo tuần.

---

## 11) Kết luận

Điểm danh + vòng quay là cặp cơ chế giữ chân rất mạnh nếu:
- phần thưởng đủ hấp dẫn mỗi ngày,
- có "điểm rơi cảm xúc" (mốc lớn, pity),
- và giữ cân bằng kinh tế không để lạm phát hoặc pay-to-win.

Nên triển khai theo MVP nhanh, đo KPI sau 2 tuần rồi tinh chỉnh tỉ lệ/reward bằng dữ liệu thực tế.
