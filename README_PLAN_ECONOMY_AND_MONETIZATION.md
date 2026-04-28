# README Plan: Economy And Monetization

Tài liệu plan này dùng để triển khai server theo hướng:
- Kinh tế trong game ổn định, không lạm phát quá nhanh.
- Có doanh thu đều, hạn chế pay-to-win.
- Dễ vận hành và dễ điều chỉnh sau khi mở server.

---

## 1) Mục tiêu 90 ngày

### Mục tiêu vận hành
- Giữ chênh lệch lực chiến giữa top nạp và top cày trong ngưỡng kiểm soát.
- Vàng/ngọc lưu thông ổn định (có đủ source và sink).
- Item hiếm giữ giá trị, không mất giá quá nhanh.

### Mục tiêu kinh doanh
- Có doanh thu từ nhiều nguồn: battle pass, gói tháng, skin, tiện ích.
- Không phụ thuộc 100% vào "bán sức mạnh trực tiếp".
- Tối ưu giữ chân người chơi để tăng doanh thu dài hạn.

---

## 2) Công thức giá shop chuẩn

## Công thức tổng quát
`Price = BaseTier * SlotCoef * PowerCoef * RarityCoef * InflationCoef`

Trong đó:
- `BaseTier`: giá nền theo tier map.
- `SlotCoef`: hệ số theo loại item.
- `PowerCoef`: hệ số theo sức mạnh option.
- `RarityCoef`: hệ số theo độ hiếm.
- `InflationCoef`: hệ số chống lạm phát theo tuần.

## Bộ hệ số mặc định

### BaseTier (giá nền)
- T1: 50,000 vàng
- T2: 250,000 vàng
- T3: 1,200,000 vàng
- T4: 5,000,000 vàng
- T5: 18,000,000 vàng

### SlotCoef
- Áo: 1.15
- Quần: 1.10
- Găng: 1.20
- Giày: 1.05
- Nhẫn: 1.25
- Phụ kiện: 1.18

### RarityCoef
- Thường: 1.00
- Hiếm: 1.60
- Rất hiếm: 2.40
- Event giới hạn: 3.00

### InflationCoef
- Mặc định tuần đầu: 1.00
- Nếu vàng lưu thông tăng nhanh: 1.03 -> 1.08
- Nếu kinh tế chậm: 0.97 -> 1.00

## PowerCoef (cách tính nhanh)

`PowerScore = 0.35*ATK% + 0.25*HP% + 0.20*DEF% + 0.10*CRIT + 0.10*NE`

`PowerCoef = 1 + (PowerScore / 100)`

Khuyến nghị:
- `PowerCoef` min 1.00
- `PowerCoef` max 2.20

---

## 3) Khung giá mua/bán và chống lạm phát

### Giá mua từ shop
- Theo công thức ở mục 2.

### Giá bán lại NPC
- 30% giá mua chuẩn.

### Thuế chợ người chơi
- Mặc định: 8%
- Linh hoạt: 5% - 12% theo trạng thái kinh tế.

### Sink vàng bắt buộc
- Phí nâng cấp/combine.
- Phí giao dịch/chợ.
- Phí reset build/đổi nhánh cốt truyện.
- Phí dịch vụ dịch chuyển cao cấp.

---

## 4) Mô hình doanh thu (không quá pay-to-win)

## 4.1 Battle Pass mùa (khuyến nghị chính)
- Chu kỳ: 30-45 ngày.
- Free track + Premium track.
- Premium tập trung vào:
  - Skin
  - Hiệu ứng
  - Token tiện ích
  - Tài nguyên vừa phải

## 4.2 Gói tháng
- Nội dung:
  - stamina/tiện ích hằng ngày
  - buff nhẹ, không vượt trần cân bằng
  - vật phẩm chất lượng cuộc sống

## 4.3 Shop ngoại trang
- Skin, aura, hiệu ứng bay, thú cưỡi.
- Không cho bonus dame quá lớn từ shop nạp.

## 4.4 Gói tân thủ
- Giá thấp, mua 1 lần.
- Tăng conversion người nạp lần đầu.

## 4.5 Token tiện ích
- Đổi tên, đổi build, đổi nhánh story, mở rộng kho.
- Tập trung monetization vào tiện lợi thay vì sức mạnh thô.

---

## 5) Guardrail chống pay-to-win

- Không bán thẳng món vượt trội PvP.
- Không để crit/dame từ nạp vượt trần policy cân bằng.
- Tổng buff combat từ gói nạp nên <= 15-20% lợi thế thực chiến.
- Vật phẩm nạp mạnh nên có đường cày thay thế (chậm hơn).

---

## 6) KPI theo dõi hằng tuần

## Kinh tế trong game
- Tổng vàng sinh ra / tổng vàng bị đốt.
- Median giá 10 item giao dịch nhiều nhất.
- Tỉ lệ item hiếm được tạo mới mỗi ngày.

## Hành vi người chơi
- Retention D1 / D7 / D30.
- Tỉ lệ hoàn thành nội dung season.
- Tỉ lệ người chơi dùng chợ, trade, shop.

## Kinh doanh
- Conversion nạp lần đầu.
- ARPPU.
- Tỉ trọng doanh thu theo kênh (pass/tháng/skin/gói).

---

## 7) Kịch bản điều chỉnh nhanh

### Nếu lạm phát vàng
- Tăng thuế chợ +2%.
- Tăng phí combine 5-10%.
- Giảm drop vàng 5-10%.

### Nếu người chơi thiếu tài nguyên
- Giảm phí dịch vụ 5%.
- Tăng drop nguyên liệu cơ bản 8-12%.
- Mở thêm nhiệm vụ daily nguồn thu ổn định.

### Nếu PvP quá pay-to-win
- Giảm hiệu lực buff từ gói nạp.
- Tăng nguồn cày token cân bằng.
- Hạ trần crit/né nếu cần.

---

## 8) Roadmap triển khai 12 tuần

## Giai đoạn 1 (Tuần 1-2): Nền tảng kinh tế
- Chốt công thức giá shop.
- Chốt bảng tier item/map.
- Bật logging giao dịch và vàng lưu thông.

## Giai đoạn 2 (Tuần 3-5): Monetization lõi
- Ra battle pass mùa 1.
- Ra gói tháng và shop skin cơ bản.
- Ra gói tân thủ.

## Giai đoạn 3 (Tuần 6-8): Tối ưu cân bằng
- Tối ưu thuế chợ + sink.
- Điều chỉnh drop rate theo data tuần đầu.
- Chuẩn hóa anti pay-to-win.

## Giai đoạn 4 (Tuần 9-12): Scale
- Ra mùa 2 với nội dung mới.
- Mở thêm phân tầng gói tiện ích.
- A/B test giá battle pass và gói tháng.

---

## 9) Checklist trước khi mở server

- [ ] Có công thức giá thống nhất cho toàn bộ item shop.
- [ ] Có cơ chế điều chỉnh `InflationCoef` theo tuần.
- [ ] Có đủ gold sink để cân bằng source.
- [ ] Có battle pass + gói tháng + shop skin.
- [ ] Có guardrail chống pay-to-win.
- [ ] Có dashboard KPI tuần.
- [ ] Có playtest 7 ngày với dữ liệu giả lập.

---

## 10) Kết luận

Để server vừa sống tốt vừa kinh doanh được, cần đi theo hướng:
- cân bằng bằng dữ liệu,
- kiếm tiền từ trải nghiệm và tiện ích,
- không đẩy sức mạnh nạp vượt xa người chơi cày.

Plan này giúp bạn có khung triển khai rõ ràng cho 90 ngày đầu và dễ mở rộng về sau.

---

## 11) Kế hoạch triển khai chi tiết theo hạng mục

## 11.1 Cơ cấu đội triển khai

Để vận hành tốt, nên chia vai trò rõ:

- **Game Designer (Economy Owner)**
  - Chịu trách nhiệm công thức giá, sink/source, cân bằng reward.
- **Backend Developer**
  - Triển khai logic shop, battle pass, gói tháng, log giao dịch.
- **LiveOps / Community**
  - Lịch event, gói bán theo tuần, truyền thông.
- **Data Analyst**
  - Dashboard KPI, cảnh báo lạm phát/churn.
- **QA**
  - Test kinh tế, test exploit, test pay flow.

## 11.2 Cấu trúc sản phẩm thương mại (SKU)

Khuyến nghị tối thiểu 12 SKU khi mở:

- **Starter**
  - Starter Basic
  - Starter Plus
- **Subscription**
  - Gói tháng thường
  - Gói tháng premium
- **Battle Pass**
  - Pass thường
  - Pass premium+
- **Cosmetic**
  - Skin lẻ
  - Combo skin + aura
  - Mount/hiệu ứng bay
- **Utility**
  - Gói reset build
  - Gói mở rộng kho
  - Gói vé quay/token

Mỗi SKU phải có:
- Mục tiêu người mua (newbie/midcore/hardcore).
- Trần lợi ích combat.
- Tỷ lệ xuất hiện trong lịch bán.

## 11.3 Quy trình ra quyết định giá

Mỗi lần ra item/gói mới dùng quy trình 5 bước:

1. **Định vị món hàng**
   - Cosmetic / Utility / Progression.
2. **Tính giá nội bộ theo công thức mục 2**
   - Quy đổi về "giá trị vàng tương đương".
3. **Đặt giá bán thực tế**
   - Theo bậc giá cửa hàng (anchor pricing).
4. **Check guardrail pay-to-win**
   - Có vượt trần lợi ích combat không.
5. **A/B test 7 ngày**
   - Chốt giá chính thức theo conversion + ARPPU.

## 11.4 Bậc giá đề xuất (anchor pricing)

Nên dùng ít bậc để người chơi dễ quyết định:

- Gói nhỏ: 19k - 49k
- Gói vừa: 99k - 149k
- Gói lớn: 199k - 299k
- Gói đặc biệt: 499k+

Nguyên tắc:
- Gói nhỏ để tăng first purchase.
- Gói vừa là doanh thu chính.
- Gói lớn cho whale nhưng không phá cân bằng.

---

## 12) Kế hoạch theo từng tuần (12 tuần chi tiết)

## Tuần 1
- Khóa công thức giá item và rule chống lạm phát.
- Chốt danh mục SKU launch.
- Xây dashboard bản 1 (vàng vào/ra, doanh thu ngày).

## Tuần 2
- Triển khai shop version 1 (NPC + chợ).
- Triển khai log giao dịch và phát hiện bất thường.
- QA test exploit trade/chợ.

## Tuần 3
- Ra Starter Pack + Gói tháng.
- Tracking conversion người nạp lần đầu.
- Bật mission nhẹ để kéo DAU.

## Tuần 4
- Ra Battle Pass mùa 1.
- Event liveops đầu tiên (không tăng sức mạnh quá mạnh).
- Đánh giá retention sau pass.

## Tuần 5
- Tối ưu giá pass/gói tháng theo data.
- Điều chỉnh thuế chợ nếu vàng tăng nhanh.
- Thêm sink nhẹ qua dịch vụ tiện ích.

## Tuần 6
- Ra đợt skin/aura mới.
- Bundle cosmetic theo chủ đề tuần.
- Theo dõi tỷ lệ mua cosmetic vs utility.

## Tuần 7
- Cân bằng lại drop rate hiếm theo data thực.
- Rà soát chênh lệch lực chiến top nạp/top cày.
- Nếu lệch cao: nerf lợi ích combat từ gói nạp.

## Tuần 8
- Ra mini event doanh thu ngắn hạn (3-5 ngày).
- Bật ưu đãi quay lại cho user nghỉ >7 ngày.
- Đo uplift doanh thu sự kiện.

## Tuần 9
- Chuẩn bị Battle Pass mùa 2.
- Chốt nội dung reward mới thiên cosmetic + utility.
- A/B test giá pass.

## Tuần 10
- Ra pass mùa 2 + gói tháng điều chỉnh.
- Mở thêm 1 SKU tiện ích mới.
- Theo dõi retention cohort mùa 2.

## Tuần 11
- Tối ưu toàn bộ bảng giá theo hiệu suất 10 tuần.
- Dọn SKU kém hiệu quả.
- Đẩy bundle có tỷ lệ chuyển đổi tốt.

## Tuần 12
- Tổng kết quý:
  - retention,
  - doanh thu,
  - sức khỏe kinh tế.
- Khóa kế hoạch quý sau.

---

## 13) SOP vận hành doanh thu hằng tuần

Mỗi tuần chạy checklist cố định:

### Thứ 2 - Review data
- Doanh thu tuần trước theo SKU.
- Vàng source/sink.
- Chênh lệch lực chiến top.

### Thứ 3 - Quyết định điều chỉnh
- Giá gói nào tăng/giảm.
- Reward nào cần nerf/buff.
- Thuế chợ có đổi hay không.

### Thứ 4 - Triển khai kỹ thuật
- Cập nhật config shop/gói/event.
- QA regression.

### Thứ 5 - Soft launch
- Mở 10-20% user (nếu có flag).
- Theo dõi error + conversion sớm.

### Thứ 6 - Full launch
- Push toàn server.
- Community thông báo + CTA rõ ràng.

### Cuối tuần - Giám sát realtime
- Theo dõi doanh thu/người online.
- Theo dõi bất thường kinh tế.

---

## 14) Kế hoạch truyền thông bán hàng trong game

## 14.1 Khung thông điệp
- 70% nói về trải nghiệm và tiện ích.
- 20% nói về giá trị tiết kiệm (bundle, pass).
- 10% nói về tính hiếm/giới hạn.

## 14.2 Vị trí hiển thị
- Popup login (không quá 1 lần/ngày).
- Banner shop.
- NPC event theo giờ vàng.
- Tin nhắn hệ thống có tần suất giới hạn.

## 14.3 Nhịp campaign
- Tuần thường: 1 campaign chính.
- Tuần event: 2 campaign ngắn + 1 bundle.
- Không chạy >3 ưu đãi lớn cùng lúc.

---

## 15) Quản trị rủi ro kinh doanh

## 15.1 Rủi ro 1: Lạm phát vàng
- Dấu hiệu:
  - giá chợ tăng liên tục 2 tuần,
  - vàng tồn trung vị tăng nhanh.
- Hành động:
  - tăng sink 10-15%,
  - hạ source vàng 5-8%.

## 15.2 Rủi ro 2: Pay-to-win bị phản ứng
- Dấu hiệu:
  - churn nhóm non-payer tăng,
  - cộng đồng phản hồi tiêu cực.
- Hành động:
  - giảm bonus combat từ gói nạp,
  - tăng đường cày thay thế.

## 15.3 Rủi ro 3: Doanh thu thấp hơn kỳ vọng
- Dấu hiệu:
  - conversion < mục tiêu 2 tuần liên tiếp.
- Hành động:
  - tối ưu bậc giá,
  - tăng gói nhỏ,
  - bundle giá trị cao cho mid spender.

---

## 16) Mốc KPI mục tiêu theo giai đoạn

## 16.1 Sau 30 ngày
- D1 >= 35%
- D7 >= 12%
- First purchase conversion >= 3-5%
- Doanh thu pass chiếm >= 25% tổng doanh thu

## 16.2 Sau 60 ngày
- D7 >= 15%
- D30 >= 6-8%
- ARPPU tăng 10-20% so với tháng 1
- Cosmetic + utility >= 40% tổng doanh thu

## 16.3 Sau 90 ngày
- Kinh tế ổn định (source/sink lệch < 15%)
- Pay-to-win complaint giảm theo tuần
- Tăng trưởng doanh thu tháng 3 >= 15% so với tháng 1

---

## 17) Deliverables cần có trước ngày mở server

- [ ] Bảng giá SKU chính thức (file cấu hình).
- [ ] Bảng reward battle pass mùa 1.
- [ ] Bảng gói tháng + quyền lợi.
- [ ] Rule tax/sink theo trạng thái kinh tế.
- [ ] Dashboard KPI tuần + cảnh báo bất thường.
- [ ] SOP vận hành tuần và playbook xử lý khủng hoảng.

