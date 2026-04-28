# Công thức cân bằng chỉ số dựa trên data SQL hiện tại

Tài liệu này được xây từ dữ liệu trong `nro_kid (1).sql`, mục tiêu là đưa ra công thức tính chỉ số bám sát server hiện tại để tránh quá ảo.

---

## 1) Các mốc dữ liệu gốc lấy từ SQL

## 1.1 Giới hạn tăng điểm từ `power_limit`

Bảng `power_limit` đang cho trần điểm gốc (hpg/mpg/dameg/defg/critg) như sau:

- Mốc cao nhất (`id=12`):
  - `hp = 600,000`
  - `mp = 600,000`
  - `damage = 40,000`
  - `defense = 2,100`
  - `critical = 11`

Lưu ý quan trọng trong code:
- `def` thực chiến = `defg * 4 + defAdd` (nên 2,100 def gốc tương đương khoảng 8,400 def sheet trước option/buff).
- `% giảm sát thương` (`tlGiamst`) đã cap 60%.

## 1.2 Dải HP quái từ `mob_template`

Quan sát các cụm mob:
- Early: 200 -> 3,000 HP
- Mid thấp: 6,000 -> 30,000 HP
- Mid cao: 50,000 -> 180,000 HP
- End thường: 300,000 -> 550,000 HP
- End nâng cao: 1,000,000 -> 3,000,000 HP
- Boss/world đặc biệt: 40,000,000+

## 1.3 Mặt bằng giá shop từ `item_shop`

Dải giá đồ cơ bản tăng theo cụm khá rõ:
- 500 -> 5,000 -> 10,000 -> 20,000 -> 50,000 -> 100,000 -> 200,000 -> 500,000
- Sau đó nhảy cụm:
  - 2,000,000
  - 5,800,000
  - 17,000,000
  - 52,000,000

=> Đây là thang giá chuẩn đang được dùng, nên giữ làm anchor để thêm đồ mới.

---

## 2) Công thức suy ra chỉ số player hợp lý từ `power_limit`

Thay vì đặt số cảm tính, dùng công thức theo hệ số từ trần gốc:

Ký hiệu:
- `HPg = power_limit.hp`
- `MPg = power_limit.mp`
- `DMGg = power_limit.damage`
- `DEFg = power_limit.defense`
- `CRITg = power_limit.critical`

## 2.1 Chỉ số sheet mục tiêu theo profile build

### Build trung bình (khuyến nghị)
- `HP_sheet = HPg * 2.8 ~ 4.2`
- `MP_sheet = MPg * 2.3 ~ 3.8`
- `DMG_sheet = DMGg * 5.5 ~ 8.5`
- `DEF_sheet = (DEFg*4) * 2.0 ~ 3.2`
- `CRIT_sheet = CRITg + 28 ~ 50` (đừng vượt 75)

### Build cận trần (vẫn an toàn)
- `HP_sheet <= HPg * 6.5`
- `MP_sheet <= MPg * 5.5`
- `DMG_sheet <= DMGg * 14`
- `DEF_sheet <= (DEFg*4) * 5.5`
- `CRIT_sheet <= 75`
- `NE_sheet <= 35`

Với mốc `id=12`:
- `HP_sheet` trung bình nên ở khoảng `1.7m - 2.5m`
- `DMG_sheet` trung bình nên ở khoảng `220k - 340k`
- `DMG_sheet` cận trần không nên quá `560k`

---

## 3) Công thức tạo chỉ số cho đồ mới (bám data server)

## 3.1 Bước 1: xác định ngân sách món đồ

`ItemImpact%` theo độ hiếm:
- Thường: 4-6%
- Hiếm: 6-9%
- Rất hiếm: 9-12%
- Event giới hạn: 10-12% (không vượt)

## 3.2 Bước 2: phân bổ theo slot

Ví dụ:
- Găng: công 60%, crit 25%, hp 15%
- Áo: def 45%, hp 40%, né 15%
- Quần: hp 55%, def 30%, mp 15%
- Giày: mp 45%, né 30%, hp 25%
- Nhẫn: atk 40%, crit 30%, hp 20%, né 10%

## 3.3 Bước 3: tính option đề xuất

`DeltaX% = ItemImpact% * wX`

Ví dụ món găng hiếm, `ItemImpact=8%`:
- `% dame` ≈ `4.8%` (làm tròn 4-6%)
- `crit` ≈ `2%` (làm tròn 1-3%)
- `% hp` ≈ `1.2%` (làm tròn 1-2%)

---

## 4) Công thức tạo mob/boss mới từ dải SQL hiện có

## 4.1 Mob thường theo tier map

Chọn mốc HP cơ sở từ cụm cũ, rồi scale:

`HP_mob_new = HP_band_median * ZoneCoef * DifficultyCoef`

Trong đó:
- `ZoneCoef`: 0.9 -> 1.2 (độ khó map)
- `DifficultyCoef`:
  - thường: 1.0
  - tinh anh: 2.8 - 4.5
  - mini boss map: 8 - 14

`Dame_mob_new`:
- ưu tiên theo tỉ lệ HP player trung bình cùng tier:
  - mob thường gây `2% - 4.5% HP_player / hit`
  - tinh anh gây `4% - 7% HP_player / hit`

## 4.2 Boss

`HP_boss_new = HP_mob_tier * BossCoef`

`BossCoef`:
- boss map thường: 20 - 45
- boss event mạnh: 50 - 120
- world boss: 150+

`Dame_boss_new`:
- đòn thường: `5% - 9% HP_player / hit`
- skill mạnh: `12% - 20% HP_player / hit` (có telegraph)

Mục tiêu thời gian:
- solo boss map thường: 45 - 90 giây
- party 3-5 người: 25 - 50 giây

---

## 5) Công thức giá bán đồ mới theo mặt bằng `item_shop`

Dùng cụm giá có sẵn làm anchor, không tự đặt lung tung:

`Price = AnchorTierPrice * SlotCoef * RarityCoef * PowerCoef`

Anchor tier (theo cụm SQL):
- Cụm 1: 500 -> 500k
- Cụm 2: 2m -> 52m
- Cụm 3: 68m -> 150m

Khuyến nghị:
- đồ cùng tier chỉ dao động trong `0.7x -> 1.4x` anchor cùng cụm.
- tránh nhảy giá >2x giữa 2 món cùng slot/cùng tier.

---

## 6) Rule kiểm tra pass/fail sau khi thêm content

Nếu một món hoặc một map mới gây ra các dấu hiệu sau thì đang quá ảo:
- quái thường chết ổn định dưới 2 hit;
- boss map thường chết dưới 30 giây solo;
- PvP cùng tier kết thúc dưới 15 giây;
- crit trung bình nhóm top vượt 75%;
- né trung bình nhóm top vượt 35%.

Cách sửa:
- giảm `ItemImpact%` 10-20%;
- hạ các option công (0/49/50/147/14);
- tăng nhẹ HP/def mob 10-15% ở map bị farm quá nhanh.

---

## 7) Kết luận áp dụng cho server hiện tại

Với data hiện có (trần gốc 600k HP, 40k dame, 2.1k def, crit 11), hướng cân bằng an toàn là:
- giữ player trung bình quanh `3x-4x` HP gốc và `6x-9x` dame gốc;
- không để build phổ biến vượt `14x` dame gốc;
- dùng thang giá `item_shop` hiện tại làm anchor khi ra đồ mới;
- scale mob/boss theo dải HP đã có trong `mob_template`, không nhảy bậc bất thường.

Làm đúng các công thức trên sẽ giúp server giữ được cảm giác mạnh dần nhưng không vỡ meta.
